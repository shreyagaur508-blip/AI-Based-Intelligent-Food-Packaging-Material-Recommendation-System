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
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  FileText,
  FlaskConical,
  Database,
  Edit3,
  ShieldCheck,
  Award
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
  hasLabData: false, // Step 4 decision: false = simple/farmer mode with DB defaults, true = advanced mode
  // Category Fields + Exact Mode flags (for Step 5)
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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState('tomato');
  const [statusMessage, setStatusMessage] = useState('Loaded: Tomato preset defaults');
  const [dbCommodities, setDbCommodities] = useState(PRESET_COMMODITIES);

  // Load database commodities on mount
  useEffect(() => {
    async function loadComms() {
      const comms = await fetchCommodities();
      if (comms && comms.length > 0) {
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

    setFormData((prev) => ({
      ...prev,
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
    }));
    setErrors({});
    setApiError(null);
    setStatusMessage(`Loaded: ${preset.name} (${preset.notes || preset.note || preset.category})`);
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.commodityName.trim()) {
        newErrors.commodityName = 'Please enter or select a commodity name.';
      }
    } else if (stepNumber === 5 && formData.hasLabData) {
      if (formData.moistureCategory === 'exact') {
        const moistureNum = parseFloat(formData.moisture);
        if (isNaN(moistureNum) || moistureNum < 0 || moistureNum > 100) {
          newErrors.moisture = 'Moisture percentage must be between 0 and 100.';
        }
      }

      if (formData.phCategory === 'exact') {
        const phNum = parseFloat(formData.pH);
        if (isNaN(phNum) || phNum < 0 || phNum > 14) {
          newErrors.pH = 'pH value must be between 0.0 and 14.0.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === 4) {
      // If user has NO lab data (Farmer mode) -> skip Step 5 and jump directly to Step 6 (Review & Submit)
      if (!formData.hasLabData) {
        setCurrentStep(6);
      } else {
        setCurrentStep(5);
      }
    } else if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const goToPrevStep = () => {
    if (currentStep === 6 && !formData.hasLabData) {
      setCurrentStep(4);
    } else if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const jumpToStep = (stepNumber) => {
    if (stepNumber === 5 && !formData.hasLabData) {
      setFormData((prev) => ({ ...prev, hasLabData: true }));
    }
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setApiError(null);

    setIsSubmitting(true);

    try {
      const isSimple = !formData.hasLabData;
      const submitPayload = {
        ...formData,
        isSimpleMode: isSimple,
        simple_mode: isSimple,
        use_defaults: isSimple,
      };

      // Call FastAPI recommendation engine
      const recommendationResponse = await generateRecommendation(submitPayload);

      // Save locally to sessionStorage
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
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setCurrentStep(1);
    setErrors({});
    setApiError(null);
    setSelectedPresetId('tomato');
    setStatusMessage('Form reset to default.');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Stepper definition
  const WIZARD_STEPS = [
    { number: 1, title: 'Product Basics', shortTitle: 'Product', icon: Package },
    { number: 2, title: 'Storage & Shelf Life', shortTitle: 'Storage', icon: Thermometer },
    { number: 3, title: 'Transport & Eco Goal', shortTitle: 'Transport', icon: Truck },
    { number: 4, title: 'Data Availability', shortTitle: 'Data Check', icon: Database },
    ...(formData.hasLabData ? [{ number: 5, title: 'Advanced Lab Data', shortTitle: 'Lab Metrics', icon: FlaskConical }] : []),
    { number: 6, title: 'Review & Submit', shortTitle: 'Review', icon: CheckCircle },
  ];

  const totalSteps = formData.hasLabData ? 6 : 5;
  const displayStepNumber = !formData.hasLabData && currentStep === 6 ? 5 : currentStep;
  const progressPercent = Math.round((displayStepNumber / totalSteps) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">Phase 7 Guided Wizard</Badge>
          <span className="text-xs text-slate-400">Step-by-Step Food Packaging Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Food Packaging Recommendation Wizard
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl">
          Follow our 6-step guided assistant to configure food preservation, storage, transport, and barrier requirements.
        </p>
      </div>

      {/* Wizard Progress & Stepper Bar */}
      <Card className="p-4 sm:p-6 bg-slate-900/90 border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-brand-300 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Step {displayStepNumber} of {totalSteps}: {WIZARD_STEPS.find(s => s.number === currentStep)?.title || 'Review & Submit'}
            </span>
            <span className="text-slate-400 font-mono">{progressPercent}% Complete</span>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 via-teal-400 to-emerald-400 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stepper Steps (Clickable for quick navigation) */}
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1 pt-2">
            {[1, 2, 3, 4, 5, 6].filter(num => num !== 5 || formData.hasLabData).map((stepNum, idx) => {
              const isActive = currentStep === stepNum;
              const isPast = currentStep > stepNum;
              const stepObj = WIZARD_STEPS.find(s => s.number === stepNum);
              const IconComp = stepObj?.icon || CheckCircle;

              return (
                <button
                  key={stepNum}
                  type="button"
                  onClick={() => jumpToStep(stepNum)}
                  className={`p-2 rounded-xl text-center transition-all flex flex-col items-center gap-1 ${
                    isActive
                      ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300 shadow-md shadow-brand-500/10'
                      : isPast
                      ? 'bg-slate-950/60 border border-slate-800 text-emerald-400 hover:border-slate-700'
                      : 'bg-slate-950/30 border border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-brand-500 text-slate-950 font-extrabold'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : idx + 1}
                  </div>
                  <span className="text-[10px] font-semibold truncate hidden sm:inline">
                    {stepObj?.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* API / Network Error Alert */}
      {apiError && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 shadow-lg shadow-rose-950/50 flex items-start gap-4 animate-in fade-in duration-300">
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

      {/* ====================================================================== */}
      {/* WIZARD STEP CONTAINER                                                  */}
      {/* ====================================================================== */}
      <Card className="p-6 sm:p-8 space-y-6 border-slate-800 bg-slate-900/90 shadow-xl relative">
        {/* ==================================================================== */}
        {/* STEP 1: PRODUCT BASICS                                               */}
        {/* ==================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
                01
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Step 1: Product Basics</h2>
                <p className="text-xs text-slate-400">Choose or type your food commodity to start recommendation analysis.</p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-brand-400" />
                <span>Quick Preset Commodity Profiles:</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COMMODITIES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => loadPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      selectedPresetId === preset.id
                        ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/30 ring-2 ring-brand-400'
                        : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>{preset.name}</span>
                    <span className="text-[10px] opacity-75">({preset.category})</span>
                  </button>
                ))}
              </div>
              {statusMessage && (
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-brand-300 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Commodity Dropdown & Custom Input */}
              <div className="space-y-2">
                <label htmlFor="commoditySelect" className="block text-xs font-semibold text-slate-200">
                  Select Known Commodity <span className="text-rose-400">*</span>
                </label>
                <select
                  id="commoditySelect"
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
                  <option value="">-- Choose from database --</option>
                  {dbCommodities.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Commodity Name */}
              <div className="space-y-2">
                <label htmlFor="commodityName" className="block text-xs font-semibold text-slate-200">
                  Or Custom Product Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="commodityName"
                  name="commodityName"
                  type="text"
                  value={formData.commodityName}
                  onChange={handleChange}
                  placeholder="e.g. Guava, Paneer, Extruded Snack"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.commodityName
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500/20'
                  }`}
                />
                {errors.commodityName && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.commodityName}
                  </p>
                )}
              </div>

              {/* Product Type / Commodity Category */}
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="category" className="block text-xs font-semibold text-slate-200">
                  Product Type / Category (Optional)
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  {COMMODITY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Used by the recommendation engine to apply category-specific barrier rules.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: STORAGE & SHELF LIFE                                         */}
        {/* ==================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm">
                02
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Step 2: Storage & Shelf Life</h2>
                <p className="text-xs text-slate-400">Specify holding temperature regime and expected preservation duration.</p>
              </div>
            </div>

            {/* Storage Type Radio Cards */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-200">
                Storage Regime <span className="text-rose-400">*</span>
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
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-200">
                Desired Shelf Life Category <span className="text-rose-400">*</span>
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
        )}

        {/* ==================================================================== */}
        {/* STEP 3: TRANSPORT & SUSTAINABILITY                                   */}
        {/* ==================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                03
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Step 3: Transport & Sustainability</h2>
                <p className="text-xs text-slate-400">Configure logistics range and packaging circularity priorities.</p>
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
                  Sustainability Preference
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

              {/* Packaging Format Preference */}
              <div className="space-y-2 sm:col-span-2 pt-2">
                <label htmlFor="packagingFormat" className="block text-xs font-semibold text-slate-200">
                  Packaging Format Preference (Optional)
                </label>
                <select
                  id="packagingFormat"
                  name="packagingFormat"
                  value={formData.packagingFormat}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  {PACKAGING_FORMATS.map((pf) => (
                    <option key={pf} value={pf}>
                      {pf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: DATA AVAILABILITY CHECK                                      */}
        {/* ==================================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                04
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Step 4: Data Availability</h2>
                <p className="text-xs text-slate-400">Do you have lab/test data or specific chemical metrics for this product?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option A: No Lab Data (Farmer / Simple Mode) */}
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, hasLabData: false }))}
                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  !formData.hasLabData
                    ? 'bg-gradient-to-br from-emerald-950/70 to-slate-900 border-emerald-500/60 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                      <Leaf className="w-5 h-5" />
                    </div>
                    {!formData.hasLabData && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>No, use typical values</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        Recommended
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      PackWise AI automatically loads verified scientific defaults (moisture %, pH, respiration rate) from our food science database.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-4">
                  <span>Fast track → Jumps directly to Review & Submit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option B: Yes, I have Lab Data (Advanced Mode) */}
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, hasLabData: true }))}
                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  formData.hasLabData
                    ? 'bg-gradient-to-br from-indigo-950/70 to-slate-900 border-indigo-500/60 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    {formData.hasLabData && <CheckCircle className="w-5 h-5 text-indigo-400" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Yes, I have lab data</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                        Lab QA
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      Allows specifying exact moisture %, pH value, lipid concentrations, and produce kinetics via custom category dropdowns or numbers.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-[11px] text-indigo-400 font-semibold flex items-center gap-1 mt-4">
                  <span>Advanced details → Opens Step 5 (Lab Metrics)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 5: ADVANCED LAB DETAILS (Only if hasLabData === true)            */}
        {/* ==================================================================== */}
        {currentStep === 5 && formData.hasLabData && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                05
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Step 5: Advanced Lab Details</h2>
                <p className="text-xs text-slate-400">Configure category-based inputs or exact laboratory measurements.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Moisture Content */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  {MOISTURE_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {formData.moistureCategory === 'exact' ? (
                  <div className="pt-1.5 space-y-1">
                    <label htmlFor="moisture" className="text-[11px] font-medium text-slate-300 block">
                      Exact Moisture Percentage (%) <span className="text-rose-400">*</span>
                    </label>
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
                      className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-xs text-white focus:outline-none focus:ring-2 ${
                        errors.moisture ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-700 focus:border-brand-500'
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

              {/* Oil / Fat Level */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  {OIL_FAT_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {formData.oilFatCategory === 'exact' ? (
                  <div className="pt-1.5 space-y-1">
                    <label htmlFor="oilFatLevel" className="text-[11px] font-medium text-slate-300 block">
                      Exact Lipid Content Tier
                    </label>
                    <select
                      id="oilFatLevel"
                      name="oilFatLevel"
                      value={formData.oilFatLevel}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      {OIL_FAT_LEVELS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 leading-tight flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                    <span>
                      {formData.oilFatCategory === 'very_low' && 'Very low: fresh produce, fruits, vegetables.'}
                      {formData.oilFatCategory === 'low' && 'Low: grains, pulses, skimmed/low-fat dairy.'}
                      {formData.oilFatCategory === 'medium' && 'Medium: baked goods, whole milk dairy, cookies.'}
                      {formData.oilFatCategory === 'high' && 'High: potato chips, namkeen, roasted nuts.'}
                      {formData.oilFatCategory === 'very_high' && 'Very high: butter, pure fats, oil-rich confectionery.'}
                    </span>
                  </div>
                )}
              </div>

              {/* pH Value */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  {PH_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {formData.phCategory === 'exact' ? (
                  <div className="pt-1.5 space-y-1">
                    <label htmlFor="pH" className="text-[11px] font-medium text-slate-300 block">
                      Exact pH Value <span className="text-rose-400">*</span>
                    </label>
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
                      className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-xs text-white focus:outline-none focus:ring-2 ${
                        errors.pH ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-700 focus:border-brand-500'
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

              {/* Respiration Rate */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  {RESPIRATION_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 leading-tight flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                  <span>
                    {formData.respirationCategory === 'very_low' && 'Very low: processed foods, dry goods, chips, powders.'}
                    {formData.respirationCategory === 'low' && 'Low: onions, garlic, potatoes, mature pumpkins.'}
                    {formData.respirationCategory === 'medium' && 'Medium: fresh tomatoes, bell peppers, carrots, mangoes.'}
                    {formData.respirationCategory === 'high' && 'High: bananas, strawberries, avocados, cut fruits.'}
                    {formData.respirationCategory === 'very_high' && 'Very high: spinach, mushrooms, asparagus, leafy greens.'}
                    {formData.respirationCategory === 'i_dont_know' && "I don't know: PackWise applies standard non-respiring profile."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 6: REVIEW & SUBMIT                                              */}
        {/* ==================================================================== */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                06
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Step 6: Review & Submit</h2>
                <p className="text-xs text-slate-400">Verify your parameters below. You can click "Edit" on any section to adjust inputs.</p>
              </div>
            </div>

            {/* Summary Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Card 1: Product Basics */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-brand-400" />
                    Product Basics
                  </span>
                  <button
                    type="button"
                    onClick={() => jumpToStep(1)}
                    className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
                <div className="space-y-1 text-slate-300 pt-1">
                  <div>Commodity: <span className="font-semibold text-white">{formData.commodityName}</span></div>
                  <div>Category: <span className="text-slate-400">{formData.category}</span></div>
                </div>
              </div>

              {/* Card 2: Storage & Shelf Life */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-teal-400" />
                    Storage & Shelf Life
                  </span>
                  <button
                    type="button"
                    onClick={() => jumpToStep(2)}
                    className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
                <div className="space-y-1 text-slate-300 pt-1">
                  <div>Storage Regime: <span className="font-semibold text-white capitalize">{formData.storageType}</span></div>
                  <div>Shelf Life Tier: <span className="capitalize">{formData.shelfLifeCategory}</span></div>
                </div>
              </div>

              {/* Card 3: Transport & Sustainability */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-400" />
                    Transport & Sustainability
                  </span>
                  <button
                    type="button"
                    onClick={() => jumpToStep(3)}
                    className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
                <div className="space-y-1 text-slate-300 pt-1">
                  <div>Transport Range: <span className="capitalize">{formData.transportCategory.replace('_', ' ')}</span></div>
                  <div>Eco Preference: <span className="capitalize">{formData.sustainabilityPreference}</span></div>
                  <div>Packaging Format: <span className="text-white">{formData.packagingFormat}</span></div>
                </div>
              </div>

              {/* Card 4: Lab & Physicochemical Data */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-purple-400" />
                    Physicochemical Data
                  </span>
                  <button
                    type="button"
                    onClick={() => jumpToStep(formData.hasLabData ? 5 : 4)}
                    className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
                <div className="space-y-1 text-slate-300 pt-1">
                  {formData.hasLabData ? (
                    <>
                      <div>Moisture: <span className="text-white">{formData.moistureCategory === 'exact' ? `${formData.moisture}%` : formData.moistureCategory.replace('_', ' ')}</span></div>
                      <div>pH: <span className="text-white">{formData.phCategory === 'exact' ? formData.pH : formData.phCategory}</span></div>
                      <div>Oil/Fat: <span className="capitalize">{formData.oilFatCategory.replace('_', ' ')}</span></div>
                      <div>Respiration: <span className="capitalize">{formData.respirationCategory.replace('_', ' ')}</span></div>
                    </>
                  ) : (
                    <div className="text-emerald-400 flex items-center gap-1.5 pt-1">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Auto-resolved using database commodity reference defaults.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ready to Submit Alert */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs text-slate-200">
                <span className="font-bold text-emerald-300">Ready for evaluation! </span>
                Click the button below to execute the 7-stage deterministic recommendation engine.
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* WIZARD NAVIGATION FOOTER                                             */}
        {/* ==================================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={goToPrevStep}
                icon={ChevronLeft}
              >
                Previous Step
              </Button>
            )}

            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-2.5 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 hover:bg-slate-800/80 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="w-full sm:w-auto">
            {currentStep === 6 ? (
              <Button
                type="button"
                size="lg"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                icon={Sparkles}
                iconPosition="right"
                className="w-full sm:w-auto px-8"
              >
                Analyze & Generate Recommendation
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                onClick={goToNextStep}
                icon={ChevronRight}
                iconPosition="right"
                className="w-full sm:w-auto px-6"
              >
                Continue to Step {currentStep === 4 && !formData.hasLabData ? (formData.hasLabData ? 5 : 5) : (currentStep + 1 > totalSteps ? totalSteps : currentStep + 1)}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Decision Support Disclaimer */}
      <DisclaimerBanner compact />
    </div>
  );
}
