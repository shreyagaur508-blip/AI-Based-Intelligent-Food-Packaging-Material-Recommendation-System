import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Thermometer,
  Leaf,
  Package,
  AlertCircle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Zap,
  FlaskConical,
  Truck,
  Layers,
  HelpCircle
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import {
  COMMODITY_CATEGORIES,
  STORAGE_TYPES,
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
import { useTranslation } from '../i18n';

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
  moistureCategory: 'dont_know',
  moisture: '94.0',
  phCategory: 'dont_know',
  pH: '4.3',
  oilFatCategory: 'dont_know',
  oilFatLevel: 'none',
  respirationCategory: 'dont_know',
  respirationRate: 'moderate',
};

export default function RecommendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    t,
    getCommodityName,
    getCategoryName,
    getStorageTypeName,
    getTransportName,
    getFormatName,
    getSustainabilityName,
    getOptionLabel,
  } = useTranslation();

  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState('tomato');
  const [presetNotice, setPresetNotice] = useState(t('form.loaded_preset', { name: 'Tomato' }));
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

  // Handle prefill from AI Voice Assistant
  useEffect(() => {
    const prefill = location.state?.prefill;
    if (prefill && prefill.commodity_name) {
      const commName = prefill.commodity_name;
      // Search matching preset
      const match = PRESET_COMMODITIES.find(
        (p) => p.name.toLowerCase() === commName.toLowerCase() ||
               p.id.toLowerCase() === commName.toLowerCase().replace(/\s+/g, '_')
      );

      if (match) {
        loadPreset(match);
      }

      // Overwrite any explicit suggested parameters
      setFormData((prev) => ({
        ...prev,
        commodityName: commName,
        category: prefill.category || prev.category,
        storageType: prefill.storage_type ? prefill.storage_type.toLowerCase() : prev.storageType,
        shelfLifeDays: prefill.desired_shelf_life_days ? prefill.desired_shelf_life_days.toString() : prev.shelfLifeDays,
      }));

      setPresetNotice(t('form.prefilled_notice', { name: getCommodityName(commName) }));
    }
  }, [location.state]);

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
    const phVal = (preset.default_ph ?? preset.pH ?? 6.0).toString();
    const rawOil = (preset.oil_fat_level || preset.oilFatLevel || 'low').toLowerCase();
    const rawResp = (preset.respiration_class || preset.respirationRate || 'very_low').toLowerCase();
    const shelfLifeNum = preset.base_shelf_life_days ?? preset.shelfLifeDays ?? 30;

    setFormData((prev) => ({
      ...prev,
      commodityName: preset.name,
      category: preset.category || 'Other / Custom',
      moistureCategory: 'dont_know',
      moisture: moistureVal,
      oilFatCategory: 'dont_know',
      oilFatLevel: rawOil,
      phCategory: 'dont_know',
      pH: phVal,
      respirationCategory: 'dont_know',
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
    setPresetNotice(t('form.loaded_preset', { name: getCommodityName(preset.name) }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.commodityName || !formData.commodityName.trim()) {
      newErrors.commodityName = t('validation.commodity_required');
    }

    if (isAdvancedMode) {
      if (formData.moistureCategory === 'exact') {
        const moistureNum = parseFloat(formData.moisture);
        if (isNaN(moistureNum) || moistureNum < 0 || moistureNum > 100) {
          newErrors.moisture = t('validation.moisture_range');
        }
      }

      if (formData.phCategory === 'exact') {
        const phNum = parseFloat(formData.pH);
        if (isNaN(phNum) || phNum < 0 || phNum > 14) {
          newErrors.pH = t('validation.ph_range');
        }
      }

      const shelfLifeNum = parseInt(formData.shelfLifeDays, 10);
      if (isNaN(shelfLifeNum) || shelfLifeNum <= 0) {
        newErrors.shelfLifeDays = t('validation.shelf_life_invalid');
      }

      if (formData.storageTemp !== '' && formData.storageTemp !== undefined) {
        const tempNum = parseFloat(formData.storageTemp);
        if (isNaN(tempNum)) {
          newErrors.storageTemp = t('validation.storage_temp_invalid');
        }
      }

      if (formData.relativeHumidity !== '' && formData.relativeHumidity !== undefined) {
        const rhNum = parseFloat(formData.relativeHumidity);
        if (isNaN(rhNum) || rhNum < 10 || rhNum > 100) {
          newErrors.relativeHumidity = t('validation.relative_humidity_invalid');
        }
      }

      if (formData.transportDays !== '' && formData.transportDays !== undefined) {
        const tDays = parseInt(formData.transportDays, 10);
        if (isNaN(tDays) || tDays <= 0) {
          newErrors.transportDays = t('validation.transit_days_invalid');
        }
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
        use_defaults: true,
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
    setPresetNotice(t('form.form_reset_notice'));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Translated option arrays
  const simpleShelfLifeOptions = [
    { value: 'short', label: t('form.shelf_life_short') },
    { value: 'medium', label: t('form.shelf_life_medium') },
    { value: 'long', label: t('form.shelf_life_long') },
  ];

  const simpleTransportOptions = [
    { value: 'local', label: t('form.transport_local') },
    { value: 'long_distance', label: t('form.transport_long_distance') },
  ];

  const simpleSustainabilityOptions = [
    { value: 'low', label: t('form.sust_low') },
    { value: 'medium', label: t('form.sust_medium') },
    { value: 'high', label: t('form.sust_high') },
  ];

  const moistureOptions = MOISTURE_CATEGORY_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.value === 'dont_know' ? t('form.opt_dont_know') : (getOptionLabel(opt.value) !== opt.value ? getOptionLabel(opt.value) : opt.label),
  }));

  const phOptions = PH_CATEGORY_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.value === 'dont_know' ? t('form.opt_dont_know') : (getOptionLabel(opt.value) !== opt.value ? getOptionLabel(opt.value) : opt.label),
  }));

  const oilFatOptions = OIL_FAT_CATEGORY_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.value === 'dont_know' ? t('form.opt_dont_know') : (getOptionLabel(opt.value) !== opt.value ? getOptionLabel(opt.value) : opt.label),
  }));

  const respirationOptions = RESPIRATION_CATEGORY_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.value === 'dont_know' ? t('form.opt_dont_know') : (getOptionLabel(opt.value) !== opt.value ? getOptionLabel(opt.value) : opt.label),
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="brand" size="sm">{t('form.badge')}</Badge>
            <span className="text-xs text-slate-400">{t('form.badge_sub')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('form.title')}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            {t('form.subtitle')}
          </p>
        </div>

        {/* Simple vs Advanced Mode Toggle with new explicit farmer/lab labels */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-inner gap-1.5 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsAdvancedMode(false)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all text-left sm:text-center ${
              !isAdvancedMode
                ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {t('form.simple_mode')}
          </button>
          <button
            type="button"
            onClick={() => setIsAdvancedMode(true)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              isAdvancedMode
                ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('form.advanced_mode')}</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Select Bar */}
      <Card className="p-4 sm:p-5 border-slate-800/90 bg-slate-900/60 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>{t('form.quick_presets')}</span>
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
                <span>{getCommodityName(preset.name)}</span>
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
              {t('form.backend_error_title')}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {apiError}
            </p>
            <div className="pt-1 flex items-center gap-3">
              <Button size="sm" variant="secondary" onClick={handleSubmit}>
                {t('form.btn_retry')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSubmitting ? (
        <LoadingSpinner
          title={t('common.calculating')}
          subtitle={t('common.evaluating_sub')}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: PRODUCT DETAILS */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t('form.sec_1_title')}</h2>
                <p className="text-xs text-slate-400">{t('form.sec_1_desc')}</p>
              </div>
            </div>

            <div className={`grid grid-cols-1 ${isAdvancedMode ? 'sm:grid-cols-2' : ''} gap-5`}>
              {/* Commodity Name */}
              <Input
                name="commodityName"
                label={t('form.commodity_label')}
                placeholder={t('form.commodity_placeholder')}
                value={formData.commodityName}
                onChange={handleChange}
                required
                error={errors.commodityName}
                helperText={t('form.commodity_helper')}
                tooltip={t('form.commodity_tooltip')}
              />

              {/* Food Category - ONLY in Advanced Mode */}
              {isAdvancedMode && (
                <Select
                  name="category"
                  label={t('form.category_label')}
                  value={formData.category}
                  onChange={handleChange}
                  options={COMMODITY_CATEGORIES.map((c) => ({ value: c, label: getCategoryName(c) }))}
                  helperText={t('form.category_helper')}
                  tooltip={t('form.category_tooltip')}
                />
              )}
            </div>
          </Card>

          {/* SECTION 2: STORAGE & TRANSPORT */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t('form.sec_2_title')}</h2>
                <p className="text-xs text-slate-400">{t('form.sec_2_desc')}</p>
              </div>
            </div>

            {/* Storage Condition Selection Cards (Ambient / Chilled / Frozen) */}
            <div className="space-y-2">
              <label className="form-label">{t('form.storage_label')}</label>
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
                      <div className="text-xs text-slate-300 font-medium">{getStorageTypeName(st.id)}</div>
                      <div className="text-[11px] text-slate-400 mt-2">
                        {t('form.default_conditions', { temp: st.defaultTemp, rh: st.defaultRH })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* In Simple Mode: Shelf-life tier, Transport tier, Sustainability preference */}
            {!isAdvancedMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <Select
                  name="shelfLifeCategory"
                  label={t('form.shelf_life_target_label')}
                  value={formData.shelfLifeCategory}
                  onChange={handleChange}
                  options={simpleShelfLifeOptions}
                  helperText={t('form.shelf_life_target_helper')}
                  tooltip={t('form.shelf_life_target_tooltip')}
                />

                <Select
                  name="transportCategory"
                  label={t('form.logistics_range_label')}
                  value={formData.transportCategory}
                  onChange={handleChange}
                  options={simpleTransportOptions}
                  helperText={t('form.logistics_range_helper')}
                  tooltip={t('form.logistics_range_tooltip')}
                />

                <Select
                  name="sustainabilityPreference"
                  label={t('form.sustainability_label')}
                  value={formData.sustainabilityPreference}
                  onChange={handleChange}
                  options={simpleSustainabilityOptions}
                  helperText={t('form.sustainability_helper')}
                  tooltip={t('form.sustainability_tooltip')}
                />
              </div>
            ) : (
              /* In Advanced Mode: Numeric shelf life days, transport condition, storage temp, RH, transit days, format, sustainability */
              <div className="space-y-5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    name="shelfLifeDays"
                    type="number"
                    min="1"
                    max="1000"
                    label={t('form.shelf_life_days_label')}
                    value={formData.shelfLifeDays}
                    onChange={handleChange}
                    suffix={t('common.days')}
                    error={errors.shelfLifeDays}
                    helperText={t('form.shelf_life_days_helper')}
                  />

                  <Select
                    name="transportCondition"
                    label={t('form.transport_condition_label')}
                    value={formData.transportCondition}
                    onChange={handleChange}
                    options={TRANSPORTATION_CONDITIONS.map((tCond) => ({ value: tCond, label: getTransportName(tCond) }))}
                    helperText={t('form.transport_condition_helper')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-800/80">
                  <Input
                    name="storageTemp"
                    type="number"
                    step="0.5"
                    label={t('form.storage_temp_label')}
                    value={formData.storageTemp}
                    onChange={handleChange}
                    suffix="°C"
                    error={errors.storageTemp}
                    helperText={t('form.storage_temp_helper')}
                  />

                  <Input
                    name="relativeHumidity"
                    type="number"
                    min="10"
                    max="100"
                    label={t('form.relative_humidity_label')}
                    value={formData.relativeHumidity}
                    onChange={handleChange}
                    suffix="% RH"
                    error={errors.relativeHumidity}
                    helperText={t('form.relative_humidity_helper')}
                  />

                  <Input
                    name="transportDays"
                    type="number"
                    min="1"
                    max="60"
                    label={t('form.transit_days_label')}
                    value={formData.transportDays}
                    onChange={handleChange}
                    suffix={t('common.days')}
                    error={errors.transportDays}
                    helperText={t('form.transit_days_helper')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-800/80">
                  <Select
                    name="packagingFormat"
                    label={t('form.format_label')}
                    value={formData.packagingFormat}
                    onChange={handleChange}
                    options={PACKAGING_FORMATS.map((f) => ({ value: f, label: getFormatName(f) }))}
                    helperText={t('form.format_helper')}
                    tooltip={t('form.format_tooltip')}
                  />

                  <Select
                    name="sustainabilityPreference"
                    label={t('form.sustainability_label')}
                    value={formData.sustainabilityPreference}
                    onChange={handleChange}
                    options={SUSTAINABILITY_PREFERENCES.map((s) => ({ value: s.id, label: getSustainabilityName(s.id) }))}
                    helperText={t('form.sustainability_helper')}
                    tooltip={t('form.sustainability_tooltip')}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* SECTION 3: ADVANCED OPTIONS (ONLY IF YOU HAVE DATA) - ONLY VISIBLE IN ADVANCED MODE */}
          {isAdvancedMode && (
            <Card className="p-6 sm:p-8 space-y-6 border-indigo-900/40 bg-slate-900/80">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t('form.sec_3_title')}</h2>
                  <p className="text-xs text-slate-400">{t('form.sec_3_desc')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 1. Moisture */}
                <div className="space-y-3">
                  <Select
                    name="moistureCategory"
                    label={t('form.moisture_label')}
                    value={formData.moistureCategory}
                    onChange={handleChange}
                    options={moistureOptions}
                    helperText={t('form.moisture_helper')}
                    tooltip={t('form.moisture_tooltip')}
                  />
                  {formData.moistureCategory === 'exact' && (
                    <div className="pt-2 pl-2 border-l-2 border-indigo-500/40">
                      <Input
                        name="moisture"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        label={t('form.exact_moisture_label')}
                        value={formData.moisture}
                        onChange={handleChange}
                        suffix="%"
                        error={errors.moisture}
                        helperText={t('form.exact_moisture_helper')}
                      />
                    </div>
                  )}
                </div>

                {/* 2. pH */}
                <div className="space-y-3">
                  <Select
                    name="phCategory"
                    label={t('form.ph_label')}
                    value={formData.phCategory}
                    onChange={handleChange}
                    options={phOptions}
                    helperText={t('form.ph_helper')}
                    tooltip={t('form.ph_tooltip')}
                  />
                  {formData.phCategory === 'exact' && (
                    <div className="pt-2 pl-2 border-l-2 border-indigo-500/40">
                      <Input
                        name="pH"
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        label={t('form.exact_ph_label')}
                        value={formData.pH}
                        onChange={handleChange}
                        suffix="pH"
                        error={errors.pH}
                        helperText={t('form.exact_ph_helper')}
                      />
                    </div>
                  )}
                </div>

                {/* 3. Oil / Fat */}
                <div className="space-y-3">
                  <Select
                    name="oilFatCategory"
                    label={t('form.oil_fat_label')}
                    value={formData.oilFatCategory}
                    onChange={handleChange}
                    options={oilFatOptions}
                    helperText={t('form.oil_fat_helper')}
                    tooltip={t('form.oil_fat_tooltip')}
                  />
                </div>

                {/* 4. Respiration Rate */}
                <div className="space-y-3">
                  <Select
                    name="respirationCategory"
                    label={t('form.respiration_label')}
                    value={formData.respirationCategory}
                    onChange={handleChange}
                    options={respirationOptions}
                    helperText={t('form.respiration_helper')}
                    tooltip={t('form.respiration_tooltip')}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              icon={RotateCcw}
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              {t('form.btn_reset')}
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
                {t('form.btn_submit')}
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
