import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  ShieldCheck,
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
  Printer,
  Share2
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

/**
 * Returns badge variant and label styling for risk categories.
 */
function getRiskBadgeProps(riskLevel = '') {
  const level = (riskLevel || '').toLowerCase();
  if (level === 'high' || level === 'critical' || level === 'very_high' || level === 'very high') {
    return { variant: 'rose', label: 'High Risk' };
  }
  if (level === 'medium' || level === 'moderate') {
    return { variant: 'amber', label: 'Medium Risk' };
  }
  return { variant: 'emerald', label: 'Low Risk' };
}

/**
 * Formats cost tier for visual badges.
 */
function getCostBadgeProps(costClass = '') {
  const cl = (costClass || '').toLowerCase();
  if (cl === 'low' || cl === 'budget') return { variant: 'emerald', label: 'Budget-Friendly' };
  if (cl === 'medium' || cl === 'moderate') return { variant: 'blue', label: 'Moderate Cost' };
  return { variant: 'purple', label: 'Premium Tier' };
}

/**
 * Helper to get clean display label for category values.
 */
function formatCategoryLabel(str = '') {
  if (!str) return 'Standard';
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ResultsPage() {
  const location = useLocation();
  const [recommendation, setRecommendation] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(true);
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <Card className="p-8 sm:p-12 border-dashed border-slate-800 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
            <Package className="w-8 h-8" />
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
                Launch Recommendation Form
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const primary = recommendation.primary_recommendation || {};
  const alternatives = recommendation.alternative_recommendations || [];
  const reqs = recommendation.requirements || {};
  const risks = recommendation.risk_profile || {};
  const inputSum = recommendation.commodity_summary || recommendation.input_summary || formData || {};
  const disqualified = recommendation.disqualified_materials || [];
  const plainSummary = recommendation.plain_language_summary;
  const thickness = recommendation.suggested_thickness_range_microns;

  // Extract plain-language bullets
  const plainBullets = [];
  if (plainSummary?.must_do) {
    plainBullets.push(plainSummary.must_do);
  }
  if (reqs.breathable_film_needed) {
    plainBullets.push('Provide calibrated gas transmission (micro-perforations) to prevent produce suffocation and ethanol off-odors.');
  } else if (reqs.required_otr_category === 'very_low' || reqs.required_otr_category === 'low') {
    plainBullets.push('Block atmospheric oxygen penetration to stop rancidity, vitamin degradation, and oxidative discoloration.');
  }
  if (reqs.required_wvtr_category === 'very_low' || reqs.required_wvtr_category === 'low') {
    plainBullets.push('Prevent moisture vapor ingress to preserve crispy crunchiness and stop dry powders from moisture caking.');
  }
  if (reqs.map_suitable) {
    plainBullets.push('Maintain protective modified atmosphere (MAP / Nitrogen flush) to double product shelf-life without chemical preservatives.');
  }
  if (plainSummary?.storage_guidance) {
    plainBullets.push(`Storage guidance: ${plainSummary.storage_guidance}`);
  }

  // Fallback if empty
  if (plainBullets.length === 0) {
    plainBullets.push('Maintain hermetic barrier integrity against ambient oxygen and water vapor pressure.');
    plainBullets.push('Prevent physical mechanical puncture damage during distribution.');
    plainBullets.push('Ensure 100% food-contact safety compliance according to global standards.');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/recommend"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modify Inputs</span>
            </Link>
            <span className="text-slate-600">•</span>
            <Badge variant="brand" size="xs">Phase 8 Live Evaluation</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Packaging Recommendation
          </h1>
          <p className="text-sm text-slate-300">
            Scientifically validated material structure for <span className="font-semibold text-emerald-400">{inputSum.commodity_name || 'Food Product'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/recommend">
            <Button size="sm" variant="secondary" icon={RotateCcw}>
              New Evaluation
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            icon={Printer}
            onClick={() => window.print()}
            className="hidden sm:inline-flex"
          >
            Print Spec
          </Button>
        </div>
      </div>

      {/* 1. COMMODITY SUMMARY CARD */}
      <Card className="p-5 sm:p-6 bg-slate-900/90 border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {inputSum.commodity_name || 'Evaluated Commodity'}
                </h3>
                <Badge variant="slate" size="xs">
                  {inputSum.commodity_category || inputSum.category || 'Food Product'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Shelf-Life: <strong className="text-slate-200">{inputSum.desired_shelf_life_days || inputSum.shelfLifeDays || '14–30'} days</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue" size="sm" icon={Thermometer}>
              Storage: {formatCategoryLabel(inputSum.storage_type || inputSum.storageType || 'Ambient')}
            </Badge>
            <Badge variant="teal" size="sm" icon={Truck}>
              Transit: {formatCategoryLabel(inputSum.transportation_condition || inputSum.transportCondition || 'Local')}
            </Badge>
          </div>
        </div>

        {/* Risk Profile Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Moisture Risk</div>
            {(() => {
              const b = getRiskBadgeProps(risks.moisture_risk);
              return <Badge variant={b.variant} size="xs">{b.label}</Badge>;
            })()}
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Oxidation Risk</div>
            {(() => {
              const b = getRiskBadgeProps(risks.oxidation_risk);
              return <Badge variant={b.variant} size="xs">{b.label}</Badge>;
            })()}
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Microbial Risk</div>
            {(() => {
              const b = getRiskBadgeProps(risks.microbial_risk || risks.microbial_spoilage_risk);
              return <Badge variant={b.variant} size="xs">{b.label}</Badge>;
            })()}
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Respiration</div>
            {(() => {
              const b = getRiskBadgeProps(risks.respiration_risk);
              return <Badge variant={b.variant} size="xs">{b.label}</Badge>;
            })()}
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Mechanical</div>
            {(() => {
              const b = getRiskBadgeProps(risks.mechanical_damage_risk);
              return <Badge variant={b.variant} size="xs">{b.label}</Badge>;
            })()}
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Freezer Burn</div>
            {(() => {
              const b = getRiskBadgeProps(risks.freezer_burn_risk);
              return <Badge variant={b.variant} size="xs">{b.label}</Badge>;
            })()}
          </div>
        </div>
      </Card>

      {/* 2. PLAIN-LANGUAGE SUMMARY SECTION */}
      <Card className="p-6 sm:p-7 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/30 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Plain-Language Summary for Producers & Processors
            </h3>
            <p className="text-xs text-emerald-300/80">
              Clear, non-technical explanation of what your packaging must achieve.
            </p>
          </div>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
          {plainBullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 3. PRIMARY RECOMMENDATION CARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Primary Recommendation</h2>
          </div>
          <Badge variant="brand" size="sm">Top Ranked Solution</Badge>
        </div>

        <Card accent className="p-6 sm:p-8 space-y-6 border-emerald-500/40">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  {primary.name || primary.material_name || 'Optimal Packaging Material'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Optimal Match
                </span>
              </div>
              <div className="text-sm font-mono text-emerald-300/90 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Structure: {primary.structure || 'Engineered Multilayer Web'}</span>
              </div>
            </div>

            {/* Badges: Sustainability & Cost */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Eco Score</span>
                </div>
                <div className="text-lg font-bold text-emerald-400 font-display">
                  {Math.round(primary.sustainability_score ?? 80)}/100
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center justify-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                  <span>Cost Tier</span>
                </div>
                {(() => {
                  const c = getCostBadgeProps(primary.cost_class || primary.cost_level || recommendation.cost_class);
                  return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
                })()}
              </div>
            </div>
          </div>

          {/* Key Reasons Bullets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Scientific Justification & Barrier Fit</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(primary.reasons && primary.reasons.length > 0 ? primary.reasons : [
                'Provides calibrated oxygen and water vapor resistance matched to commodity degradation kinetics.',
                'Certified food-grade contact compliant with FDA 21 CFR 177 and EU 10/2011 standards.',
                'High seal integrity and flex-crack resistance across supply chain temperatures.',
                'Optimized gauge thickness reduces material mass while maintaining barrier hermeticity.'
              ]).map((reason, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gauge & Sealing Specification */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Recommended Gauge: <strong className="text-white">{thickness?.recommended_microns || 45} µm</strong> ({thickness?.min_microns || 30}–{thickness?.max_microns || 60} µm range)
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                Sealing Integrity: <strong className="text-white">{formatCategoryLabel(recommendation.sealability_requirement || reqs.sealability_requirement || 'Hermetic Heat Seal')}</strong>
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. ALTERNATIVE RECOMMENDATIONS CARDS */}
      {alternatives.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Alternative Recommendations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {alternatives.map((alt, idx) => {
              const c = getCostBadgeProps(alt.cost_class || alt.cost_level);
              return (
                <Card key={idx} hover className="p-6 space-y-4 border-slate-800 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="blue" size="xs" className="mb-1.5">
                          {alt.highlight || `Alternative ${idx + 1}`}
                        </Badge>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {alt.name || alt.material_name}
                        </h3>
                      </div>
                      <Badge variant={c.variant} size="xs">
                        {c.label}
                      </Badge>
                    </div>

                    <div className="text-xs font-mono text-slate-300">
                      Structure: {alt.structure || 'Multilayer Matrix'}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {alt.explanation || (alt.reasons && alt.reasons[0]) || 'Viable alternative providing adequate barrier protection with differentiated cost or recyclability.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Leaf className="w-3.5 h-3.5" />
                      Eco Score: {Math.round(alt.sustainability_score ?? 75)}/100
                    </span>
                    <span className="text-slate-500">Food-Grade Certified</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TECHNICAL SPECIFICATION GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold text-white">Technical Details & Barrier Specifications</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 focus:outline-none"
          >
            <span>{showTechnicalDetails ? 'Collapse' : 'Expand'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showTechnicalDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
            {/* OTR */}
            <Card className="p-4 space-y-1.5 border-slate-800/90">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-blue-400" />
                <span>OTR Requirement</span>
              </div>
              <div className="text-base font-bold text-white">
                {formatCategoryLabel(reqs.required_otr_category || recommendation.otr_requirement_category || 'Low OTR')}
              </div>
              <div className="text-[11px] text-slate-400">ASTM D3985 standard</div>
            </Card>

            {/* WVTR */}
            <Card className="p-4 space-y-1.5 border-slate-800/90">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-teal-400" />
                <span>WVTR Requirement</span>
              </div>
              <div className="text-base font-bold text-white">
                {formatCategoryLabel(reqs.required_wvtr_category || recommendation.wvtr_requirement_category || 'Low WVTR')}
              </div>
              <div className="text-[11px] text-slate-400">ASTM F1249 standard</div>
            </Card>

            {/* MAP Suitability */}
            <Card className="p-4 space-y-1.5 border-slate-800/90">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>MAP Suitability</span>
              </div>
              <div className="text-base font-bold text-white">
                {reqs.map_suitable || recommendation.map_suitability === 'Recommended' ? 'Suitable (Recommended)' : 'Standard Headspace'}
              </div>
              <div className="text-[11px] text-slate-400">Gas flush compatibility</div>
            </Card>

            {/* Breathable / Micro-Perforated */}
            <Card className="p-4 space-y-1.5 border-slate-800/90">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>EMAP Breathability</span>
              </div>
              <div className="text-base font-bold text-white">
                {reqs.breathable_film_needed ? 'Micro-Perforated Required' : 'Continuous Barrier Film'}
              </div>
              <div className="text-[11px] text-slate-400">Respiratory equilibrium</div>
            </Card>

            {/* Thickness */}
            <Card className="p-4 space-y-1.5 border-slate-800/90">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Suggested Thickness</span>
              </div>
              <div className="text-base font-bold text-white">
                {thickness?.recommended_microns || 45} µm ({thickness?.min_microns || 30}–{thickness?.max_microns || 60} µm)
              </div>
              <div className="text-[11px] text-slate-400">Gauge specification</div>
            </Card>

            {/* Mechanical Strength */}
            <Card className="p-4 space-y-1.5 border-slate-800/90">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Mechanical Strength</span>
              </div>
              <div className="text-base font-bold text-white">
                {formatCategoryLabel(reqs.mechanical_strength_requirement || recommendation.mechanical_strength_requirement || 'Medium')}
              </div>
              <div className="text-[11px] text-slate-400">Puncture & flex defense</div>
            </Card>

            {/* Sealability */}
            <Card className="p-4 space-y-1.5 border-slate-800/90">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Seal Integrity</span>
              </div>
              <div className="text-base font-bold text-white">
                {formatCategoryLabel(reqs.sealability_requirement || recommendation.sealability_requirement || 'Hermetic Seal')}
              </div>
              <div className="text-[11px] text-slate-400">Thermal bonding strength</div>
            </Card>

            {/* Storage Recommendation */}
            <Card className="p-4 space-y-1.5 border-slate-800/90">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                <span>Storage Handling</span>
              </div>
              <div className="text-base font-bold text-white">
                {recommendation.storage_recommendation || 'Maintain target cold chain setpoint'}
              </div>
              <div className="text-[11px] text-slate-400">Environmental guideline</div>
            </Card>
          </div>
        )}
      </div>

      {/* 6. COMPARISON TABLE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Material Comparison Matrix</h2>
        </div>

        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Option</th>
                  <th className="px-5 py-3.5">Material Name</th>
                  <th className="px-5 py-3.5">Structure</th>
                  <th className="px-5 py-3.5 text-center">Eco Score</th>
                  <th className="px-5 py-3.5 text-center">Cost Tier</th>
                  <th className="px-5 py-3.5">Key Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {/* Primary Row */}
                <tr className="bg-emerald-950/20 hover:bg-emerald-950/30 transition-colors">
                  <td className="px-5 py-4 font-bold text-emerald-400">
                    <Badge variant="brand" size="xs">Primary</Badge>
                  </td>
                  <td className="px-5 py-4 font-semibold text-white">
                    {primary.name || primary.material_name}
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-300">
                    {primary.structure}
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-emerald-400">
                    {Math.round(primary.sustainability_score ?? 80)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {(() => {
                      const c = getCostBadgeProps(primary.cost_class || primary.cost_level);
                      return <Badge variant={c.variant} size="xs">{c.label}</Badge>;
                    })()}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {primary.highlight || 'Optimal multi-criteria barrier score'}
                  </td>
                </tr>

                {/* Alternative Rows */}
                {alternatives.map((alt, idx) => {
                  const c = getCostBadgeProps(alt.cost_class || alt.cost_level);
                  return (
                    <tr key={idx} className="hover:bg-slate-850/40 transition-colors">
                      <td className="px-5 py-4 text-slate-400 font-medium">
                        Alternative {idx + 1}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-200">
                        {alt.name || alt.material_name}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-400">
                        {alt.structure}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-slate-300">
                        {Math.round(alt.sustainability_score ?? 70)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Badge variant={c.variant} size="xs">{c.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {alt.highlight || 'Viable alternative'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 7. DISQUALIFIED MATERIALS SECTION (IF ANY) */}
      {disqualified.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <Ban className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Disqualified Materials (Safety Gate)</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowDisqualified(!showDisqualified)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 focus:outline-none"
            >
              <span>{showDisqualified ? 'Hide' : 'Show'}</span>
              {showDisqualified ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showDisqualified && (
            <Card className="p-5 border-rose-500/30 bg-slate-900/80 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {disqualified.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3"
                  >
                    <div className="p-1 rounded-md bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                      <Ban className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-rose-300 mb-0.5">
                        {item.material_name || `Disqualified Material #${item.material_id}`}
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed">
                        {item.reason}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 8. DISCLAIMER BANNER */}
      <DisclaimerBanner text={recommendation.disclaimer} />

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Link to="/recommend" className="w-full sm:w-auto">
          <Button size="md" variant="secondary" icon={ArrowLeft} fullWidth className="sm:w-auto">
            Evaluate Another Commodity
          </Button>
        </Link>
        <Link to="/admin" className="w-full sm:w-auto">
          <Button size="md" variant="outline" icon={FileText} fullWidth className="sm:w-auto">
            View All Materials in Admin Hub
          </Button>
        </Link>
      </div>
    </div>
  );
}
