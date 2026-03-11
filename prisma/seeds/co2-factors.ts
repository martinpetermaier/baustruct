/**
 * Seed: CO2 Emission Factors (ÖKOBAUDAT 2024-I)
 * Rainman 👨🏻‍🔧 | 2026-03-11
 *
 * Run: npx ts-node prisma/seeds/co2-factors.ts
 * Or via: prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

interface FactorSeed {
  materialCode:    string;
  materialName:    string;
  category:        string;
  stlbLb:          string;   // STLB-Bau Leistungsbereich
  co2A1A3:         number;
  co2A4:           number;
  co2Scope:        string;
  unit:            string;   // kg | liter | kWh
  source:          string;
  validFrom:       string;   // ISO date
}

const CO2_FACTORS: FactorSeed[] = [
  // ─── BETON & ZEMENT ───────────────────────────────────────────────────
  { materialCode: 'CONC_C2025',    materialName: 'Beton C20/25 (Normalbeton)',         category: 'CONC',       stlbLb: 'LB 019', co2A1A3: 0.062,  co2A4: 0.005, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'CONC_C2530',    materialName: 'Beton C25/30',                       category: 'CONC',       stlbLb: 'LB 019', co2A1A3: 0.075,  co2A4: 0.005, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'CONC_C3037',    materialName: 'Beton C30/37',                       category: 'CONC',       stlbLb: 'LB 019', co2A1A3: 0.085,  co2A4: 0.005, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'CONC_C3545',    materialName: 'Beton C35/45',                       category: 'CONC',       stlbLb: 'LB 019', co2A1A3: 0.092,  co2A4: 0.005, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'CONC_LIGHT',    materialName: 'Leichtbeton LC8/9',                  category: 'CONC',       stlbLb: 'LB 019', co2A1A3: 0.120,  co2A4: 0.007, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'SCREED_CEM',    materialName: 'Zementestrich CT',                   category: 'CONC',       stlbLb: 'LB 057', co2A1A3: 0.095,  co2A4: 0.005, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },

  // ─── STAHL & METALLE ──────────────────────────────────────────────────
  { materialCode: 'STEEL_REINF',   materialName: 'Bewehrungsstahl (recycelt DE ~70%)', category: 'STEEL',      stlbLb: 'LB 019', co2A1A3: 0.740,  co2A4: 0.025, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'STEEL_S235',    materialName: 'Baustahl S235 (Primär EU)',           category: 'STEEL',      stlbLb: 'LB 023', co2A1A3: 1.550,  co2A4: 0.025, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'STEEL_S355',    materialName: 'Baustahl S355 (Primär EU)',           category: 'STEEL',      stlbLb: 'LB 023', co2A1A3: 1.620,  co2A4: 0.025, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'STEEL_PIPE',    materialName: 'Stahlrohr (Primär)',                  category: 'STEEL',      stlbLb: 'LB 023', co2A1A3: 1.480,  co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'STEEL_SHEET',   materialName: 'Trapezblech / Stahltafel',            category: 'STEEL',      stlbLb: 'LB 023', co2A1A3: 1.420,  co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'STEEL_SS',      materialName: 'Edelstahl (austenitisch)',             category: 'STEEL',      stlbLb: 'LB 023', co2A1A3: 5.100,  co2A4: 0.030, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'ALU_PRIMARY',   materialName: 'Aluminium Primär (EU)',               category: 'METAL',      stlbLb: 'LB 023', co2A1A3: 6.750,  co2A4: 0.030, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'ALU_RECYCLED',  materialName: 'Aluminium recycelt (>75% EoL)',       category: 'METAL',      stlbLb: 'LB 023', co2A1A3: 2.300,  co2A4: 0.030, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'CU_PRIMARY',    materialName: 'Kupfer Primär',                       category: 'METAL',      stlbLb: 'LB 023', co2A1A3: 3.820,  co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'CU_PIPE',       materialName: 'Kupferrohr',                          category: 'METAL',      stlbLb: 'LB 023', co2A1A3: 3.900,  co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'ZN_PRIMARY',    materialName: 'Zink Primär (Dach/Fassade)',          category: 'METAL',      stlbLb: 'LB 023', co2A1A3: 3.660,  co2A4: 0.025, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },

  // ─── HOLZ & HOLZWERKSTOFFE (CO2-Speicher → negative Werte!) ──────────
  { materialCode: 'WOOD_CLT',      materialName: 'Brettsperrholz CLT',                 category: 'WOOD',       stlbLb: 'LB 053', co2A1A3: -0.820, co2A4: 0.030, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'WOOD_GLU',      materialName: 'Brettschichtholz BSH (Leimholz)',    category: 'WOOD',       stlbLb: 'LB 053', co2A1A3: -0.580, co2A4: 0.030, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'WOOD_KVH',      materialName: 'Konstruktionsvollholz KVH',          category: 'WOOD',       stlbLb: 'LB 053', co2A1A3: -0.690, co2A4: 0.025, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'WOOD_OSB',      materialName: 'OSB-Platte',                         category: 'WOOD',       stlbLb: 'LB 054', co2A1A3: -0.370, co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'WOOD_PLY',      materialName: 'Sperrholz (Birke/Fichte)',           category: 'WOOD',       stlbLb: 'LB 054', co2A1A3: -0.280, co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'INS_WF',        materialName: 'Holzfaserdämmplatte',                category: 'WOOD',       stlbLb: 'LB 054', co2A1A3: -0.430, co2A4: 0.015, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },

  // ─── MAUERWERK ────────────────────────────────────────────────────────
  { materialCode: 'BRICK_KS',      materialName: 'Kalksandstein KS 20',               category: 'MASONRY',    stlbLb: 'LB 012', co2A1A3: 0.138,  co2A4: 0.015, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'BRICK_POROTON', materialName: 'Porenbetonstein PP2-0.40',          category: 'MASONRY',    stlbLb: 'LB 012', co2A1A3: 0.417,  co2A4: 0.018, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'BRICK_HLZ',     materialName: 'Hochlochziegel HLz',                category: 'MASONRY',    stlbLb: 'LB 012', co2A1A3: 0.218,  co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'BRICK_CLAY',    materialName: 'Vollziegel / Mauerziegel Vz',       category: 'MASONRY',    stlbLb: 'LB 012', co2A1A3: 0.258,  co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'BRICK_CONC',    materialName: 'Betonstein / Hohlblockstein',       category: 'MASONRY',    stlbLb: 'LB 012', co2A1A3: 0.118,  co2A4: 0.015, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'BRICK_PAVE',    materialName: 'Pflasterklinker',                   category: 'MASONRY',    stlbLb: 'LB 012', co2A1A3: 0.285,  co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },

  // ─── WÄRMEDÄMMUNG ─────────────────────────────────────────────────────
  { materialCode: 'INS_MW',        materialName: 'Mineralwolle Steinwolle',            category: 'INSULATION', stlbLb: 'LB 054', co2A1A3: 1.050,  co2A4: 0.015, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'INS_GW',        materialName: 'Glaswolle',                          category: 'INSULATION', stlbLb: 'LB 054', co2A1A3: 1.350,  co2A4: 0.015, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'INS_EPS',       materialName: 'EPS Polystyrol (WLG 035)',           category: 'INSULATION', stlbLb: 'LB 054', co2A1A3: 3.290,  co2A4: 0.010, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'INS_XPS',       materialName: 'XPS Extrudiertes Polystyrol',        category: 'INSULATION', stlbLb: 'LB 054', co2A1A3: 3.430,  co2A4: 0.010, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'INS_PUR',       materialName: 'PUR/PIR Hartschaum',                category: 'INSULATION', stlbLb: 'LB 054', co2A1A3: 3.150,  co2A4: 0.010, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'INS_CEL',       materialName: 'Zellulosedämmung (Einblas)',         category: 'INSULATION', stlbLb: 'LB 054', co2A1A3: 0.085,  co2A4: 0.008, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'INS_FG',        materialName: 'Schaumglas',                         category: 'INSULATION', stlbLb: 'LB 054', co2A1A3: 0.380,  co2A4: 0.012, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },

  // ─── GIPS, PUTZ & TROCKENBAU ──────────────────────────────────────────
  { materialCode: 'GYP_GKB',       materialName: 'Gipskartonplatte (GKB)',             category: 'GYPSUM',     stlbLb: 'LB 054', co2A1A3: 0.385,  co2A4: 0.008, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'SCREED_CA',     materialName: 'Calciumsulfat-Estrich (CA)',         category: 'GYPSUM',     stlbLb: 'LB 057', co2A1A3: 0.082,  co2A4: 0.005, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'PLSTR_LIME',    materialName: 'Kalkputz (Innenputz)',               category: 'GYPSUM',     stlbLb: 'LB 056', co2A1A3: 0.120,  co2A4: 0.008, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'PLSTR_CEM',     materialName: 'Zementputz (Außenputz)',             category: 'GYPSUM',     stlbLb: 'LB 056', co2A1A3: 0.180,  co2A4: 0.008, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },

  // ─── GLAS & FASSADE ───────────────────────────────────────────────────
  { materialCode: 'GLASS_FLOAT',   materialName: 'Floatglas (Flachglas)',              category: 'GLASS',      stlbLb: 'LB 055', co2A1A3: 0.900,  co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'GLASS_IG2',     materialName: 'Isolierglas 2-fach',                category: 'GLASS',      stlbLb: 'LB 055', co2A1A3: 0.850,  co2A4: 0.020, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'PVC_WIN',       materialName: 'PVC-Fensterprofile',                 category: 'GLASS',      stlbLb: 'LB 055', co2A1A3: 2.940,  co2A4: 0.010, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },

  // ─── KUNSTSTOFFE & ROHRE ──────────────────────────────────────────────
  { materialCode: 'PVC_PIPE',      materialName: 'PVC-Rohr',                           category: 'PLASTICS',   stlbLb: 'LB 021', co2A1A3: 2.650,  co2A4: 0.008, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'PE_PIPE',       materialName: 'PE-Rohr (HDPE)',                     category: 'PLASTICS',   stlbLb: 'LB 021', co2A1A3: 1.850,  co2A4: 0.008, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'BIT_ROOF',      materialName: 'Bitumenbahn (Dachdichtung)',          category: 'PLASTICS',   stlbLb: 'LB 058', co2A1A3: 0.520,  co2A4: 0.010, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'CER_TILE',      materialName: 'Keramikfliesen',                     category: 'CERAMICS',   stlbLb: 'LB 057', co2A1A3: 0.680,  co2A4: 0.015, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },

  // ─── TIEFBAU & SCHÜTTGÜTER ────────────────────────────────────────────
  { materialCode: 'AGG_GRAVEL',    materialName: 'Schotter / Splitt (gebrochen)',      category: 'AGGREGATE',  stlbLb: 'LB 008', co2A1A3: 0.005,  co2A4: 0.003, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'AGG_SAND',      materialName: 'Bausand (gewaschen)',                category: 'AGGREGATE',  stlbLb: 'LB 008', co2A1A3: 0.003,  co2A4: 0.003, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },
  { materialCode: 'ASPHALT_AC',    materialName: 'Asphaltbeton AC (Straßenbau)',       category: 'AGGREGATE',  stlbLb: 'LB 008', co2A1A3: 0.048,  co2A4: 0.004, co2Scope: 'scope3', unit: 'kg', source: 'OEKOBAUDAT', validFrom: '2024-01-01' },

  // ─── ENERGIE & BETRIEBSSTOFFE ─────────────────────────────────────────
  { materialCode: 'FUEL_DIESEL',   materialName: 'Diesel Baumaschinen',                category: 'ENERGY',     stlbLb: '-',      co2A1A3: 2.640,  co2A4: 0,     co2Scope: 'scope1', unit: 'liter', source: 'DEFRA',     validFrom: '2024-01-01' },
  { materialCode: 'ENERGY_ELEC',   materialName: 'Baustrom (DE-Mix 2024)',              category: 'ENERGY',     stlbLb: '-',      co2A1A3: 0.420,  co2A4: 0,     co2Scope: 'scope2', unit: 'kWh',  source: 'UBA',       validFrom: '2024-01-01' },
  { materialCode: 'ENERGY_GAS',    materialName: 'Erdgas (Heizung Baustelle)',          category: 'ENERGY',     stlbLb: '-',      co2A1A3: 0.202,  co2A4: 0,     co2Scope: 'scope2', unit: 'kWh',  source: 'UBA',       validFrom: '2024-01-01' },
];

async function seed() {
  console.log('🌱 Seeding CO2 emission factors...');

  let created = 0;
  let updated = 0;

  for (const factor of CO2_FACTORS) {
    const result = await db.co2EmissionFactor.upsert({
      where: { materialCode: factor.materialCode },
      create: {
        materialCode:   factor.materialCode,
        materialName:   factor.materialName,
        category:       factor.category,
        stlbLb:         factor.stlbLb,
        co2KgPerUnit:   factor.co2A1A3,
        co2A4:          factor.co2A4,
        co2Scope:       factor.co2Scope,
        unit:           factor.unit,
        source:         factor.source,
        region:         'DE',
        validFrom:      new Date(factor.validFrom),
        isActive:       true,
      },
      update: {
        materialName:   factor.materialName,
        co2KgPerUnit:   factor.co2A1A3,
        co2A4:          factor.co2A4,
        source:         factor.source,
        isActive:       true,
      },
    });

    if (result.createdAt === result.updatedAt) created++;
    else updated++;
  }

  console.log(`✅ Done: ${created} created, ${updated} updated (${CO2_FACTORS.length} total)`);
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
