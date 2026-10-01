import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  Thermometer,
  Droplets,
  Truck,
  Leaf,
  Package,
  AlertCircle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  HelpCircle,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Zap,
  Clock,
  Wind
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import HelpTooltip from '../components/common/HelpTooltip';
import SectionHeader from '../components/common/SectionHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
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
  { id: 'short', label: 'Short (≤7 days) — Fresh greens, berries, bread' },
  { id: 'medium', label: 'Medium (8–30 days) — Fresh tomatoes, bananas, cheese' },
  { id: 'long', label: 'Long (>30 days) — Dry snacks, chips, grains, powders, frozen' },
];

const SIMPLE_TRANSPORT_OPTIONS = [
  { id: 'local', label: 'Local Distribution (1–2 days short haul)' },
  { id: 'long_distance', label: 'Long Distance / Cold Chain Transit (3–7+ days)' },
];

const INITIAL_FORM_STATE = {
  commodityName: 'Tomato',
  category: 'Fresh Produce',
  storageType: 'ambient',
  storageTemp: '12.0',
  relativeHumidity: '90',
  shelfLifeDays: '18',
  shelfLifeCategory: 'medium',
  transportCondition: 'Ambient Standard (Truck / Rail)',
  transportCategory: 'local',
  transportDays: '3',
  sustainabilityPreference: 'medium',
  packagingFormat: 'Pillow Pouch',
  // Advanced fields
  moistureCategory: 'very_moist',
  moisture: '94.0',
  phCategory: 'acidic',
  pH: '4.3',
  oilFatCategory: 'very_low',
  oilFatLevel: 'none',
  respirationCategory: 'medium',
  respirationRate: 'moderate',
};

export default function RecommendPage() {
  const navigate = useNavigate();
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState('tomato');
  const [presetNotice, setPresetNotice] = useState('Loaded: Tomato preset defaults');
  const [dbCommodities, setDbCommodities] = useState(PRESET_COMMODITIES);
  const [isAdvancedSectionOpen, setIsAdvancedSectionOpen] = useState(true);

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

  const handleStorageTypeSelect = (storageId) => {
    const stObj = STORAGE_TYPES.find((s) => s.id === storageId) || STORAGE_TYPES[0];
    setFormData((prev) => ({
      ...prev,
      storageType: stObj.id,
      storageTemp: stObj.defaultTemp.toString(),
      relativeHumidity: stObj.defaultRH.toString(),
    }));
  };

  const loadPreset = (preset) => {
    const presetId = preset.id || preset.name.toLowerCase().replace(/\s+/g, '_');
    setSelectedPresetId(presetId);

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

    const shelfLifeNum = preset.base_shelf_life_days ?? preset.shelfLifeDays ?? 30;

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
      shelfLifeDays: shelfLifeNum.toString(),
      storageType: preset.recommended_storage_type || preset.storageType || 'ambient',
      storageTemp: (preset.minimum_storage_temperature !== undefined
        ? ((preset.minimum_storage_temperature + preset.maximum_storage_temperature) / 2.0).toString()
        : (preset.storageTemp ?? 20).toString()),
      relativeHumidity: (preset.relativeHumidity ?? (preset.recommended_storage_type === 'chilled' || preset.storageType === 'chilled' ? 90 : 55)).toString(),
      transportCondition: preset.transportCondition || 'Ambient Standard (Truck / Rail)',
      transportDays: (preset.transportDays ?? 3).toString(),
      sustainabilityPreference: preset.sustainabilityPreference || 'medium',
      packagingFormat: preset.packagingFormat || 'Pillow Pouch',
      shelfLifeCategory: shelfLifeNum <= 7 ? 'short' : shelfLifeNum <= 30 ? 'medium' : 'long',
      transportCategory: 'local',
    }));

    setErrors({});
    setApiError(null);
    setPresetNotice(`Loaded preset: ${preset.name} (${preset.badge || preset.category || ''})`);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.commodityName.trim()) {
      newErrors.commodityName = 'Please enter or select a commodity name.';
    }

    if (isAdvancedMode) {
      if (formData.moistureCategory === 'exact') {
        const moistureNum = parseFloat(formData.moisture);
        if (isNaN(moistureNum) || moistureNum < 0 || moistureNum > 100) {
          newErrors.moisture = 'Moisture must be between 0% and 100%.';
        }
      }

      if (formData.phCategory === 'exact') {
        const phNum = parseFloat(formData.pH);
        if (isNaN(phNum) || phNum < 0 || phNum > 14) {
          newErrors.pH = 'pH must be between 0.0 and 14.0.';
        }
      }

      const shelfLifeNum = parseInt(formData.shelfLifeDays, 10);
      if (isNaN(shelfLifeNum) || shelfLifeNum <= 0) {
        newErrors.shelfLifeDays = 'Please enter a valid target shelf-life in days.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const isSimple = !isAdvancedMode;
      const submitPayload = {
        ...formData,
        isSimpleMode: isSimple,
        simple_mode: isSimple,
        use_defaults: isSimple,
      };

      // Call FastAPI recommendation engine
      const recommendationResponse = await generateRecommendation(submitPayload);

      // Save locally to sessionStorage for persistence
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

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setApiError(null);
    setSelectedPresetId('tomato');
    setPresetNotice('Form reset to default.');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="brand" size="sm">Decision Wizard</Badge>
            <span className="text-xs text-slate-400">Phase 8 UI Redesign</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Packaging Recommendation Form
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Configure food preservation parameters to calculate ASTM barrier physics and optimal materials.
          </p>
        </div>

        {/* Simple vs Advanced Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsAdvancedMode(false)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isAdvancedMode
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simple Mode
          </button>
          <button
            type="button"
            onClick={() => setIsAdvancedMode(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isAdvancedMode
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced Mode</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Select Bar */}
      <Card className="p-4 sm:p-5 border-slate-800/90 bg-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Quick Commodity Presets</span>
          </div>
          {presetNotice && (
            <span className="text-xs text-emerald-300 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              {presetNotice}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_COMMODITIES.map((preset) => {
            const isSelected = selectedPresetId === (preset.id || preset.name.toLowerCase());
            return (
              <button
                key={preset.id || preset.name}
                type="button"
                onClick={() => loadPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <span>{preset.name}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* API Error State Banner */}
      {apiError && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 flex items-start gap-3.5 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h4 className="text-sm font-bold text-rose-300">
              Backend Connection Error
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {apiError}
            </p>
            <div className="pt-1 flex items-center gap-3">
              <Button size="sm" variant="secondary" onClick={handleSubmit}>
                Retry Recommendation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSubmitting ? (
        <LoadingSpinner
          title={`Evaluating packaging barriers for ${formData.commodityName || 'commodity'}...`}
          subtitle="Calculating ASTM D3985 OTR, ASTM F1249 WVTR thresholds, MAP gas mixtures, and sustainability ranking."
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. PRODUCT DETAILS CARD */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">1. Product Details</h2>
                <p className="text-xs text-slate-400">Basic food commodity identification and chemical characteristics.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Commodity Name */}
              <Input
                name="commodityName"
                label="Commodity Name"
                placeholder="e.g., Fresh Tomato, Potato Chips, Roasted Almonds"
                value={formData.commodityName}
                onChange={handleChange}
                required
                error={errors.commodityName}
                helperText="Enter the commercial food product or raw produce name."
                tooltip="The target food item to be packaged. Used for microbial, respiratory, and lipid risk identification."
              />

              {/* Food Category */}
              <Select
                name="category"
                label="Food Category"
                value={formData.category}
                onChange={handleChange}
                options={COMMODITY_CATEGORIES.map((c) => ({ value: c, label: c }))}
                helperText="Broad classification determines baseline degradation pathways."
                tooltip="Categorization guides default permeability limits and mechanical requirements."
              />
            </div>

            {/* In Advanced Mode: Moisture, pH, Fat, Respiration */}
            {isAdvancedMode && (
              <div className="pt-4 border-t border-slate-800/80 space-y-5">
                <div className="flex items-center gap-2">
                  <Badge variant="teal" size="xs">Physicochemical Parameters</Badge>
                  <span className="text-xs text-slate-400">Chemical and biological degradation vectors</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Moisture Category */}
                  <div>
                    <Select
                      name="moistureCategory"
                      label="Moisture Content Level"
                      value={formData.moistureCategory}
                      onChange={handleChange}
                      options={MOISTURE_CATEGORY_OPTIONS}
                      helperText="Governs critical water vapor transmission (WVTR) limit."
                      tooltip="High moisture foods require breathability or microbial barrier; dry foods require high water vapor barrier to prevent sogginess."
                    />
                    {formData.moistureCategory === 'exact' && (
                      <div className="mt-3">
                        <Input
                          name="moisture"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          label="Exact Moisture Percentage (%)"
                          value={formData.moisture}
                          onChange={handleChange}
                          suffix="%"
                          error={errors.moisture}
                          helperText="Laboratory measured water content by weight."
                        />
                      </div>
                    )}
                  </div>

                  {/* pH Category */}
                  <div>
                    <Select
                      name="phCategory"
                      label="Acidity / pH Level"
                      value={formData.phCategory}
                      onChange={handleChange}
                      options={PH_CATEGORY_OPTIONS}
                      helperText="Low-acid foods (pH > 4.6) require stringent pathogen defense."
                      tooltip="Determines susceptibility to bacterial pathogens (e.g. Clostridium botulinum) and chemical polymer corrosion."
                    />
                    {formData.phCategory === 'exact' && (
                      <div className="mt-3">
                        <Input
                          name="pH"
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          label="Exact Product pH (0 - 14)"
                          value={formData.pH}
                          onChange={handleChange}
                          suffix="pH"
                          error={errors.pH}
                          helperText="Laboratory measured acidity value."
                        />
                      </div>
                    )}
                  </div>

                  {/* Oil / Fat Category */}
                  <div>
                    <Select
                      name="oilFatCategory"
                      label="Oil & Fat Content (Lipid Risk)"
                      value={formData.oilFatCategory}
                      onChange={handleChange}
                      options={OIL_FAT_CATEGORY_OPTIONS}
                      helperText="High-fat items require strict oxygen (OTR) and light barriers."
                      tooltip="High lipids accelerate oxidative rancidity, off-odors, and loss of nutritional vitamins."
                    />
                  </div>

                  {/* Respiration Category */}
                  <div>
                    <Select
                      name="respirationCategory"
                      label="Respiration Rate (Fresh Produce)"
                      value={formData.respirationCategory}
                      onChange={handleChange}
                      options={RESPIRATION_CATEGORY_OPTIONS}
                      helperText="Respiring produce requires breathable EMAP films."
                      tooltip="Living produce consumes O2 and emits CO2. Hermetic barrier films without micro-perforations cause anaerobic fermentation and ethanol off-flavor."
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 2. STORAGE & TRANSPORT CARD */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">2. Storage & Distribution</h2>
                <p className="text-xs text-slate-400">Thermal environment, transit logistics, and shelf-life requirements.</p>
              </div>
            </div>

            {/* Storage Condition Selection Cards */}
            <div className="space-y-2">
              <label className="form-label">Target Storage Environment</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STORAGE_TYPES.map((st) => {
                  const isSelected = formData.storageType === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleStorageTypeSelect(st.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/50 shadow-md shadow-blue-950/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{st.id}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="text-xs text-slate-300 font-medium">{st.label}</div>
                      <div className="text-[11px] text-slate-400 mt-2">
                        Default: {st.defaultTemp}°C • {st.defaultRH}% RH
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shelf-Life & Transport Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {!isAdvancedMode ? (
                <>
                  <Select
                    name="shelfLifeCategory"
                    label="Desired Shelf-Life Target"
                    value={formData.shelfLifeCategory}
                    onChange={handleChange}
                    options={SIMPLE_SHELF_LIFE_OPTIONS}
                    helperText="Select the commercial shelf-life expectation."
                    tooltip="Determines required barrier thickness and gas barrier transmission resistance."
                  />

                  <Select
                    name="transportCategory"
                    label="Logistics & Distribution Range"
                    value={formData.transportCategory}
                    onChange={handleChange}
                    options={SIMPLE_TRANSPORT_OPTIONS}
                    helperText="Defines puncture and vibration strength criteria."
                    tooltip="Longer transit paths require stronger tensile modulus and pinhole fatigue resistance."
                  />
                </>
              ) : (
                <>
                  <Input
                    name="shelfLifeDays"
                    type="number"
                    min="1"
                    max="1000"
                    label="Desired Shelf Life (Days)"
                    value={formData.shelfLifeDays}
                    onChange={handleChange}
                    suffix="days"
                    error={errors.shelfLifeDays}
                    helperText="Target shelf life under specified storage conditions."
                  />

                  <Select
                    name="transportCondition"
                    label="Transportation Condition"
                    value={formData.transportCondition}
                    onChange={handleChange}
                    options={TRANSPORTATION_CONDITIONS.map((t) => ({ value: t, label: t }))}
                    helperText="Supply chain handling and climate exposure profile."
                  />
                </>
              )}
            </div>

            {/* Advanced exact storage temps & RH */}
            {isAdvancedMode && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-800/80">
                <Input
                  name="storageTemp"
                  type="number"
                  step="0.5"
                  label="Storage Temperature (°C)"
                  value={formData.storageTemp}
                  onChange={handleChange}
                  suffix="°C"
                  helperText="Ambient or cold chain set point."
                />

                <Input
                  name="relativeHumidity"
                  type="number"
                  min="10"
                  max="100"
                  label="Relative Humidity (%)"
                  value={formData.relativeHumidity}
                  onChange={handleChange}
                  suffix="% RH"
                  helperText="Environmental moisture vapor pressure."
                />

                <Input
                  name="transportDays"
                  type="number"
                  min="1"
                  max="60"
                  label="Transit Duration (Days)"
                  value={formData.transportDays}
                  onChange={handleChange}
                  suffix="days"
                  helperText="Duration in logistics freight."
                />
              </div>
            )}
          </Card>

          {/* 3. PACKAGING FORMAT & SUSTAINABILITY CARD */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">3. Packaging Format & Sustainability</h2>
                <p className="text-xs text-slate-400">Structural form factor and circular economy priorities.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Packaging Format */}
              <Select
                name="packagingFormat"
                label="Packaging Format Preference"
                value={formData.packagingFormat}
                onChange={handleChange}
                options={PACKAGING_FORMATS.map((f) => ({ value: f, label: f }))}
                helperText="Physical style and machinery sealing configuration."
                tooltip="Affects surface area to volume ratio, seal width, and gas flush headspace."
              />

              {/* Sustainability Preference */}
              <Select
                name="sustainabilityPreference"
                label="Sustainability Priority (MCDA)"
                value={formData.sustainabilityPreference}
                onChange={handleChange}
                options={SUSTAINABILITY_PREFERENCES.map((s) => ({ value: s.id, label: s.label }))}
                helperText="Guides weighting between recyclability, bio-polymers, and cost."
                tooltip="PackWise AI multi-criteria decision analysis incorporates environmental impact scores."
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              icon={RotateCcw}
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              Reset Form
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="submit"
                size="lg"
                icon={Sparkles}
                iconPosition="right"
                isLoading={isSubmitting}
                className="w-full sm:w-auto shadow-xl shadow-emerald-950/60"
              >
                Get Recommendation
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Decision Support Disclaimer */}
      <DisclaimerBanner compact />
    </div>
  );
}
