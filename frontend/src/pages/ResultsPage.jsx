import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Flame,
  Droplets,
  Wind,
  Thermometer,
  FileText,
  Clock,
  Activity,
  Zap,
  Info,
  DollarSign,
  Leaf,
  Package,
  Truck,
  RotateCcw,
  Ban,
  Scale,
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

/**
 * Maps material name to a qualitative ASTM barrier performance description.
 */
function getQualitativeBarrierDescription(materialName = '', structure = '') {
  const name = (materialName + ' ' + structure).toLowerCase();
  if (name.includes('foil') || name.includes('alu')) {
    return 'Absolute Hermetic Barrier (OTR & WVTR < 0.1)';
  }
  if (name.includes('evoh')) {
    return 'Ultra-High Gas Barrier (OTR < 2.0) & High Moisture Barrier';
  }
  if (name.includes('met-pet') || name.includes('metallized')) {
    return 'High Gas (OTR ~1.2), Moisture & 100% UV Light Barrier';
  }
  if (name.includes('micro-perforated') || name.includes('perforated')) {
    return 'Calibrated EMAP Gas Exchange & Anti-Fog Moisture Venting';
  }
  if (name.includes('pla') || name.includes('polylactic')) {
    return 'High Breathability & High Water Vapor Transmission (WVTR > 100)';
  }
  if (name.includes('ldpe')) {
    return 'Standard Moisture Barrier (WVTR ~18) & Sub-Zero Dart Impact Flexibility';
  }
  if (name.includes('hdpe')) {
    return 'High Water Vapor Barrier (WVTR ~6.5) & High Tensile Modulus';
  }
  if (name.includes('bopp')) {
    return 'High Moisture Barrier (WVTR ~4.5) & High Optical Gloss Overwrap';
  }
  if (name.includes('pp')) {
    return 'Good Moisture Barrier (WVTR ~5.0) & Thermal Reheat Resistance';
  }
  if (name.includes('pet')) {
    return 'Moderate Gas Barrier (OTR ~75) & High Puncture Toughness';
  }
  if (name.includes('paper')) {
    return 'Porous Breathable Fiber Web with PE Sealant Web';
  }
  return 'Engineered Food Barrier Matrix';
}

/**
 * Returns badge variant and label styling for risk categories.
 */
function getRiskBadgeProps(riskLevel = '') {
  const level = (riskLevel || '').toLowerCase();
  if (level === 'high' || level === 'critical' || level === 'very_high' || level === 'very high') {
    return { variant: 'rose', label: 'High Risk', textClass: 'text-rose-400', bgClass: 'bg-rose-500/10 border-rose-500/30' };
  }
  if (level === 'medium' || level === 'moderate') {
    return { variant: 'amber', label: 'Medium Risk', textClass: 'text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/30' };
  }
  return { variant: 'emerald', label: 'Low Risk', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/30' };
}

/**
 * Formats cost tier for visual badges.
 */
function getCostBadgeVariant(costClass = '') {
  const cl = (costClass || '').toLowerCase();
  if (cl === 'low' || cl === 'budget') return 'emerald';
  if (cl === 'medium' || cl === 'moderate') return 'blue';
  return 'purple';
}

export default function ResultsPage() {
  const location = useLocation();
  const [recommendation, setRecommendation] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showDisqualified, setShowDisqualified] = useState(true);

  useEffect(() => {
    // 1. Try React Router route state
    if (location.state?.recommendation) {
      setRecommendation(location.state.recommendation);
      setFormData(location.state.formData || location.state.recommendation.input_summary || null);
      return;
    }

    // 2. Try sessionStorage cached recommendation
    try {
      const storedResult = sessionStorage.getItem('packwise_recommendation_result');
      const storedInput = sessionStorage.getItem('packwise_recommendation_input');
      if (storedResult) {
        const parsed = JSON.parse(storedResult);
        setRecommendation(parsed);
        setFormData(storedInput ? JSON.parse(storedInput) : parsed.input_summary || null);
      }
    } catch (err) {
      console.warn('Unable to load cached recommendation from sessionStorage', err);
    }
  }, [location.state]);

  // Empty State if accessed directly without submission
  if (!recommendation) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <Card className="p-10 border-dashed border-slate-800 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400 shadow-xl">
            <Info className="w-8 h-8 text-brand-400" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white">No Recommendation Found</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              No active recommendation evaluation was detected in this session. Please fill in the Food Packaging Recommendation form to generate live barrier and material results.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/recommend">
              <Button size="lg" icon={Sparkles}>
                Launch Recommendation Wizard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Extract normalized fields from API response
  const summary = recommendation.input_summary || recommendation.commodity_summary || formData || {};
  const risks = recommendation.risk_profile || {};
  const reqs = recommendation.requirements || {};
  const primary = recommendation.primary_recommendation || {};
  const alternatives = recommendation.alternative_recommendations || [];
  const thickness = recommendation.suggested_thickness_range_microns || {
    min_microns: 30.0,
    max_microns: 60.0,
    recommended_microns: 45.0,
  };
  const disqualified = recommendation.disqualified_materials || [];
  const warnings = recommendation.warnings || [];
  const disclaimerText = recommendation.disclaimer || (
    "This system provides preliminary packaging decision support. Final commercial packaging must be validated using food-contact compliance checks, migration testing, barrier testing, seal integrity testing, transport testing, and actual shelf-life studies."
  );

  const plainSummary = recommendation.plain_language_summary || {
    must_do: reqs.breathable_film_needed
      ? "Allow fresh produce to breathe naturally (controlled oxygen and CO2 exchange) while preventing sweat/condensation buildup to stop decay and mold."
      : (risks.oxidation_risk === 'high' && risks.moisture_risk === 'high'
          ? "Block outside air (oxygen) and humidity completely to preserve crispness and prevent oils/fats from going rancid."
          : (risks.moisture_risk === 'high'
              ? "Provide a strong moisture barrier to prevent humidity absorption, sogginess, and powder caking."
              : "Provide hygienic barrier protection and containment tailored to storage conditions.")),
    suggested_structure: reqs.breathable_film_needed
      ? `Laser Micro-Perforated or Breathable Film Pouch (${primary.name || 'Breathable Film'})`
      : `${primary.name || 'Protective Packaging'} (${primary.structure || 'Standard Multi-layer'})`,
    storage_guidance: `Store in ${summary.storage_type || 'ambient'} conditions at ~${summary.storage_temperature ?? 20}°C with ${summary.relative_humidity ?? 55}% relative humidity.`,
    key_takeaway: `Optimal choice: ${primary.name || 'Recommended Material'} provides tailored barrier protection for ${summary.commodity_name || 'your product'}.`
  };

  // Combine primary + alternatives for unified comparison table
  const allCandidates = [
    { ...primary, role: 'Primary Recommendation', isPrimary: true },
    ...alternatives.map((alt, idx) => ({ ...alt, role: alt.recommendation_type || `Alternative #${idx + 1}`, isPrimary: false }))
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="md">Deterministic Decision Pipeline</Badge>
            <span className="text-xs text-slate-400">Live API Recommendation Result</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Packaging Recommendation Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Scientifically validated material specification for <span className="font-semibold text-brand-300">{summary.commodity_name || 'Food Commodity'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/recommend">
            <Button variant="secondary" size="sm" icon={ArrowLeft}>
              Edit Parameters
            </Button>
          </Link>
          <Link to="/recommend">
            <Button variant="primary" size="sm" icon={Sparkles}>
              New Evaluation
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Warnings (if any, e.g. Chilling Injury) */}
      {warnings.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 shadow-xl shadow-amber-950/30 flex items-start gap-4 animate-in fade-in duration-300">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
              Critical Physiological Storage Warning
            </h3>
            {warnings.map((warn, idx) => (
              <p key={idx} className="text-xs text-amber-200/90 leading-relaxed font-medium">
                {warn}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 0. Plain Language Summary Section (For Farmers and Non-Technical Users) */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-emerald-950/25 to-slate-900 border-emerald-500/40 shadow-xl shadow-emerald-950/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Plain Language Summary</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Farmer & Operator Friendly
                </span>
              </div>
              <p className="text-xs text-slate-400">Essential packaging guidance in straightforward, easy-to-understand terms</p>
            </div>
          </div>
          <div className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
            Product: {summary.commodity_name || 'Food Commodity'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What the Packaging Must Do */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>What the Packaging Must Do</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {plainSummary.must_do}
            </p>
          </div>

          {/* Suggested Packaging Structure */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-brand-400 text-sm font-bold">
              <Package className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Suggested Packaging Structure</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white">
              {plainSummary.suggested_structure}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {plainSummary.storage_guidance}
            </p>
          </div>
        </div>
      </Card>

      {/* 1. Submitted Commodity Input Summary Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Commodity Profile Summary</h2>
              <p className="text-xs text-slate-400">Physicochemical properties and target distribution conditions</p>
            </div>
          </div>
          <Badge variant="emerald" size="lg" className="self-start sm:self-auto font-bold">
            {summary.commodity_name || 'Custom Product'} ({summary.commodity_category || 'General Food'})
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          <div className="glass-panel p-3.5 space-y-1">
            <span className="text-slate-400 block font-medium">Moisture Content</span>
            <span className="font-semibold text-white text-sm">{summary.moisture_percent}%</span>
          </div>
          <div className="glass-panel p-3.5 space-y-1">
            <span className="text-slate-400 block font-medium">Lipid / Fat Level</span>
            <span className="font-semibold text-white text-sm capitalize">{summary.oil_fat_level || 'Low'}</span>
          </div>
          <div className="glass-panel p-3.5 space-y-1">
            <span className="text-slate-400 block font-medium">pH Level</span>
            <span className="font-semibold text-white text-sm">{summary.ph ?? summary.pH ?? 6.0}</span>
          </div>
          <div className="glass-panel p-3.5 space-y-1">
            <span className="text-slate-400 block font-medium">Respiration Class</span>
            <span className="font-semibold text-white text-sm capitalize">{summary.respiration_rate || 'Low'}</span>
          </div>
          <div className="glass-panel p-3.5 space-y-1">
            <span className="text-slate-400 block font-medium">Target Shelf Life</span>
            <span className="font-semibold text-white text-sm">{summary.desired_shelf_life_days || 30} Days</span>
          </div>
          <div className="glass-panel p-3.5 space-y-1">
            <span className="text-slate-400 block font-medium">Storage Mode & Temp</span>
            <span className="font-semibold text-white text-sm capitalize">
              {summary.storage_type || 'Ambient'} ({summary.storage_temperature}°C, {summary.relative_humidity}% RH)
            </span>
          </div>
          <div className="glass-panel p-3.5 space-y-1">
            <span className="text-slate-400 block font-medium">Logistics Environment</span>
            <span className="font-semibold text-white text-sm">
              {summary.transportation_duration_days || 2}d ({summary.transportation_condition || 'Local'})
            </span>
          </div>
          <div className="glass-panel p-3.5 space-y-1">
            <span className="text-slate-400 block font-medium">Format & Priority</span>
            <span className="font-semibold text-white text-sm capitalize">
              {summary.packaging_format_preference || 'Pouch'} ({summary.sustainability_preference || 'Medium'})
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Food-Risk Classification (6 Risk Profile Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-400" />
              <span>Food Degradation & Handling Risk Profile</span>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluated based on intrinsic water activity, lipid oxidation kinetics, respiration, and storage temperatures
            </p>
          </div>
          <Badge variant="slate" size="sm">6 Risk Pathways</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Risk 1: Moisture Risk */}
          <Card className="p-4 space-y-2 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>Moisture Sorption / Loss</span>
              </div>
              <Badge variant={getRiskBadgeProps(risks.moisture_risk).variant} size="sm">
                {risks.moisture_risk || 'low'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {risks.moisture_risk === 'high'
                ? 'High moisture sensitivity: Prone to sogginess/caking if dry, or severe dehydration/wilting if fresh.'
                : 'Moderate or stable moisture profile under standard sealed packaging.'}
            </p>
          </Card>

          {/* Risk 2: Oxidation Risk */}
          <Card className="p-4 space-y-2 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Lipid Oxidation & Rancidity</span>
              </div>
              <Badge variant={getRiskBadgeProps(risks.oxidation_risk).variant} size="sm">
                {risks.oxidation_risk || 'low'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {risks.oxidation_risk === 'high'
                ? 'High unsaturated fat content: Free radical oxidation causes off-flavors; requires ultra-low OTR barrier.'
                : 'Low lipid concentration; standard ambient oxygen tolerance.'}
            </p>
          </Card>

          {/* Risk 3: Microbial Spoilage Risk */}
          <Card className="p-4 space-y-2 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Microbial Spoilage Risk</span>
              </div>
              <Badge variant={getRiskBadgeProps(risks.microbial_risk).variant} size="sm">
                {risks.microbial_risk || 'low'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {risks.microbial_risk === 'high'
                ? 'High moisture & non-acidic pH (>4.6): Susceptible to bacterial/fungal proliferation.'
                : (summary.storage_type === 'frozen'
                    ? 'Sub-zero temperatures inhibit microbial growth kinetics.'
                    : 'Low moisture activity prevents microbial proliferation.')}
            </p>
          </Card>

          {/* Risk 4: Respiration Risk */}
          <Card className="p-4 space-y-2 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Wind className="w-4 h-4 text-teal-400" />
                <span>Postharvest Respiration</span>
              </div>
              <Badge variant={getRiskBadgeProps(risks.respiration_risk).variant} size="sm">
                {risks.respiration_risk || 'low'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {risks.respiration_risk === 'high'
                ? 'Active aerobic metabolism: Hermetic seals cause anoxia & ethanol fermentation; requires EMAP/breathable film.'
                : 'Processed or non-respiring food; hermetic barrier safe.'}
            </p>
          </Card>

          {/* Risk 5: Mechanical Damage Risk */}
          <Card className="p-4 space-y-2 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Transit Mechanical Damage</span>
              </div>
              <Badge variant={getRiskBadgeProps(risks.mechanical_damage_risk).variant} size="sm">
                {risks.mechanical_damage_risk || 'low'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {risks.mechanical_damage_risk === 'high'
                ? 'Fragile food matrix or extended transit duration (>5d) requires high puncture resistance and cushion.'
                : 'Standard distribution durability requirements.'}
            </p>
          </Card>

          {/* Risk 6: Freezer Burn Risk */}
          <Card className="p-4 space-y-2 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span>Sub-Zero Freezer Burn</span>
              </div>
              <Badge variant={getRiskBadgeProps(risks.freezer_burn_risk).variant} size="sm">
                {risks.freezer_burn_risk || 'low'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {risks.freezer_burn_risk === 'high'
                ? 'Sub-zero ice sublimation risk: Demands ultra-low WVTR and cold flex-crack resistant polymer.'
                : 'Ambient or chilled storage; no sub-zero sublimation risk.'}
            </p>
          </Card>
        </div>
      </div>

      {/* 3. Primary Recommendation Card (Featured Glow Card) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white">Primary Recommended Packaging Material</h2>
          </div>
          <Badge variant="brand" size="md" className="font-bold">Optimal ASTM Match</Badge>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-brand-950/40 border-2 border-brand-500/50 shadow-2xl shadow-brand-500/10 space-y-6 relative overflow-hidden">
          {/* Top highlight row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="brand" size="md" icon={Award}>
                  Rank #1 Primary Match
                </Badge>
                <Badge variant={getCostBadgeVariant(primary.cost_class)} size="md" icon={DollarSign}>
                  Cost Class: <span className="uppercase font-bold ml-1">{primary.cost_class || 'Medium'}</span>
                </Badge>
                <Badge variant="emerald" size="md" icon={Leaf}>
                  Sustainability: <span className="font-bold ml-1">{primary.sustainability_score ?? 85}/100</span>
                </Badge>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {primary.name || 'Optimal Packaging Material'}
              </h3>
              <p className="text-sm text-brand-300 font-medium">
                Layer Structure: <span className="text-white">{primary.structure || 'Standard barrier laminate'}</span>
              </p>
            </div>

            {/* Score Pill */}
            {primary.scores?.total_score && (
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 text-center shrink-0">
                <span className="text-3xl font-extrabold text-brand-300 font-display">
                  {primary.scores.total_score}
                </span>
                <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">
                  MCDA Score / 100
                </span>
              </div>
            )}
          </div>

          {/* Explanatory Scientific Reasons */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
              <span>Scientific Decision Reasoning & Risk Mitigation:</span>
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {(primary.reasons && primary.reasons.length > 0
                ? primary.reasons
                : [
                    'High barrier properties mitigate oxidation and moisture sorption.',
                    'Engineered seal strength prevents transit leakage and contamination.',
                    'Complies with environmental and sustainability optimization criteria.'
                  ]
              ).map((reason, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-3 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                    {idx + 1}
                  </div>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Alternative Recommendations Section */}
      {alternatives.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" />
              <h2 className="text-xl font-bold text-white">Alternative Packaging Options</h2>
            </div>
            <span className="text-xs text-slate-400">Trade-off options for circularity and budget</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alternatives.map((alt, idx) => (
              <Card key={idx} className="p-6 space-y-4 border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={idx === 0 ? 'emerald' : 'blue'} size="sm">
                      {alt.recommendation_type || `Alternative #${idx + 1}`}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant={getCostBadgeVariant(alt.cost_class)} size="sm">
                        Cost: <span className="uppercase font-bold ml-1">{alt.cost_class || 'Medium'}</span>
                      </Badge>
                      <Badge variant="emerald" size="sm">
                        Sust: <span className="font-bold ml-1">{alt.sustainability_score ?? 80}/100</span>
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{alt.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Structure: <span className="text-slate-300">{alt.structure}</span>
                    </p>
                  </div>

                  {alt.reasons && alt.reasons.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {alt.reasons.slice(0, 2).map((r, rIdx) => (
                        <p key={rIdx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {alt.scores?.total_score && (
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>MCDA Score</span>
                    <span className="font-bold text-white text-sm">{alt.scores.total_score} / 100</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. Material Comparison Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white">Candidate Material Comparison Matrix</h2>
          </div>
          <span className="text-xs text-slate-400">Side-by-side multi-criteria evaluation</span>
        </div>

        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Role / Option</th>
                  <th className="py-3.5 px-4">Material Name</th>
                  <th className="py-3.5 px-4">Layer Structure</th>
                  <th className="py-3.5 px-4">Qualitative Barrier Performance</th>
                  <th className="py-3.5 px-4 text-center">Sust. Score</th>
                  <th className="py-3.5 px-4 text-center">Cost Tier</th>
                  <th className="py-3.5 px-4">Key Highlight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {allCandidates.map((item, idx) => (
                  <tr key={idx} className={item.isPrimary ? 'bg-brand-500/5' : 'hover:bg-slate-850/50 transition-colors'}>
                    <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.isPrimary ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.isPrimary ? '★ Primary' : item.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">{item.name}</td>
                    <td className="py-3.5 px-4 text-slate-400 min-w-[200px]">{item.structure}</td>
                    <td className="py-3.5 px-4 text-slate-300 min-w-[240px]">
                      {getQualitativeBarrierDescription(item.name, item.structure)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                      {item.sustainability_score ?? 85}/100
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="capitalize font-semibold text-slate-200">{item.cost_class || 'Medium'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 min-w-[220px]">
                      {item.highlight || (item.reasons && item.reasons[0]) || 'Optimal technical compatibility.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 6. Technical Barrier & Packaging Specifications Grid */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Derived ASTM Packaging Requirements</h2>
            <p className="text-xs text-slate-400">Standardized transmission rates and functional manufacturing thresholds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* OTR */}
          <div className="glass-panel p-4 space-y-1.5">
            <span className="text-slate-400 block font-medium">Required OTR Category (Gas Barrier)</span>
            <span className="font-bold text-white text-sm capitalize">
              {reqs.required_otr_category || recommendation.otr_requirement_category || 'Low'}
            </span>
            <span className="text-[11px] text-slate-400 block">ASTM D3985 Oxygen Transmission Rate tier</span>
          </div>

          {/* WVTR */}
          <div className="glass-panel p-4 space-y-1.5">
            <span className="text-slate-400 block font-medium">Required WVTR Category (Moisture Barrier)</span>
            <span className="font-bold text-white text-sm capitalize">
              {reqs.required_wvtr_category || recommendation.wvtr_requirement_category || 'Low'}
            </span>
            <span className="text-[11px] text-slate-400 block">ASTM F1249 Water Vapor Transmission Rate tier</span>
          </div>

          {/* Thickness Range */}
          <div className="glass-panel p-4 space-y-1.5">
            <span className="text-slate-400 block font-medium">Suggested Thickness Gauge</span>
            <span className="font-bold text-white text-sm">
              {thickness.recommended_microns || 45} µm ({thickness.min_microns || 30} - {thickness.max_microns || 60} µm)
            </span>
            <span className="text-[11px] text-slate-400 block">Target extrusion gauge range in microns</span>
          </div>

          {/* Sealability */}
          <div className="glass-panel p-4 space-y-1.5">
            <span className="text-slate-400 block font-medium">Heat Sealability Requirement</span>
            <span className="font-bold text-white text-sm capitalize">
              {reqs.sealability_requirement || recommendation.sealability_requirement || 'High'}
            </span>
            <span className="text-[11px] text-slate-400 block">Ensures hermetic seam integrity under distribution stress</span>
          </div>

          {/* Mechanical Strength */}
          <div className="glass-panel p-4 space-y-1.5">
            <span className="text-slate-400 block font-medium">Mechanical & Puncture Strength</span>
            <span className="font-bold text-white text-sm capitalize">
              {reqs.mechanical_strength_requirement || recommendation.mechanical_strength_requirement || 'Medium'}
            </span>
            <span className="text-[11px] text-slate-400 block">Dart impact and flex-crack resistance rating</span>
          </div>

          {/* MAP Suitability */}
          <div className="glass-panel p-4 space-y-1.5">
            <span className="text-slate-400 block font-medium">MAP Gas Flush Suitability</span>
            <span className="font-bold text-brand-300 text-sm">
              {recommendation.map_suitability || (reqs.map_suitable ? 'Modified Atmosphere Packaging (MAP) Compatible' : 'Standard Ambient Atmosphere')}
            </span>
            <span className="text-[11px] text-slate-400 block">Recommended gas mix flushing protocol</span>
          </div>
        </div>

        {/* Breathable Film & Storage Recommendation Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              Breathable / Micro-Perforated Guidance:
            </span>
            <p className="text-slate-400">
              {recommendation.breathable_or_microperforated_recommendation || (
                reqs.breathable_film_needed
                  ? 'Recommended: Laser micro-perforated or breathable film to balance respiration.'
                  : 'Not recommended: Solid hermetic gas barrier required.'
              )}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              Storage Environment Guidance:
            </span>
            <p className="text-slate-400">
              {recommendation.storage_recommendation || (
                `Store at ${summary.storage_temperature || 20}°C (${summary.storage_type || 'ambient'}) with relative humidity ${summary.relative_humidity || 55}%.`
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* 7. Disqualified Materials Section */}
      {disqualified.length > 0 && (
        <Card className="p-6 border-slate-800 space-y-4">
          <button
            type="button"
            onClick={() => setShowDisqualified(!showDisqualified)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Disqualified Materials ({disqualified.length})</h3>
                <p className="text-xs text-slate-400">Materials eliminated during non-negotiable safety and degradation gatekeeping</p>
              </div>
            </div>
            <div className="text-slate-400 flex items-center gap-1 text-xs">
              <span>{showDisqualified ? 'Hide Analysis' : 'Show Analysis'}</span>
              {showDisqualified ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showDisqualified && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              {disqualified.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between text-rose-300 font-bold">
                    <span>{item.material_name}</span>
                    <Badge variant="rose" size="sm">Eliminated</Badge>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 8. Mandatory Decision Support Disclaimer */}
      <div className="p-5 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-amber-950/30 border border-amber-500/40 rounded-2xl shadow-xl space-y-2">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wide">
              Engineering Decision Support & Regulatory Validation Notice
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {disclaimerText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
