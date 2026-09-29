import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Info,
  Layers,
  Thermometer,
  Droplets,
  Truck,
  Leaf,
  Package,
  AlertCircle,
  RotateCcw,
  Zap,
  CheckCircle,
  HelpCircle,
  Sliders,
  Check,
  Search,
  ChevronRight
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import {
  COMMODITY_CATEGORIES,
  STORAGE_TYPES,
  OIL_FAT_LEVELS,
  RESPIRATION_RATES,
  TRANSPORTATION_CONDITIONS,
  SUSTAINABILITY_PREFERENCES,
  PACKAGING_FORMATS,
  PRESET_COMMODITIES,
  MOISTURE_CATEGORY_OPTIONS,
  PH_CATEGORY_OPTIONS,
  OIL_FAT_CATEGORY_OPTIONS,
  RESPIRATION_CATEGORY_OPTIONS
} from '../data/mockData';
import { generateRecommendation, fetchCommodities } from '../api/recommendationApi';

const SIMPLE_SHELF_LIFE_OPTIONS = [
  { id: 'short', label: 'Short (≤7 days)', description: 'e.g., fresh greens, bakery items, daily harvest' },
  { id: 'medium', label: 'Medium (8–30 days)', description: 'e.g., fresh tomatoes, bananas, chilled dairy' },
  { id: 'long', label: 'Long (>30 days)', description: 'e.g., dry snacks, chips, grains, powders, frozen' },
];

const SIMPLE_TRANSPORT_OPTIONS = [
  { id: 'local', label: 'Local Distribution', description: 'Short-haul within 1–2 days (farm-to-market / city retail)' },
  { id: 'long_distance', label: 'Long Distance Logistics', description: 'Interstate / Cold chain / Export transit (3–7+ days)' },
];

const SIMPLE_SUSTAINABILITY_OPTIONS = [
  { id: 'low', label: 'Low / Cost Economy', description: 'Budget-first standard packaging' },
  { id: 'medium', label: 'Medium / Balanced', description: 'Standard recyclable or optimized material' },
  { id: 'high', label: 'High / Eco-Friendly', description: 'Mono-material recyclable or compostable bio-films' },
];

const INITIAL_FORM_STATE = {
  commodityName: 'Tomato',
  category: 'Fresh Produce',
  // Phase 6 Category Fields + Exact Mode flags
  moistureCategory: 'very_moist', // 'very_dry' | 'dry' | 'moist' | 'very_moist' | 'exact'
  moisture: '94.0',
  oilFatCategory: 'very_low', // 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'exact'
  oilFatLevel: 'none',
  phCategory: 'acidic', // 'acidic' | 'neutral' | 'alkaline' | 'exact'
  pH: '4.3',
  respirationCategory: 'medium', // 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'i_dont_know'
  respirationRate: 'moderate',
  shelfLifeDays: '18',
  storageType: 'ambient',
  storageTemp: '12.0',
  relativeHumidity: '90',
  transportCondition: 'Ambient Standard (Truck / Rail)',
  transportDays: '3',
  sustainabilityPreference: 'medium',
  packagingFormat: 'Pillow Pouch',
  // Simple mode specific fields
  shelfLifeCategory: 'medium',
  transportCategory: 'local',
};

export default function RecommendPage() {
  const navigate = useNavigate();
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [useTypicalValues, setUseTypicalValues] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState('tomato');
  const [statusMessage, setStatusMessage] = useState('Selected: Tomato (Chill-sensitive produce requiring breathable film)');
  const [searchTerm, setSearchTerm] = useState('');
  const [dbCommodities, setDbCommodities] = useState(PRESET_COMMODITIES);

  // Load database commodities on mount
  useEffect(() => {
    async function loadComms() {
      const comms = await fetchCommodities();
      if (comms && comms.length > 0) {
        // Merge with preset descriptions
        setDbCommodities(comms);
      }
    }
    loadComms();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const handleStorageTypeChange = (storageTypeObj) => {
    setFormData((prev) => ({
      ...prev,
      storageType: storageTypeObj.id,
      storageTemp: storageTypeObj.defaultTemp.toString(),
      relativeHumidity: storageTypeObj.defaultRH.toString(),
    }));
  };

  const loadPreset = (preset) => {
    setSelectedPresetId(preset.id || preset.name.toLowerCase().replace(/\s+/g, '_'));

    const moistureVal = (preset.default_moisture_percent ?? preset.moisture ?? 15.0).toString();
    const moistureNum = parseFloat(moistureVal);
    let mCat = 'moist';
    if (!isNaN(moistureNum)) {
      if (moistureNum <= 10) mCat = 'very_dry';
      else if (moistureNum <= 30) mCat = 'dry';
      else if (moistureNum <= 70) mCat = 'moist';
      else mCat = 'very_moist';
    }

    const phVal = (preset.default_ph ?? preset.pH ?? 6.0).toString();
    const phNum = parseFloat(phVal);
    let pCat = 'neutral';
    if (!isNaN(phNum)) {
      if (phNum <= 4.6) pCat = 'acidic';
      else if (phNum <= 7.0) pCat = 'neutral';
      else pCat = 'alkaline';
    }

    const rawOil = (preset.oil_fat_level || preset.oilFatLevel || 'low').toLowerCase();
    let oCat = 'low';
    if (rawOil === 'none' || rawOil === 'very_low') oCat = 'very_low';
    else if (rawOil === 'low') oCat = 'low';
    else if (rawOil === 'moderate' || rawOil === 'medium') oCat = 'medium';
    else if (rawOil === 'high') oCat = 'high';
    else if (rawOil === 'very_high') oCat = 'very_high';

    const rawResp = (preset.respiration_class || preset.respirationRate || 'very_low').toLowerCase();
    let rCat = 'very_low';
    if (rawResp === 'none' || rawResp === 'zero' || rawResp === 'very_low') rCat = 'very_low';
    else if (rawResp === 'low') rCat = 'low';
    else if (rawResp === 'moderate' || rawResp === 'medium') rCat = 'medium';
    else if (rawResp === 'high') rCat = 'high';
    else if (rawResp === 'very_high') rCat = 'very_high';

    setFormData({
      commodityName: preset.name,
      category: preset.category || 'Other / Custom',
      moistureCategory: mCat,
      moisture: moistureVal,
      oilFatCategory: oCat,
      oilFatLevel: rawOil,
      phCategory: pCat,
      pH: phVal,
      respirationCategory: rCat,
      respirationRate: rawResp,
      shelfLifeDays: (preset.base_shelf_life_days ?? preset.shelfLifeDays ?? 30).toString(),
      storageType: preset.recommended_storage_type || preset.storageType || 'ambient',
      storageTemp: (preset.minimum_storage_temperature !== undefined
        ? ((preset.minimum_storage_temperature + preset.maximum_storage_temperature) / 2.0).toString()
        : (preset.storageTemp ?? 20).toString()),
      relativeHumidity: (preset.relativeHumidity ?? (preset.recommended_storage_type === 'chilled' || preset.storageType === 'chilled' ? 90 : 55)).toString(),
      transportCondition: preset.transportCondition || 'Ambient Standard (Truck / Rail)',
      transportDays: (preset.transportDays ?? 2).toString(),
      sustainabilityPreference: preset.sustainabilityPreference || 'medium',
      packagingFormat: preset.packagingFormat || 'Pillow Pouch',
      shelfLifeCategory: (preset.base_shelf_life_days ?? preset.shelfLifeDays ?? 30) <= 7 ? 'short' : ((preset.base_shelf_life_days ?? preset.shelfLifeDays ?? 30) <= 30 ? 'medium' : 'long'),
      transportCategory: 'local',
    });
    setErrors({});
    setApiError(null);
    setStatusMessage(`Loaded: ${preset.name} (${preset.notes || preset.note || preset.category})`);
  };

  const validateForm = () => {
    const newErrors = {};

    // Commodity Name (required in both modes)
    if (!formData.commodityName.trim()) {
      newErrors.commodityName = 'Commodity name is required.';
    }

    // In Advanced Mode, validate numeric scientific fields if exact mode selected
    if (!isSimpleMode) {
      if (formData.moistureCategory === 'exact') {
        const moistureNum = parseFloat(formData.moisture);
        if (isNaN(moistureNum) || moistureNum < 0 || moistureNum > 100) {
          newErrors.moisture = 'Moisture content must be a percentage between 0 and 100.';
        }
      }

      if (formData.phCategory === 'exact') {
        const phNum = parseFloat(formData.pH);
        if (isNaN(phNum) || phNum < 0 || phNum > 14) {
          newErrors.pH = 'pH value must be between 0.0 and 14.0.';
        }
      }

      const rhNum = parseFloat(formData.relativeHumidity);
      if (isNaN(rhNum) || rhNum < 0 || rhNum > 100) {
        newErrors.relativeHumidity = 'Relative humidity must be between 0% and 100%.';
      }

      const shelfLifeNum = parseInt(formData.shelfLifeDays, 10);
      if (isNaN(shelfLifeNum) || shelfLifeNum <= 0) {
        newErrors.shelfLifeDays = 'Target shelf life must be a positive number greater than 0.';
      }

      const tempNum = parseFloat(formData.storageTemp);
      if (isNaN(tempNum)) {
        newErrors.storageTemp = 'Storage temperature must be a valid numeric value.';
      }

      const transportNum = parseInt(formData.transportDays, 10);
      if (isNaN(transportNum) || transportNum < 0) {
        newErrors.transportDays = 'Transportation days must be 0 or higher.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitPayload = {
        ...formData,
        isSimpleMode,
        simple_mode: isSimpleMode,
        use_defaults: isSimpleMode ? useTypicalValues : false,
      };

      // Call live FastAPI recommendation engine
      const recommendationResponse = await generateRecommendation(submitPayload);

      // Save locally to sessionStorage and navigate
      try {
        sessionStorage.setItem('packwise_recommendation_input', JSON.stringify(submitPayload));
        sessionStorage.setItem('packwise_recommendation_result', JSON.stringify(recommendationResponse));
      } catch (err) {
        console.warn('Could not write to sessionStorage', err);
      }

      navigate('/results', {
        state: {
          recommendation: recommendationResponse,
          formData: submitPayload,
        },
      });
    } catch (err) {
      console.error('Recommendation API error:', err);
      setApiError(err.message || 'Failed to connect to recommendation backend. Please verify server status.');
      window.scrollTo({ top: 150, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setApiError(null);
    setSelectedPresetId('tomato');
    setStatusMessage('Form reset to default.');
  };

  // Filtered commodities for search dropdown
  const filteredCommodities = dbCommodities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">Phase 5 Intelligent Packaging</Badge>
          <span className="text-xs text-slate-400">Step 1 of Decision Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Food Packaging Recommendation Form
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl">
          Get scientifically calibrated packaging material and barrier recommendations (OTR/WVTR, breathable film, MAP) tailored to your food product.
        </p>
      </div>

      {/* Mode Switcher Toggle: Simple Mode vs Advanced Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Simple Mode Toggle Card */}
        <button
          type="button"
          onClick={() => setIsSimpleMode(true)}
          className={`p-5 rounded-2xl border text-left transition-all relative ${
            isSimpleMode
              ? 'bg-gradient-to-br from-emerald-950/70 to-slate-900 border-emerald-500/60 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  isSimpleMode
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-base font-bold ${isSimpleMode ? 'text-white' : 'text-slate-200'}`}>
                    Simple mode
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Recommended for farmers / small units
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Simple mode – uses typical values for your product.
                </p>
              </div>
            </div>
            {isSimpleMode && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />}
          </div>
        </button>

        {/* Advanced Mode Toggle Card */}
        <button
          type="button"
          onClick={() => setIsSimpleMode(false)}
          className={`p-5 rounded-2xl border text-left transition-all relative ${
            !isSimpleMode
              ? 'bg-gradient-to-br from-indigo-950/70 to-slate-900 border-indigo-500/60 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/50'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  !isSimpleMode
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`text-base font-bold ${!isSimpleMode ? 'text-white' : 'text-slate-200'}`}>
                    Advanced mode
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Lab Data & QA
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Advanced mode – use if you have lab data or specific requirements.
                </p>
              </div>
            </div>
            {!isSimpleMode && <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />}
          </div>
        </button>
      </div>

      {/* Preset Commodity Quick Selectors */}
      <Card className="p-6 border-slate-800 bg-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Zap className="w-4 h-4 text-brand-400" />
            <span>Quick-Load Preset Commodity Profile</span>
          </div>
          <span className="text-xs text-slate-400">Click a preset to populate commodity details automatically:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_COMMODITIES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedPresetId === preset.id
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/30 ring-2 ring-brand-400'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <span>{preset.name}</span>
              <span className="text-[10px] opacity-75">({preset.category})</span>
            </button>
          ))}
        </div>

        {statusMessage && (
          <div className="mt-3.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-brand-300 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </Card>

      {/* API / Network Error Alert */}
      {apiError && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 shadow-lg shadow-rose-950/50 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-sm font-bold text-rose-300">
              Recommendation Engine Request Failed
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {apiError}
            </p>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* ====================================================================== */}
        {/* SIMPLE MODE FORM (For Farmers / Small Units / Non-Technical Users)       */}
        {/* ====================================================================== */}
        {isSimpleMode ? (
          <div className="space-y-6">
            {/* Commodity Selection & Typical Values Option */}
            <Card className="p-6 sm:p-8 space-y-6 border-emerald-500/30">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Select Your Product</h2>
                  <p className="text-xs text-slate-400">Choose or enter your food commodity.</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Commodity Dropdown / Search */}
                <div className="space-y-2">
                  <label htmlFor="simpleCommodity" className="block text-xs font-semibold text-slate-200">
                    Commodity <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      id="simpleCommodity"
                      value={formData.commodityName}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = dbCommodities.find(
                          (c) => c.name.toLowerCase() === val.toLowerCase()
                        );
                        if (match) {
                          loadPreset(match);
                        } else {
                          setFormData((prev) => ({ ...prev, commodityName: val }));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="">-- Choose known commodity --</option>
                      {dbCommodities.map((c) => (
                        <option key={c.id || c.name} value={c.name}>
                          {c.name} ({c.category})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      name="commodityName"
                      value={formData.commodityName}
                      onChange={handleChange}
                      placeholder="Or type custom product (e.g. Guava, Paneer, Chips)"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        errors.commodityName
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500/20'
                      }`}
                    />
                  </div>
                  {errors.commodityName && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.commodityName}
                    </p>
                  )}
                </div>

                {/* "Use typical values for this commodity" Checkbox */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                  <input
                    id="useTypicalValues"
                    name="useTypicalValues"
                    type="checkbox"
                    checked={useTypicalValues}
                    onChange={(e) => setUseTypicalValues(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/30 bg-slate-900 cursor-pointer"
                  />
                  <div className="space-y-1 cursor-pointer" onClick={() => setUseTypicalValues(!useTypicalValues)}>
                    <label htmlFor="useTypicalValues" className="text-xs font-bold text-emerald-300 block cursor-pointer">
                      Use typical values for this commodity (recommended)
                    </label>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      PackWise AI automatically loads standard moisture %, respiration class, fat levels, and pH from our food science database. You don't need lab measurements.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Storage Type */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">
                  02
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Storage & Handling Conditions</h2>
                  <p className="text-xs text-slate-400">Choose storage regime and expected shelf life.</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Storage Type Radio Cards */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    Storage Type <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'ambient', label: 'Ambient', sub: 'Room temperature (~15–25°C)', icon: Thermometer },
                      { id: 'chilled', label: 'Chilled', sub: 'Cold room / Refrigerator (0–4°C)', icon: Droplets },
                      { id: 'frozen', label: 'Frozen', sub: 'Deep freezer (-18°C or below)', icon: Package },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, storageType: st.id }))}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.storageType === st.id
                            ? 'bg-brand-500/15 border-brand-500 text-white ring-2 ring-brand-500/40'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="font-semibold text-sm text-white flex items-center justify-between">
                          <span>{st.label}</span>
                          {formData.storageType === st.id && <Check className="w-4 h-4 text-brand-400" />}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{st.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desired Shelf Life Category */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    Desired Shelf Life Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SIMPLE_SHELF_LIFE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, shelfLifeCategory: opt.id }))}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.shelfLifeCategory === opt.id
                            ? 'bg-brand-500/15 border-brand-500 text-white ring-2 ring-brand-500/40'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="font-semibold text-sm text-white flex items-center justify-between">
                          <span>{opt.label}</span>
                          {formData.shelfLifeCategory === opt.id && <Check className="w-4 h-4 text-brand-400" />}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Distribution & Sustainability */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                  03
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Transport & Sustainability</h2>
                  <p className="text-xs text-slate-400">Transit scale and eco-packaging preference.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Transport Distance */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    Transport Distance
                  </label>
                  <div className="space-y-2">
                    {SIMPLE_TRANSPORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, transportCategory: opt.id }))}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                          formData.transportCategory === opt.id
                            ? 'bg-brand-500/15 border-brand-500 text-white ring-2 ring-brand-500/40'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-sm text-white">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.description}</div>
                        </div>
                        {formData.transportCategory === opt.id && <Check className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sustainability Preference */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    Sustainability Preference (Optional)
                  </label>
                  <div className="space-y-2">
                    {SIMPLE_SUSTAINABILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, sustainabilityPreference: opt.id }))}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                          formData.sustainabilityPreference === opt.id
                            ? 'bg-brand-500/15 border-brand-500 text-white ring-2 ring-brand-500/40'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-sm text-white">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.description}</div>
                        </div>
                        {formData.sustainabilityPreference === opt.id && <Check className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* ====================================================================== */
          /* ADVANCED MODE FORM (For Packaging Engineers / QA Lab Data)             */
          /* ====================================================================== */
          <div className="space-y-8">
            {/* Section 1: Food Chemistry & Physicochemical Properties */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Food Commodity Characteristics (Lab Data)</h2>
                  <p className="text-xs text-slate-400">Specify precise chemical composition and physiological metrics.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Commodity Name */}
                <div className="space-y-1.5">
                  <label htmlFor="commodityName" className="block text-xs font-semibold text-slate-200">
                    Commodity Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="commodityName"
                    name="commodityName"
                    type="text"
                    value={formData.commodityName}
                    onChange={handleChange}
                    placeholder="e.g., Banana, Potato chips, Paneer"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all ${
                      errors.commodityName
                        ? 'border-rose-500 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/20'
                    }`}
                  />
                  {errors.commodityName && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.commodityName}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label htmlFor="category" className="block text-xs font-semibold text-slate-200">
                    Food Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    {COMMODITY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Moisture Content (Category Dropdown + Optional Exact %) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="moistureCategory" className="block text-xs font-semibold text-slate-200">
                      Moisture Content <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-brand-400">Category or Exact %</span>
                  </div>
                  <select
                    id="moistureCategory"
                    name="moistureCategory"
                    value={formData.moistureCategory}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    {MOISTURE_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* If "I know the exact %" is selected, show numeric input */}
                  {formData.moistureCategory === 'exact' ? (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="moisture" className="text-[11px] font-medium text-slate-300">
                          Exact Moisture Percentage (%) <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400">0 – 100%</span>
                      </div>
                      <input
                        id="moisture"
                        name="moisture"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.moisture}
                        onChange={handleChange}
                        placeholder="e.g., 94.0"
                        className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-xs text-white focus:outline-none focus:ring-2 transition-all ${
                          errors.moisture
                            ? 'border-rose-500 focus:ring-rose-500/30'
                            : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500/20'
                        }`}
                      />
                      {errors.moisture && (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {errors.moisture}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Contextual Tooltip Helper for Moisture */
                    <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 leading-tight flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                      <span>
                        {formData.moistureCategory === 'very_dry' && 'Very dry: chips, biscuits, milk powder, dry snacks.'}
                        {formData.moistureCategory === 'dry' && 'Dry: wheat flour, rice, pulses, dry grains, dried foods.'}
                        {formData.moistureCategory === 'moist' && 'Moist: fresh paneer, cheese, bakery with fillings.'}
                        {formData.moistureCategory === 'very_moist' && 'Very moist: leafy vegetables, fresh fruits, vine tomatoes.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Oil / Fat Level (Category Dropdown + Optional Exact Level) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="oilFatCategory" className="block text-xs font-semibold text-slate-200">
                      Oil & Fat Level (Oxidation Risk)
                    </label>
                    <span className="text-[11px] text-brand-400">Category or Exact</span>
                  </div>
                  <select
                    id="oilFatCategory"
                    name="oilFatCategory"
                    value={formData.oilFatCategory}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    {OIL_FAT_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* If "I know the exact level" is selected, show exact level dropdown */}
                  {formData.oilFatCategory === 'exact' ? (
                    <div className="pt-1.5 space-y-1">
                      <label htmlFor="oilFatLevel" className="text-[11px] font-medium text-slate-300">
                        Exact Lipid Content Tier
                      </label>
                      <select
                        id="oilFatLevel"
                        name="oilFatLevel"
                        value={formData.oilFatLevel}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      >
                        {OIL_FAT_LEVELS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    /* Contextual Tooltip Helper for Oil/Fat */
                    <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 leading-tight flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                      <span>
                        {formData.oilFatCategory === 'very_low' && 'Very low: most fresh produce, fruits, vegetables.'}
                        {formData.oilFatCategory === 'low' && 'Low: grains, pulses, skimmed/low-fat dairy.'}
                        {formData.oilFatCategory === 'medium' && 'Medium: baked goods, whole milk dairy, cookies.'}
                        {formData.oilFatCategory === 'high' && 'High: potato chips, namkeen, roasted nuts.'}
                        {formData.oilFatCategory === 'very_high' && 'Very high: butter, pure fats, oil-rich confectionery.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* pH Value (Category Dropdown + Optional Exact pH) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="phCategory" className="block text-xs font-semibold text-slate-200">
                      pH Level / Acidity <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-brand-400">Category or Exact pH</span>
                  </div>
                  <select
                    id="phCategory"
                    name="phCategory"
                    value={formData.phCategory}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    {PH_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* If "I know the exact pH" is selected, show numeric input */}
                  {formData.phCategory === 'exact' ? (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="pH" className="text-[11px] font-medium text-slate-300">
                          Exact pH Value <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400">0.0 – 14.0</span>
                      </div>
                      <input
                        id="pH"
                        name="pH"
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={formData.pH}
                        onChange={handleChange}
                        placeholder="e.g., 4.3"
                        className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-xs text-white focus:outline-none focus:ring-2 transition-all ${
                          errors.pH
                            ? 'border-rose-500 focus:ring-rose-500/30'
                            : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500/20'
                        }`}
                      />
                      {errors.pH && (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {errors.pH}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Contextual Tooltip Helper for pH */
                    <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 leading-tight flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                      <span>
                        {formData.phCategory === 'acidic' && 'Acidic: tomato, citrus fruits, berries, fruit juices.'}
                        {formData.phCategory === 'neutral' && 'Neutral: milk, paneer, most vegetables, grains, pulses.'}
                        {formData.phCategory === 'alkaline' && 'Alkaline: alkaline processed foods, ramen noodles.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Respiration Rate (Category Dropdown) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="respirationCategory" className="block text-xs font-semibold text-slate-200">
                      Respiration Rate (Produce Kinetics)
                    </label>
                    <span className="text-[11px] text-brand-400">Biological Rate</span>
                  </div>
                  <select
                    id="respirationCategory"
                    name="respirationCategory"
                    value={formData.respirationCategory}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    {RESPIRATION_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Contextual Tooltip Helper for Respiration */}
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 leading-tight flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                    <span>
                      {formData.respirationCategory === 'very_low' && 'Very low: processed foods, dry goods, chips, powders.'}
                      {formData.respirationCategory === 'low' && 'Low: onions, garlic, potatoes, mature pumpkins.'}
                      {formData.respirationCategory === 'medium' && 'Medium: fresh tomatoes, bell peppers, carrots, mangoes.'}
                      {formData.respirationCategory === 'high' && 'High: bananas, strawberries, avocados, cut fruits.'}
                      {formData.respirationCategory === 'very_high' && 'Very high: spinach, mushrooms, asparagus, leafy greens.'}
                      {formData.respirationCategory === 'i_dont_know' && "I don't know: PackWise applies a safe standard non-respiring profile."}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Storage & Environmental Distribution */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">
                  02
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Storage & Shelf-Life Targets</h2>
                  <p className="text-xs text-slate-400">Define storage temperature regimes, humidity, and distribution chain.</p>
                </div>
              </div>

              {/* Storage Type Quick Radio Tiles */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">Storage Regime</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STORAGE_TYPES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStorageTypeChange(st)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.storageType === st.id
                          ? 'bg-brand-500/15 border-brand-500 text-white ring-1 ring-brand-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-sm text-white">{st.label}</div>
                      <div className="text-xs text-slate-400 mt-1">Default: {st.defaultTemp}°C, {st.defaultRH}% RH</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {/* Storage Temp */}
                <div className="space-y-1.5">
                  <label htmlFor="storageTemp" className="block text-xs font-semibold text-slate-200">
                    Storage Temperature (°C) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="storageTemp"
                    name="storageTemp"
                    type="number"
                    step="0.5"
                    value={formData.storageTemp}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.storageTemp
                        ? 'border-rose-500 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/20'
                    }`}
                  />
                  <p className="text-[11px] text-slate-400">
                    Optimal holding temp (Ambient ~20–25°C, Chilled ~2–4°C, Frozen ~-18°C).
                  </p>
                  {errors.storageTemp && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.storageTemp}
                    </p>
                  )}
                </div>

                {/* Relative Humidity % */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="relativeHumidity" className="block text-xs font-semibold text-slate-200">
                      Relative Humidity (% RH) <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">0 – 100%</span>
                  </div>
                  <input
                    id="relativeHumidity"
                    name="relativeHumidity"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.relativeHumidity}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.relativeHumidity
                        ? 'border-rose-500 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/20'
                    }`}
                  />
                  <p className="text-[11px] text-slate-400">
                    Ambient RH ~50–60%, Cold Storage RH ~85–95%.
                  </p>
                  {errors.relativeHumidity && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.relativeHumidity}
                    </p>
                  )}
                </div>

                {/* Desired Shelf Life */}
                <div className="space-y-1.5">
                  <label htmlFor="shelfLifeDays" className="block text-xs font-semibold text-slate-200">
                    Target Shelf Life (Days) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="shelfLifeDays"
                    name="shelfLifeDays"
                    type="number"
                    min="1"
                    value={formData.shelfLifeDays}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.shelfLifeDays
                        ? 'border-rose-500 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/20'
                    }`}
                  />
                  <p className="text-[11px] text-slate-400">
                    Target shelf life required to avoid spoilage.
                  </p>
                  {errors.shelfLifeDays && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.shelfLifeDays}
                    </p>
                  )}
                </div>

                {/* Transportation Condition */}
                <div className="space-y-1.5">
                  <label htmlFor="transportCondition" className="block text-xs font-semibold text-slate-200">
                    Transportation Logistics Chain
                  </label>
                  <select
                    id="transportCondition"
                    name="transportCondition"
                    value={formData.transportCondition}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    {TRANSPORTATION_CONDITIONS.map((tc) => (
                      <option key={tc} value={tc} className="bg-slate-900 text-white">
                        {tc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transportation Days */}
                <div className="space-y-1.5">
                  <label htmlFor="transportDays" className="block text-xs font-semibold text-slate-200">
                    Transit Duration (Days)
                  </label>
                  <input
                    id="transportDays"
                    name="transportDays"
                    type="number"
                    min="0"
                    value={formData.transportDays}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.transportDays
                        ? 'border-rose-500 focus:ring-rose-500/30'
                        : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/20'
                    }`}
                  />
                </div>
              </div>
            </Card>

            {/* Section 3: Engineering Preferences & Format */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                  03
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Packaging Form & Sustainability Priorities</h2>
                  <p className="text-xs text-slate-400">Configure multi-criteria optimization weights and packaging formats.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Sustainability Preference */}
                <div className="space-y-1.5">
                  <label htmlFor="sustainabilityPreference" className="block text-xs font-semibold text-slate-200">
                    Sustainability & Circular Economy Goal
                  </label>
                  <select
                    id="sustainabilityPreference"
                    name="sustainabilityPreference"
                    value={formData.sustainabilityPreference}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    {SUSTAINABILITY_PREFERENCES.map((sp) => (
                      <option key={sp.id} value={sp.id} className="bg-slate-900 text-white">
                        {sp.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Packaging Format */}
                <div className="space-y-1.5">
                  <label htmlFor="packagingFormat" className="block text-xs font-semibold text-slate-200">
                    Packaging Format Preference
                  </label>
                  <select
                    id="packagingFormat"
                    name="packagingFormat"
                    value={formData.packagingFormat}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    {PACKAGING_FORMATS.map((pf) => (
                      <option key={pf} value={pf} className="bg-slate-900 text-white">
                        {pf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={resetForm}
            className="w-full sm:w-auto px-4 py-3 text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 hover:bg-slate-900 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Form</span>
          </button>

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            icon={Sparkles}
            iconPosition="right"
            className="w-full sm:w-auto px-8"
          >
            {isSimpleMode ? 'Get Recommended Packaging' : 'Analyze & Generate Recommendation'}
          </Button>
        </div>
      </form>

      {/* Decision Support Disclaimer */}
      <DisclaimerBanner compact />
    </div>
  );
}

