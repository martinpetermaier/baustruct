/**
 * Inngest Background Job: CO2 Calculation on Delivery Confirmation
 * Rainman 👨🏻‍🔧 | 2026-03-11
 *
 * Triggered by: delivery/confirmed event
 * Writes to: delivery_note_line_co2 table
 * Updates: project_esg_snapshots (daily materialized view)
 */

import { inngest } from './client';
import { calculateDeliveryCO2, normalizeToKg } from '../lib/co2-calculator';
import type { DeliveryLineInput } from '../lib/co2-calculator';

// ─── Event Types ──────────────────────────────────────────────────────────

interface DeliveryConfirmedEvent {
  name: 'delivery/confirmed';
  data: {
    deliveryNoteId: string;
    companyId: string;
    projectId: string;
    supplierId: string;
    deliveryDate: string; // ISO date string
    confirmedByUserId: string;
    lineItems: Array<{
      id: string;
      materialCode: string;       // from ERP sync
      materialDescription: string;
      quantity: number;
      unit: string;               // kg | t | m3 | m2 | pcs | l
    }>;
  };
}

// ─── CO2 Calculation Job ──────────────────────────────────────────────────

export const calculateDeliveryNotesCO2 = inngest.createFunction(
  {
    id: 'calculate-delivery-co2',
    name: 'Calculate CO2 for Delivery Note',
    retries: 3,
  },
  { event: 'delivery/confirmed' },

  async ({ event, step }) => {
    const { data } = event as DeliveryConfirmedEvent;

    // Step 1: Normalize quantities to kg + calculate CO2
    const co2Results = await step.run('calculate-co2', async () => {
      const lines: DeliveryLineInput[] = data.lineItems.map(item => ({
        id:                  item.id,
        materialCode:        item.materialCode || 'UNKNOWN',
        materialDescription: item.materialDescription,
        quantityKg:          normalizeToKg(item.quantity, item.unit, item.materialCode),
        deliveryDate:        new Date(data.deliveryDate),
        projectId:           data.projectId,
        companyId:           data.companyId,
        supplierId:          data.supplierId,
      }));

      return calculateDeliveryCO2(lines);
    });

    // Step 2: Persist CO2 results to DB
    await step.run('persist-co2-results', async () => {
      const { db } = await import('../lib/db');  // Prisma client

      await db.deliveryNoteLineCo2.createMany({
        data: co2Results.results.map(r => ({
          deliveryNoteLineId:   r.deliveryNoteLineId,
          projectId:            r.projectId,
          companyId:            r.companyId,
          co2KgA1A3:            r.co2KgA1A3,
          co2KgA4:              r.co2KgA4,
          co2KgTotal:           r.co2KgTotal,
          co2Scope:             r.co2Scope,
          emissionFactorSource: r.emissionFactorSource,
          calculationMethod:    r.calculationMethod,
          dataQuality:          r.dataQuality,
          deliveryDate:         r.deliveryDate,
          materialCode:         r.materialCode,
        })),
        skipDuplicates: true,
      });
    });

    // Step 3: Update today's project ESG snapshot
    await step.run('update-esg-snapshot', async () => {
      const { db } = await import('../lib/db');
      const today = new Date(data.deliveryDate);
      today.setHours(0, 0, 0, 0);

      // Aggregate current day's totals for this project
      const agg = await db.deliveryNoteLineCo2.groupBy({
        by: ['projectId', 'co2Scope'],
        where: {
          projectId:    data.projectId,
          deliveryDate: { gte: today, lt: new Date(today.getTime() + 86400000) },
        },
        _sum: { co2KgTotal: true },
      });

      const scope1 = agg.find(a => a.co2Scope === 'scope1')?._sum.co2KgTotal ?? 0;
      const scope2 = agg.find(a => a.co2Scope === 'scope2')?._sum.co2KgTotal ?? 0;
      const scope3 = agg.find(a => a.co2Scope === 'scope3')?._sum.co2KgTotal ?? 0;

      await db.projectEsgSnapshot.upsert({
        where: {
          projectId_snapshotDate_periodType: {
            projectId:    data.projectId,
            snapshotDate: today,
            periodType:   'day',
          },
        },
        update: {
          co2Scope1Kg: scope1,
          co2Scope2Kg: scope2,
          co2Scope3Kg: scope3,
          co2TotalKg:  scope1 + scope2 + scope3,
          updatedAt:   new Date(),
        },
        create: {
          projectId:   data.projectId,
          companyId:   data.companyId,
          snapshotDate: today,
          periodType:  'day',
          co2Scope1Kg: scope1,
          co2Scope2Kg: scope2,
          co2Scope3Kg: scope3,
          co2TotalKg:  scope1 + scope2 + scope3,
        },
      });
    });

    return {
      success: true,
      deliveryNoteId:   data.deliveryNoteId,
      linesProcessed:   co2Results.results.length,
      totalCO2Kg:       co2Results.totalCO2Kg,
      scope1Kg:         co2Results.scope1Kg,
      scope2Kg:         co2Results.scope2Kg,
      scope3Kg:         co2Results.scope3Kg,
      highQualityPct:   co2Results.highQualityPct,
    };
  }
);

// ─── Daily ESG Snapshot Rollup ────────────────────────────────────────────
// Runs at 02:00 every night — builds week/month/quarter snapshots from daily data

export const dailyEsgRollup = inngest.createFunction(
  {
    id: 'daily-esg-rollup',
    name: 'Daily ESG Snapshot Rollup',
    retries: 2,
  },
  { cron: '0 2 * * *' },  // 02:00 every night

  async ({ step }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build monthly snapshot from daily snapshots
    await step.run('build-monthly-snapshots', async () => {
      const { db } = await import('../lib/db');

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Aggregate all projects for this month
      const monthlyAgg = await db.projectEsgSnapshot.groupBy({
        by: ['projectId', 'companyId'],
        where: {
          periodType:   'day',
          snapshotDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: {
          co2Scope1Kg:    true,
          co2Scope2Kg:    true,
          co2Scope3Kg:    true,
          co2TotalKg:     true,
          totalSpendEur:  true,
          invoiceCount:   true,
          deliveryCount:  true,
        },
      });

      for (const agg of monthlyAgg) {
        await db.projectEsgSnapshot.upsert({
          where: {
            projectId_snapshotDate_periodType: {
              projectId:    agg.projectId,
              snapshotDate: monthStart,
              periodType:   'month',
            },
          },
          update: {
            co2Scope1Kg:   agg._sum.co2Scope1Kg    ?? 0,
            co2Scope2Kg:   agg._sum.co2Scope2Kg    ?? 0,
            co2Scope3Kg:   agg._sum.co2Scope3Kg    ?? 0,
            co2TotalKg:    agg._sum.co2TotalKg     ?? 0,
            totalSpendEur: agg._sum.totalSpendEur  ?? 0,
            updatedAt:     new Date(),
          },
          create: {
            projectId:     agg.projectId,
            companyId:     agg.companyId,
            snapshotDate:  monthStart,
            periodType:    'month',
            co2Scope1Kg:   agg._sum.co2Scope1Kg    ?? 0,
            co2Scope2Kg:   agg._sum.co2Scope2Kg    ?? 0,
            co2Scope3Kg:   agg._sum.co2Scope3Kg    ?? 0,
            co2TotalKg:    agg._sum.co2TotalKg     ?? 0,
            totalSpendEur: agg._sum.totalSpendEur  ?? 0,
          },
        });
      }
    });

    return { success: true, date: today.toISOString().split('T')[0] };
  }
);
