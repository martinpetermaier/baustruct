/**
 * CO2 Calculator — BauGPT Procurement
 * Rainman 👨🏻‍🔧 | 2026-03-11
 *
 * Calculates CO2 emissions per delivery note line item using ÖKOBAUDAT 2024-I factors.
 * Called by Inngest job on every `delivery/confirmed` event.
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export type CO2Scope = 'scope1' | 'scope2' | 'scope3';
export type CO2Phase = 'a1_a3' | 'a4' | 'a5';
export type CalculationMethod = 'factor_db' | 'category_default' | 'estimated';
export type DataQuality = 'high' | 'medium' | 'low';

export interface DeliveryLineInput {
  id: string;
  materialCode: string;       // from ERP sync, e.g. 'CONC_C2530'
  materialDescription?: string; // free-text fallback for fuzzy match
  quantityKg: number;          // normalized to kg
  deliveryDate: Date;
  projectId: string;
  companyId: string;
  supplierId: string;
}

export interface CO2Result {
  deliveryNoteLineId: string;
  projectId: string;
  companyId: string;
  materialCode: string;
  co2KgA1A3: number;           // Embodied Carbon: Herstellung
  co2KgA4: number;             // Transport zur Baustelle
  co2KgTotal: number;          // A1-A3 + A4
  co2Scope: CO2Scope;
  emissionFactorSource: string; // 'OEKOBAUDAT' | 'DEFRA' | 'UBA' | 'ESTIMATED'
  calculationMethod: CalculationMethod;
  dataQuality: DataQuality;
  deliveryDate: Date;
}

// ─── Static Emission Factors (ÖKOBAUDAT 2024-I) ───────────────────────────
// Format: materialCode → { a1a3, a4, scope, source }
// Negative values = CO2 storage (biogenic carbon in timber)

export const EMISSION_FACTORS: Record<string, {
  a1a3: number;
  a4: number;
  scope: CO2Scope;
  source: string;
  category: string;
}> = {
  // ─── BETON & ZEMENT ───────────────────────────────────────────────────
  CONC_C2025:   { a1a3: 0.062, a4: 0.005, scope: 'scope3', source: 'OEKOBAUDAT', category: 'CONC' },
  CONC_C2530:   { a1a3: 0.075, a4: 0.005, scope: 'scope3', source: 'OEKOBAUDAT', category: 'CONC' },
  CONC_C3037:   { a1a3: 0.085, a4: 0.005, scope: 'scope3', source: 'OEKOBAUDAT', category: 'CONC' },
  CONC_C3545:   { a1a3: 0.092, a4: 0.005, scope: 'scope3', source: 'OEKOBAUDAT', category: 'CONC' },
  CONC_LIGHT:   { a1a3: 0.120, a4: 0.007, scope: 'scope3', source: 'OEKOBAUDAT', category: 'CONC' },
  SCREED_CEM:   { a1a3: 0.095, a4: 0.005, scope: 'scope3', source: 'OEKOBAUDAT', category: 'CONC' },

  // ─── STAHL & METALLE ──────────────────────────────────────────────────
  STEEL_REINF:  { a1a3: 0.740, a4: 0.025, scope: 'scope3', source: 'OEKOBAUDAT', category: 'STEEL' },
  STEEL_S235:   { a1a3: 1.550, a4: 0.025, scope: 'scope3', source: 'OEKOBAUDAT', category: 'STEEL' },
  STEEL_S355:   { a1a3: 1.620, a4: 0.025, scope: 'scope3', source: 'OEKOBAUDAT', category: 'STEEL' },
  STEEL_PIPE:   { a1a3: 1.480, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'STEEL' },
  STEEL_SHEET:  { a1a3: 1.420, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'STEEL' },
  STEEL_SS:     { a1a3: 5.100, a4: 0.030, scope: 'scope3', source: 'OEKOBAUDAT', category: 'STEEL' },
  ALU_PRIMARY:  { a1a3: 6.750, a4: 0.030, scope: 'scope3', source: 'OEKOBAUDAT', category: 'METAL' },
  ALU_RECYCLED: { a1a3: 2.300, a4: 0.030, scope: 'scope3', source: 'OEKOBAUDAT', category: 'METAL' },
  CU_PRIMARY:   { a1a3: 3.820, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'METAL' },
  CU_PIPE:      { a1a3: 3.900, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'METAL' },
  ZN_PRIMARY:   { a1a3: 3.660, a4: 0.025, scope: 'scope3', source: 'OEKOBAUDAT', category: 'METAL' },

  // ─── HOLZ & HOLZWERKSTOFFE (CO2-Speicher → negativ!) ─────────────────
  WOOD_CLT:     { a1a3: -0.820, a4: 0.030, scope: 'scope3', source: 'OEKOBAUDAT', category: 'WOOD' },
  WOOD_GLU:     { a1a3: -0.580, a4: 0.030, scope: 'scope3', source: 'OEKOBAUDAT', category: 'WOOD' },
  WOOD_KVH:     { a1a3: -0.690, a4: 0.025, scope: 'scope3', source: 'OEKOBAUDAT', category: 'WOOD' },
  WOOD_OSB:     { a1a3: -0.370, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'WOOD' },
  WOOD_PLY:     { a1a3: -0.280, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'WOOD' },
  INS_WF:       { a1a3: -0.430, a4: 0.015, scope: 'scope3', source: 'OEKOBAUDAT', category: 'INSULATION' },

  // ─── MAUERWERK ────────────────────────────────────────────────────────
  BRICK_KS:     { a1a3: 0.138, a4: 0.015, scope: 'scope3', source: 'OEKOBAUDAT', category: 'MASONRY' },
  BRICK_POROTON:{ a1a3: 0.417, a4: 0.018, scope: 'scope3', source: 'OEKOBAUDAT', category: 'MASONRY' },
  BRICK_HLZ:    { a1a3: 0.218, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'MASONRY' },
  BRICK_CLAY:   { a1a3: 0.258, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'MASONRY' },
  BRICK_CONC:   { a1a3: 0.118, a4: 0.015, scope: 'scope3', source: 'OEKOBAUDAT', category: 'MASONRY' },
  BRICK_PAVE:   { a1a3: 0.285, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'MASONRY' },

  // ─── WÄRMEDÄMMUNG ─────────────────────────────────────────────────────
  INS_MW:       { a1a3: 1.050, a4: 0.015, scope: 'scope3', source: 'OEKOBAUDAT', category: 'INSULATION' },
  INS_GW:       { a1a3: 1.350, a4: 0.015, scope: 'scope3', source: 'OEKOBAUDAT', category: 'INSULATION' },
  INS_EPS:      { a1a3: 3.290, a4: 0.010, scope: 'scope3', source: 'OEKOBAUDAT', category: 'INSULATION' },
  INS_XPS:      { a1a3: 3.430, a4: 0.010, scope: 'scope3', source: 'OEKOBAUDAT', category: 'INSULATION' },
  INS_PUR:      { a1a3: 3.150, a4: 0.010, scope: 'scope3', source: 'OEKOBAUDAT', category: 'INSULATION' },
  INS_CEL:      { a1a3: 0.085, a4: 0.008, scope: 'scope3', source: 'OEKOBAUDAT', category: 'INSULATION' },
  INS_FG:       { a1a3: 0.380, a4: 0.012, scope: 'scope3', source: 'OEKOBAUDAT', category: 'INSULATION' },

  // ─── GIPS, PUTZ & TROCKENBAU ──────────────────────────────────────────
  GYP_GKB:      { a1a3: 0.385, a4: 0.008, scope: 'scope3', source: 'OEKOBAUDAT', category: 'GYPSUM' },
  SCREED_CA:    { a1a3: 0.082, a4: 0.005, scope: 'scope3', source: 'OEKOBAUDAT', category: 'GYPSUM' },
  PLSTR_LIME:   { a1a3: 0.120, a4: 0.008, scope: 'scope3', source: 'OEKOBAUDAT', category: 'GYPSUM' },
  PLSTR_CEM:    { a1a3: 0.180, a4: 0.008, scope: 'scope3', source: 'OEKOBAUDAT', category: 'GYPSUM' },

  // ─── GLAS & FASSADE ───────────────────────────────────────────────────
  GLASS_FLOAT:  { a1a3: 0.900, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'GLASS' },
  GLASS_IG2:    { a1a3: 0.850, a4: 0.020, scope: 'scope3', source: 'OEKOBAUDAT', category: 'GLASS' },
  PVC_WIN:      { a1a3: 2.940, a4: 0.010, scope: 'scope3', source: 'OEKOBAUDAT', category: 'GLASS' },

  // ─── KUNSTSTOFFE & ROHRE ──────────────────────────────────────────────
  PVC_PIPE:     { a1a3: 2.650, a4: 0.008, scope: 'scope3', source: 'OEKOBAUDAT', category: 'PLASTICS' },
  PE_PIPE:      { a1a3: 1.850, a4: 0.008, scope: 'scope3', source: 'OEKOBAUDAT', category: 'PLASTICS' },
  BIT_ROOF:     { a1a3: 0.520, a4: 0.010, scope: 'scope3', source: 'OEKOBAUDAT', category: 'PLASTICS' },
  CER_TILE:     { a1a3: 0.680, a4: 0.015, scope: 'scope3', source: 'OEKOBAUDAT', category: 'CERAMICS' },

  // ─── TIEFBAU & SCHÜTTGÜTER ────────────────────────────────────────────
  AGG_GRAVEL:   { a1a3: 0.005, a4: 0.003, scope: 'scope3', source: 'OEKOBAUDAT', category: 'AGGREGATE' },
  AGG_SAND:     { a1a3: 0.003, a4: 0.003, scope: 'scope3', source: 'OEKOBAUDAT', category: 'AGGREGATE' },
  ASPHALT_AC:   { a1a3: 0.048, a4: 0.004, scope: 'scope3', source: 'OEKOBAUDAT', category: 'AGGREGATE' },

  // ─── ENERGIE & BETRIEBSSTOFFE (Scope 1 + 2) ──────────────────────────
  FUEL_DIESEL:  { a1a3: 2.640, a4: 0,     scope: 'scope1', source: 'DEFRA',      category: 'ENERGY' },
  ENERGY_ELEC:  { a1a3: 0.420, a4: 0,     scope: 'scope2', source: 'UBA',        category: 'ENERGY' },
  ENERGY_GAS:   { a1a3: 0.202, a4: 0,     scope: 'scope2', source: 'UBA',        category: 'ENERGY' },
};

// Category defaults — used when exact material code not found
const CATEGORY_DEFAULTS: Record<string, number> = {
  CONC:       0.080,   // conservative default
  STEEL:      1.200,
  WOOD:       -0.400,
  MASONRY:    0.200,
  INSULATION: 1.500,
  GYPSUM:     0.250,
  GLASS:      0.900,
  PLASTICS:   2.500,
  METAL:      3.000,
  CERAMICS:   0.700,
  AGGREGATE:  0.010,
  ENERGY:     1.000,
  UNKNOWN:    0.300,   // last resort — over-estimate for CSRD safety
};

// ─── Main Calculator ───────────────────────────────────────────────────────

export function calculateCO2(line: DeliveryLineInput): CO2Result {
  const factor = EMISSION_FACTORS[line.materialCode];

  if (factor) {
    const co2A1A3 = round3(line.quantityKg * factor.a1a3);
    const co2A4   = round3(line.quantityKg * factor.a4);
    return {
      deliveryNoteLineId:   line.id,
      projectId:            line.projectId,
      companyId:            line.companyId,
      materialCode:         line.materialCode,
      co2KgA1A3:            co2A1A3,
      co2KgA4:              co2A4,
      co2KgTotal:           round3(co2A1A3 + co2A4),
      co2Scope:             factor.scope,
      emissionFactorSource: factor.source,
      calculationMethod:    'factor_db',
      dataQuality:          'high',
      deliveryDate:         line.deliveryDate,
    };
  }

  // Fallback: derive category from materialCode prefix (e.g. "CONC_XXX" → "CONC")
  const categoryPrefix = line.materialCode.split('_')[0] ?? 'UNKNOWN';
  const defaultFactor  = CATEGORY_DEFAULTS[categoryPrefix] ?? CATEGORY_DEFAULTS.UNKNOWN;
  const co2A1A3        = round3(line.quantityKg * defaultFactor);

  return {
    deliveryNoteLineId:   line.id,
    projectId:            line.projectId,
    companyId:            line.companyId,
    materialCode:         line.materialCode,
    co2KgA1A3:            co2A1A3,
    co2KgA4:              round3(line.quantityKg * 0.010),
    co2KgTotal:           round3(co2A1A3 + line.quantityKg * 0.010),
    co2Scope:             'scope3',
    emissionFactorSource: 'ESTIMATED',
    calculationMethod:    categoryPrefix in CATEGORY_DEFAULTS ? 'category_default' : 'estimated',
    dataQuality:          'low',
    deliveryDate:         line.deliveryDate,
  };
}

/**
 * Batch calculate CO2 for all lines of a delivery note.
 * Returns array + summary totals for quick dashboard update.
 */
export function calculateDeliveryCO2(lines: DeliveryLineInput[]): {
  results: CO2Result[];
  totalCO2Kg: number;
  scope1Kg: number;
  scope2Kg: number;
  scope3Kg: number;
  highQualityPct: number;
} {
  const results = lines.map(calculateCO2);

  const totalCO2Kg   = round3(results.reduce((s, r) => s + r.co2KgTotal, 0));
  const scope1Kg     = round3(results.filter(r => r.co2Scope === 'scope1').reduce((s, r) => s + r.co2KgTotal, 0));
  const scope2Kg     = round3(results.filter(r => r.co2Scope === 'scope2').reduce((s, r) => s + r.co2KgTotal, 0));
  const scope3Kg     = round3(results.filter(r => r.co2Scope === 'scope3').reduce((s, r) => s + r.co2KgTotal, 0));
  const highQualityPct = results.length > 0
    ? Math.round(results.filter(r => r.dataQuality === 'high').length / results.length * 100)
    : 0;

  return { results, totalCO2Kg, scope1Kg, scope2Kg, scope3Kg, highQualityPct };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Convert any unit to kg for normalization before calculation.
 * Extend as needed for new units from ERP sync.
 */
export function normalizeToKg(quantity: number, unit: string, materialCode: string): number {
  const unitLower = unit.toLowerCase().trim();

  // Already kg
  if (['kg', 'kilogram', 'kilogramm'].includes(unitLower)) return quantity;

  // Tonnes → kg
  if (['t', 'to', 'tonne', 'ton', 'tonnen'].includes(unitLower)) return quantity * 1000;

  // Litres → kg (für Diesel: ~0.845 kg/l; Wasser: 1.0 kg/l)
  if (['l', 'liter', 'litre'].includes(unitLower)) {
    if (materialCode.startsWith('FUEL')) return quantity * 0.845;
    return quantity; // treat 1L = 1kg as fallback
  }

  // Volume m³ → kg using density lookup
  if (['m3', 'm³', 'cbm', 'kubikmeter'].includes(unitLower)) {
    const density = DENSITY_KG_PER_M3[materialCode] ?? DENSITY_KG_PER_M3[materialCode.split('_')[0] ?? ''] ?? 1000;
    return quantity * density;
  }

  // m² → kg using area weight lookup (e.g. Dämmplatten)
  if (['m2', 'm²', 'qm', 'sqm'].includes(unitLower)) {
    const areaWeight = AREA_WEIGHT_KG_PER_M2[materialCode] ?? 10; // conservative 10 kg/m²
    return quantity * areaWeight;
  }

  // Stück/Pcs → kg — material specific
  if (['pcs', 'stk', 'stück', 'piece', 'pieces'].includes(unitLower)) {
    return quantity * (PIECE_WEIGHT_KG[materialCode] ?? 1);
  }

  // Unknown unit — return as-is with warning (logged upstream)
  console.warn(`[co2-calculator] Unknown unit "${unit}" for ${materialCode} — treating as kg`);
  return quantity;
}

// Density lookup kg/m³ for common construction materials
const DENSITY_KG_PER_M3: Record<string, number> = {
  CONC:         2350,
  CONC_C2025:   2350, CONC_C2530: 2400, CONC_C3037: 2450, CONC_C3545: 2450,
  STEEL:        7850,
  STEEL_REINF:  7850, STEEL_S235: 7850,
  WOOD:          450,
  WOOD_CLT:      490, WOOD_GLU: 480, WOOD_KVH: 450,
  MASONRY:      1800,
  BRICK_KS:     1800, BRICK_POROTON: 450, BRICK_CLAY: 1700,
  INS_EPS:        20, INS_XPS: 32, INS_MW: 100, INS_GW: 20, INS_PUR: 40,
  AGG_GRAVEL:   1650, AGG_SAND: 1600,
  ASPHALT_AC:   2300,
};

// Area weight lookup kg/m² for panels / sheets
const AREA_WEIGHT_KG_PER_M2: Record<string, number> = {
  GYP_GKB:    9.5,  // 12.5mm GKB
  GLASS_IG2:  24,   // 24mm IG
  GLASS_FLOAT: 10,  // 4mm float
  WOOD_OSB:   10,   // 15mm
  WOOD_PLY:    8,   // 12mm
  BIT_ROOF:    4,
};

// Piece weight for items ordered as "Stück"
const PIECE_WEIGHT_KG: Record<string, number> = {
  BRICK_CLAY:   2.8,
  BRICK_KS:     4.5,
  BRICK_POROTON: 1.9,
};
