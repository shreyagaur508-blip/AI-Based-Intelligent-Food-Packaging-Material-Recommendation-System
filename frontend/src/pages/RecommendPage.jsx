import React, { useState } from 'react';
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
  HelpCircle
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
  PRESET_COMMODITIES
} from '../data/mockData';

const INITIAL_FORM_STATE = {
  commodityName: '',
  category: 'Fresh Produce',
  moisture: '74',
  oilFatLevel: 'none',
  pH: '5.0',
  respirationRate: 'high',
  shelfLifeDays: '14',
  storageType: 'ambient',
  storageTemp: '13.5',
  relativeHumidity: '85',
  transportCondition: 'Temperature-Controlled Cold Chain (Reefer)',
  transportDays: '4',
  sustainabilityPreference: 'compostable',
  packagingFormat: 'Perforated Bag / Clamshell',
};

export default function RecommendPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState('banana');
  const [statusMessage, setStatusMessage] = useState('Loaded preset: Banana (Climacteric fresh produce)');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
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
    setSelectedPresetId(preset.id);
    setFormData({
      commodityName: preset.name,
      category: preset.category,
      moisture: preset.moisture.toString(),
      oilFatLevel: preset.oilFatLevel,
      pH: preset.pH.toString(),
      respirationRate: preset.respirationRate,
      shelfLifeDays: preset.shelfLifeDays.toString(),
      storageType: preset.storageType,
      storageTemp: preset.storageTemp.toString(),
      relativeHumidity: preset.relativeHumidity.toString(),
      transportCondition: preset.transportCondition,
      transportDays: preset.transportDays.toString(),
      sustainabilityPreference: preset.sustainabilityPreference,
      packagingFormat: preset.packagingFormat,
    });
    setErrors({});
    setStatusMessage(`Loaded preset: ${preset.name} (${preset.note})`);
  };

  const validateForm = () => {
    const newErrors = {};

    // Commodity Name
    if (!formData.commodityName.trim()) {
      newErrors.commodityName = 'Commodity name is required.';
    }

    // Moisture (0 to 100)
    const moistureNum = parseFloat(formData.moisture);
    if (isNaN(moistureNum) || moistureNum < 0 || moistureNum > 100) {
      newErrors.moisture = 'Moisture content must be a percentage between 0 and 100.';
    }

    // pH (0 to 14)
    const phNum = parseFloat(formData.pH);
    if (isNaN(phNum) || phNum < 0 || phNum > 14) {
      newErrors.pH = 'pH value must be between 0.0 and 14.0.';
    }

    // Relative Humidity (0 to 100)
    const rhNum = parseFloat(formData.relativeHumidity);
    if (isNaN(rhNum) || rhNum < 0 || rhNum > 100) {
      newErrors.relativeHumidity = 'Relative humidity must be between 0% and 100%.';
    }

    // Shelf Life (> 0)
    const shelfLifeNum = parseInt(formData.shelfLifeDays, 10);
    if (isNaN(shelfLifeNum) || shelfLifeNum <= 0) {
      newErrors.shelfLifeDays = 'Target shelf life must be a positive number greater than 0.';
    }

    // Storage Temperature (numeric)
    const tempNum = parseFloat(formData.storageTemp);
    if (isNaN(tempNum)) {
      newErrors.storageTemp = 'Storage temperature must be a valid numeric value.';
    }

    // Transportation Duration (>= 0)
    const transportNum = parseInt(formData.transportDays, 10);
    if (isNaN(transportNum) || transportNum < 0) {
      newErrors.transportDays = 'Transportation days must be 0 or higher.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to the first error
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    // Save data locally to sessionStorage and route state
    try {
      sessionStorage.setItem('packwise_recommendation_input', JSON.stringify(formData));
    } catch (err) {
      console.warn('Could not write to sessionStorage', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/results', { state: { formData } });
    }, 450);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setSelectedPresetId('');
    setStatusMessage('Form reset to default.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">Phase 1 Data Capture</Badge>
          <span className="text-xs text-slate-400">Step 1 of Decision Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Food Packaging Recommendation Form
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl">
          Enter intrinsic food chemistry, physiology, and distribution parameters. The PackWise AI rule engine evaluates barrier criteria (OTR/WVTR), respiration kinetics, and environmental targets.
        </p>
      </div>

      {/* Preset Commodity Quick Selectors */}
      <Card className="p-6 border-slate-800 bg-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Zap className="w-4 h-4 text-brand-400" />
            <span>Quick-Load Preset Commodity Profile</span>
          </div>
          <span className="text-xs text-slate-400">Click a preset to populate scientific values automatically:</span>
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

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Section 1: Food Chemistry & Physicochemical Properties */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              01
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Food Commodity Characteristics</h2>
              <p className="text-xs text-slate-400">Specify chemical composition and degradation susceptibility.</p>
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
                aria-invalid={errors.commodityName ? 'true' : 'false'}
                aria-describedby={errors.commodityName ? 'commodityName-error' : undefined}
              />
              {errors.commodityName && (
                <p id="commodityName-error" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
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

            {/* Moisture Content % */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="moisture" className="block text-xs font-semibold text-slate-200">
                  Moisture Content (%) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">0 – 100%</span>
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
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all ${
                  errors.moisture
                    ? 'border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/20'
                }`}
                aria-invalid={errors.moisture ? 'true' : 'false'}
                aria-describedby={errors.moisture ? 'moisture-error' : undefined}
              />
              {errors.moisture && (
                <p id="moisture-error" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.moisture}
                </p>
              )}
            </div>

            {/* Oil / Fat Level */}
            <div className="space-y-1.5">
              <label htmlFor="oilFatLevel" className="block text-xs font-semibold text-slate-200">
                Oil & Fat Level (Oxidation Risk)
              </label>
              <select
                id="oilFatLevel"
                name="oilFatLevel"
                value={formData.oilFatLevel}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              >
                {OIL_FAT_LEVELS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* pH Value */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="pH" className="block text-xs font-semibold text-slate-200">
                  pH Value <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Scale: 0.0 – 14.0</span>
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
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.pH
                    ? 'border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/20'
                }`}
                aria-invalid={errors.pH ? 'true' : 'false'}
                aria-describedby={errors.pH ? 'pH-error' : undefined}
              />
              {errors.pH && (
                <p id="pH-error" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.pH}
                </p>
              )}
            </div>

            {/* Respiration Rate */}
            <div className="space-y-1.5">
              <label htmlFor="respirationRate" className="block text-xs font-semibold text-slate-200">
                Respiration Rate (Fresh Produce)
              </label>
              <select
                id="respirationRate"
                name="respirationRate"
                value={formData.respirationRate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              >
                {RESPIRATION_RATES.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Section 2: Storage & Environmental Distribution Parameters */}
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
                aria-invalid={errors.storageTemp ? 'true' : 'false'}
                aria-describedby={errors.storageTemp ? 'storageTemp-error' : undefined}
              />
              {errors.storageTemp && (
                <p id="storageTemp-error" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
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
                aria-invalid={errors.relativeHumidity ? 'true' : 'false'}
                aria-describedby={errors.relativeHumidity ? 'relativeHumidity-error' : undefined}
              />
              {errors.relativeHumidity && (
                <p id="relativeHumidity-error" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
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
                aria-invalid={errors.shelfLifeDays ? 'true' : 'false'}
                aria-describedby={errors.shelfLifeDays ? 'shelfLifeDays-error' : undefined}
              />
              {errors.shelfLifeDays && (
                <p id="shelfLifeDays-error" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
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
                aria-invalid={errors.transportDays ? 'true' : 'false'}
                aria-describedby={errors.transportDays ? 'transportDays-error' : undefined}
              />
              {errors.transportDays && (
                <p id="transportDays-error" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.transportDays}
                </p>
              )}
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={resetForm}
            className="w-full sm:w-auto px-4 py-3 text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 hover:bg-slate-900 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            icon={Sparkles}
            iconPosition="right"
            className="w-full sm:w-auto px-8"
          >
            Analyze & Generate Recommendation
          </Button>
        </div>
      </form>

      {/* Decision Support Disclaimer */}
      <DisclaimerBanner compact />
    </div>
  );
}
