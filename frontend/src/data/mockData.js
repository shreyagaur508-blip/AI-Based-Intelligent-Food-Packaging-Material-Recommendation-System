export const COMMODITY_CATEGORIES = [
  'Fresh Produce',
  'Dry Crisp Foods',
  'High-Fat Snacks',
  'Powders & Grains',
  'Perishable Dairy',
  'Frozen Foods',
  'Beverages & Liquids',
  'Other / Custom'
];

export const STORAGE_TYPES = [
  { id: 'ambient', label: 'Ambient (15°C to 25°C)', defaultTemp: 22, defaultRH: 55 },
  { id: 'chilled', label: 'Chilled (0°C to 4°C)', defaultTemp: 4, defaultRH: 90 },
  { id: 'frozen', label: 'Frozen (-18°C or below)', defaultTemp: -18, defaultRH: 95 },
];

export const OIL_FAT_LEVELS = [
  { value: 'none', label: 'None / Negligible (< 1%)' },
  { value: 'low', label: 'Low (1% - 5%)' },
  { value: 'moderate', label: 'Moderate (5% - 20%)' },
  { value: 'high', label: 'High (> 20% - Lipid Oxidation Risk)' },
];

export const RESPIRATION_RATES = [
  { value: 'none', label: 'None (Non-respiring / Processed food)' },
  { value: 'low', label: 'Low (e.g., Onions, Potatoes)' },
  { value: 'moderate', label: 'Moderate (e.g., Tomato, Mango)' },
  { value: 'high', label: 'High (e.g., Banana, Berries)' },
  { value: 'very_high', label: 'Very High (e.g., Leafy vegetables, Mushrooms)' },
];

export const TRANSPORTATION_CONDITIONS = [
  'Ambient Standard (Truck / Rail)',
  'Temperature-Controlled Cold Chain (Reefer)',
  'High-Humidity Marine Freight',
  'Air Freight (Rapid Logistics)',
  'Local Short-Haul Distribution',
];

export const SUSTAINABILITY_PREFERENCES = [
  { id: 'balanced', label: 'Balanced (Cost & Performance First)' },
  { id: 'recyclable', label: 'High Recyclability (Mono-material PE/PP)' },
  { id: 'compostable', label: 'Bio-based / Industrially Compostable (PLA/Bio-film)' },
  { id: 'minimal_carbon', label: 'Ultra-Lightweight / Low Carbon Footprint' },
];

export const PACKAGING_FORMATS = [
  'Pillow Pouch',
  'Stand-up Pouch (Doypack)',
  'Rigid Tray with Lidding Film',
  'Vacuum Skin Packaging (VSP)',
  'Modified Atmosphere Packaging (MAP) Tray',
  'Perforated Bag / Clamshell',
  'Multi-wall Sack / Gusseted Bag',
];

export const PRESET_COMMODITIES = [
  {
    id: 'banana',
    name: 'Banana',
    category: 'Fresh Produce',
    moisture: 74,
    oilFatLevel: 'none',
    pH: 5.0,
    respirationRate: 'high',
    shelfLifeDays: 14,
    storageType: 'ambient',
    storageTemp: 13.5,
    relativeHumidity: 85,
    transportCondition: 'Temperature-Controlled Cold Chain (Reefer)',
    transportDays: 4,
    sustainabilityPreference: 'compostable',
    packagingFormat: 'Perforated Bag / Clamshell',
    badge: 'Climacteric Produce',
    note: 'Requires high gas exchange (EMAP) to avoid anaerobic fermentation.'
  },
  {
    id: 'potato_chips',
    name: 'Potato Chips',
    category: 'Dry Crisp Foods',
    moisture: 1.8,
    oilFatLevel: 'high',
    pH: 6.0,
    respirationRate: 'none',
    shelfLifeDays: 180,
    storageType: 'ambient',
    storageTemp: 22,
    relativeHumidity: 50,
    transportCondition: 'Ambient Standard (Truck / Rail)',
    transportDays: 3,
    sustainabilityPreference: 'recyclable',
    packagingFormat: 'Pillow Pouch',
    badge: 'High Fat & Crisp',
    note: 'Needs strict moisture barrier (WVTR < 1.5) and nitrogen flush.'
  },
  {
    id: 'roasted_nuts',
    name: 'Roasted Nuts',
    category: 'High-Fat Snacks',
    moisture: 3.5,
    oilFatLevel: 'high',
    pH: 6.2,
    respirationRate: 'none',
    shelfLifeDays: 240,
    storageType: 'ambient',
    storageTemp: 20,
    relativeHumidity: 55,
    transportCondition: 'Ambient Standard (Truck / Rail)',
    transportDays: 5,
    sustainabilityPreference: 'recyclable',
    packagingFormat: 'Stand-up Pouch (Doypack)',
    badge: 'Oxidation Sensitive',
    note: 'Requires high oxygen barrier (OTR < 2.0) and light protection.'
  },
  {
    id: 'paneer',
    name: 'Paneer (Fresh Cottage Cheese)',
    category: 'Perishable Dairy',
    moisture: 55,
    oilFatLevel: 'high',
    pH: 5.6,
    respirationRate: 'none',
    shelfLifeDays: 21,
    storageType: 'chilled',
    storageTemp: 4,
    relativeHumidity: 90,
    transportCondition: 'Temperature-Controlled Cold Chain (Reefer)',
    transportDays: 1,
    sustainabilityPreference: 'recyclable',
    packagingFormat: 'Vacuum Skin Packaging (VSP)',
    badge: 'High Moisture Perishable',
    note: 'Requires hermetic vacuum seal and chilled storage to stop bacterial growth.'
  },
  {
    id: 'frozen_peas',
    name: 'Frozen Peas (IQF)',
    category: 'Frozen Foods',
    moisture: 78,
    oilFatLevel: 'none',
    pH: 6.5,
    respirationRate: 'none',
    shelfLifeDays: 365,
    storageType: 'frozen',
    storageTemp: -18,
    relativeHumidity: 95,
    transportCondition: 'Temperature-Controlled Cold Chain (Reefer)',
    transportDays: 2,
    sustainabilityPreference: 'recyclable',
    packagingFormat: 'Pillow Pouch',
    badge: 'Freezer Burn Risk',
    note: 'Requires sub-zero flex crack resistance and puncture strength.'
  },
  {
    id: 'milk_powder',
    name: 'Milk Powder (Full Cream)',
    category: 'Powders & Grains',
    moisture: 3.0,
    oilFatLevel: 'high',
    pH: 6.6,
    respirationRate: 'none',
    shelfLifeDays: 365,
    storageType: 'ambient',
    storageTemp: 20,
    relativeHumidity: 50,
    transportCondition: 'Ambient Standard (Truck / Rail)',
    transportDays: 5,
    sustainabilityPreference: 'recyclable',
    packagingFormat: 'Stand-up Pouch (Doypack)',
    badge: 'Caking & Rancidity Risk',
    note: 'Ultra-low moisture and oxygen permeability essential.'
  },
  {
    id: 'tomato',
    name: 'Tomato (Fresh Vine)',
    category: 'Fresh Produce',
    moisture: 94,
    oilFatLevel: 'none',
    pH: 4.3,
    respirationRate: 'moderate',
    shelfLifeDays: 18,
    storageType: 'ambient',
    storageTemp: 12,
    relativeHumidity: 90,
    transportCondition: 'Temperature-Controlled Cold Chain (Reefer)',
    transportDays: 3,
    sustainabilityPreference: 'compostable',
    packagingFormat: 'Modified Atmosphere Packaging (MAP) Tray',
    badge: 'Chill-Sensitive Produce',
    note: 'Store above 10°C to prevent chilling injury and mealy texture.'
  },
  {
    id: 'leafy_vegetables',
    name: 'Leafy Vegetables (Spinach)',
    category: 'Fresh Produce',
    moisture: 92,
    oilFatLevel: 'none',
    pH: 6.0,
    respirationRate: 'very_high',
    shelfLifeDays: 10,
    storageType: 'chilled',
    storageTemp: 4,
    relativeHumidity: 95,
    transportCondition: 'Temperature-Controlled Cold Chain (Reefer)',
    transportDays: 1,
    sustainabilityPreference: 'compostable',
    packagingFormat: 'Perforated Bag / Clamshell',
    badge: 'High Respiration & Wilting',
    note: 'Rapid transpiration risk; requires anti-fog micro-perforated film.'
  }
];

export const INITIAL_MATERIALS_CATALOG = [
  {
    id: 1,
    code: 'LDPE',
    name: 'Low-Density Polyethylene',
    polymerFamily: 'Polyolefin',
    otr: '4500 cm³/(m²·24h·atm)',
    wvtr: '18.0 g/(m²·24h)',
    costTier: 'Budget',
    sustainabilityScore: 70,
    foodGrade: true,
    bestFor: 'Frozen produce, fresh produce bags, inner heat-seal layer'
  },
  {
    id: 2,
    code: 'HDPE',
    name: 'High-Density Polyethylene',
    polymerFamily: 'Polyolefin',
    otr: '2000 cm³/(m²·24h·atm)',
    wvtr: '6.5 g/(m²·24h)',
    costTier: 'Budget',
    sustainabilityScore: 85,
    foodGrade: true,
    bestFor: 'Dry grains, flour bags, rigid bottles'
  },
  {
    id: 3,
    code: 'PP / BOPP',
    name: 'Biaxially Oriented Polypropylene',
    polymerFamily: 'Polyolefin',
    otr: '1800 cm³/(m²·24h·atm)',
    wvtr: '5.0 g/(m²·24h)',
    costTier: 'Budget',
    sustainabilityScore: 80,
    foodGrade: true,
    bestFor: 'Crisp snack overwrap, bakery products, biscuits'
  },
  {
    id: 4,
    code: 'PET',
    name: 'Polyethylene Terephthalate',
    polymerFamily: 'Polyester',
    otr: '75 cm³/(m²·24h·atm)',
    wvtr: '20.0 g/(m²·24h)',
    costTier: 'Moderate',
    sustainabilityScore: 90,
    foodGrade: true,
    bestFor: 'Beverage bottles, rigid thermoformed trays, outer printable layer'
  },
  {
    id: 5,
    code: 'Met-PET',
    name: 'Metallized PET',
    polymerFamily: 'Barrier Film',
    otr: '1.2 cm³/(m²·24h·atm)',
    wvtr: '1.0 g/(m²·24h)',
    costTier: 'Moderate',
    sustainabilityScore: 65,
    foodGrade: true,
    bestFor: 'Potato chips, roasted nuts, snack pouches'
  },
  {
    id: 6,
    code: 'Alu-Foil Lam',
    name: 'Aluminum Foil Laminate (PET/Alu/PE)',
    polymerFamily: 'Multilayer Foil',
    otr: '0.05 cm³/(m²·24h·atm)',
    wvtr: '0.05 g/(m²·24h)',
    costTier: 'Premium',
    sustainabilityScore: 40,
    foodGrade: true,
    bestFor: 'Milk powder, instant coffee, long shelf-life rations'
  },
  {
    id: 7,
    code: 'PLA',
    name: 'Polylactic Acid (Bio-film)',
    polymerFamily: 'Biopolymer',
    otr: '750 cm³/(m²·24h·atm)',
    wvtr: '120 g/(m²·24h)',
    costTier: 'Moderate',
    sustainabilityScore: 95,
    foodGrade: true,
    bestFor: 'Short shelf-life fresh produce, organic salads, bakery'
  },
  {
    id: 8,
    code: 'Micro-Perf',
    name: 'Breathable / Laser Micro-Perforated Film',
    polymerFamily: 'Engineered Film',
    otr: 'Custom (1000 - 5000+)',
    wvtr: 'Moderate',
    costTier: 'Moderate',
    sustainabilityScore: 75,
    foodGrade: true,
    bestFor: 'Climacteric fruits (Banana, Tomato), leafy greens (EMAP)'
  },
  {
    id: 9,
    code: 'PET/EVOH/PE',
    name: 'High-Barrier Recyclable Structure',
    polymerFamily: 'Recyclable Barrier',
    otr: '2.0 cm³/(m²·24h·atm)',
    wvtr: '2.5 g/(m²·24h)',
    costTier: 'Premium',
    sustainabilityScore: 85,
    foodGrade: true,
    bestFor: 'Fresh paneer, meat, oxygen-sensitive gourmet foods'
  }
];

export const ADMIN_STATS_MOCK = {
  totalCommodities: 12,
  totalMaterials: 11,
  activeRules: 18,
  totalEvaluations: 0,
  complianceRate: '100% Food-Grade Certified'
};
