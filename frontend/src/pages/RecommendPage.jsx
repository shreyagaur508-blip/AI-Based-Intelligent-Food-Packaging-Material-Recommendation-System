import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  Thermometer,
  Truck,
  Leaf,
  Package,
  AlertCircle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Zap,
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
  const location = useLocation();
  const { t, getCommodityName, getCategoryName, getStorageTypeName } = useTranslation();

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

      setPresetNotice(`✨ Pre-filled parameters from PackWise AI Assistant for ${commName}`);
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
    setPresetNotice(t('form.loaded_preset', { name: getCommodityName(preset.name) }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.commodityName.trim()) {
      newErrors.commodityName = t('form.commodity_helper');
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
    setPresetNotice(t('form.form_reset_notice'));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

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
            {t('form.simple_mode')}
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
            <span>{t('form.advanced_mode')}</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Select Bar */}
      <Card className="p-4 sm:p-5 border-slate-800/90 bg-slate-900/60">
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
          {/* 1. PRODUCT DETAILS CARD */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t('form.sec_1_title')}</h2>
                <p className="text-xs text-slate-400">{t('form.sec_1_desc')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

              {/* Food Category */}
              <Select
                name="category"
                label={t('form.category_label')}
                value={formData.category}
                onChange={handleChange}
                options={COMMODITY_CATEGORIES.map((c) => ({ value: c, label: getCategoryName(c) }))}
                helperText={t('form.category_helper')}
                tooltip={t('form.category_tooltip')}
              />
            </div>

            {/* In Advanced Mode: Moisture, pH, Fat, Respiration */}
            {isAdvancedMode && (
              <div className="pt-4 border-t border-slate-800/80 space-y-5">
                <div className="flex items-center gap-2">
                  <Badge variant="teal" size="xs">{t('form.physicochemical_badge')}</Badge>
                  <span className="text-xs text-slate-400">{t('form.physicochemical_desc')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Moisture Category */}
                  <div>
                    <Select
                      name="moistureCategory"
                      label={t('form.moisture_label')}
                      value={formData.moistureCategory}
                      onChange={handleChange}
                      options={MOISTURE_CATEGORY_OPTIONS}
                      helperText={t('form.moisture_helper')}
                      tooltip={t('form.moisture_tooltip')}
                    />
                    {formData.moistureCategory === 'exact' && (
                      <div className="mt-3">
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

                  {/* pH Category */}
                  <div>
                    <Select
                      name="phCategory"
                      label={t('form.ph_label')}
                      value={formData.phCategory}
                      onChange={handleChange}
                      options={PH_CATEGORY_OPTIONS}
                      helperText={t('form.ph_helper')}
                      tooltip={t('form.ph_tooltip')}
                    />
                    {formData.phCategory === 'exact' && (
                      <div className="mt-3">
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

                  {/* Oil / Fat Category */}
                  <div>
                    <Select
                      name="oilFatCategory"
                      label={t('form.oil_fat_label')}
                      value={formData.oilFatCategory}
                      onChange={handleChange}
                      options={OIL_FAT_CATEGORY_OPTIONS}
                      helperText={t('form.oil_fat_helper')}
                      tooltip={t('form.oil_fat_tooltip')}
                    />
                  </div>

                  {/* Respiration Category */}
                  <div>
                    <Select
                      name="respirationCategory"
                      label={t('form.respiration_label')}
                      value={formData.respirationCategory}
                      onChange={handleChange}
                      options={RESPIRATION_CATEGORY_OPTIONS}
                      helperText={t('form.respiration_helper')}
                      tooltip={t('form.respiration_tooltip')}
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
                <h2 className="text-lg font-bold text-white">{t('form.sec_2_title')}</h2>
                <p className="text-xs text-slate-400">{t('form.sec_2_desc')}</p>
              </div>
            </div>

            {/* Storage Condition Selection Cards */}
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
                    label={t('form.shelf_life_target_label')}
                    value={formData.shelfLifeCategory}
                    onChange={handleChange}
                    options={SIMPLE_SHELF_LIFE_OPTIONS}
                    helperText={t('form.shelf_life_target_helper')}
                    tooltip={t('form.shelf_life_target_tooltip')}
                  />

                  <Select
                    name="transportCategory"
                    label={t('form.logistics_range_label')}
                    value={formData.transportCategory}
                    onChange={handleChange}
                    options={SIMPLE_TRANSPORT_OPTIONS}
                    helperText={t('form.logistics_range_helper')}
                    tooltip={t('form.logistics_range_tooltip')}
                  />
                </>
              ) : (
                <>
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
                    options={TRANSPORTATION_CONDITIONS.map((tCond) => ({ value: tCond, label: tCond }))}
                    helperText={t('form.transport_condition_helper')}
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
                  label={t('form.storage_temp_label')}
                  value={formData.storageTemp}
                  onChange={handleChange}
                  suffix="°C"
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
                  helperText={t('form.transit_days_helper')}
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
                <h2 className="text-lg font-bold text-white">{t('form.sec_3_title')}</h2>
                <p className="text-xs text-slate-400">{t('form.sec_3_desc')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Packaging Format */}
              <Select
                name="packagingFormat"
                label={t('form.format_label')}
                value={formData.packagingFormat}
                onChange={handleChange}
                options={PACKAGING_FORMATS.map((f) => ({ value: f, label: f }))}
                helperText={t('form.format_helper')}
                tooltip={t('form.format_tooltip')}
              />

              {/* Sustainability Preference */}
              <Select
                name="sustainabilityPreference"
                label={t('form.sustainability_label')}
                value={formData.sustainabilityPreference}
                onChange={handleChange}
                options={SUSTAINABILITY_PREFERENCES.map((s) => ({ value: s.id, label: s.label }))}
                helperText={t('form.sustainability_helper')}
                tooltip={t('form.sustainability_tooltip')}
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
