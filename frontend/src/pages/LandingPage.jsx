import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Leaf,
  Layers,
  ThermometerSnowflake,
  Wind,
  Droplets,
  AlertTriangle,
  Flame,
  CheckCircle2,
  PackageCheck,
  Scale,
  FileSpreadsheet,
  Package,
  Activity,
  Cpu,
  Clock,
  ExternalLink
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function LandingPage() {
  const problems = [
    {
      icon: Flame,
      title: 'High Food Spoilage & Premature Loss',
      description: 'Up to 30% of perishable and dry food products spoil prematurely due to mismatched oxygen (OTR) and water vapor (WVTR) barrier transmission rates.',
    },
    {
      icon: Layers,
      title: 'Expensive Empirical Trial & Error',
      description: 'Small food processors and packaging engineers waste weeks and substantial capital on physical trial-and-error shelf-life trials without predictive barrier models.',
    },
    {
      icon: Leaf,
      title: 'Recyclability vs Barrier Conflicts',
      description: 'Balancing stringent oxygen barrier performance with circular, mono-material recycling streams is complex and counter-intuitive.',
    },
  ];

  const features = [
    {
      icon: Wind,
      badge: 'Fresh Produce EMAP',
      title: 'Respiration-Aware Gas Exchange',
      description: 'Differentiates climacteric fruits and high-respiration produce to recommend breathable or laser micro-perforated films, preventing anaerobic spoilage.',
    },
    {
      icon: ShieldCheck,
      badge: 'Lipid Protection',
      title: 'Oxidation & Light Barrier Rules',
      description: 'Derives strict maximum OTR (≤ 1.0–5.0 cm³/m²·d) and UV barrier requirements for high-fat snacks, roasted nuts, and dairy powders.',
    },
    {
      icon: Droplets,
      badge: 'Crispness Control',
      title: 'Water Vapor Sorption Defense',
      description: 'Computes critical WVTR thresholds (≤ 1.5 g/m²·d) to safeguard crispy snacks from softening and dry powders from moisture caking.',
    },
    {
      icon: ThermometerSnowflake,
      badge: 'Cold Chain Integrity',
      title: 'Sub-Zero Flex Crack Resistance',
      description: 'Mandates cold-impact sealants and high puncture resistance for frozen foods, eliminating brittle polymers prone to freezer burn.',
    },
    {
      icon: Scale,
      badge: 'MCDA Optimization',
      title: 'Multi-Criteria Decision Analysis',
      description: 'Dynamically balances barrier protection, carbon footprint, recyclability rating, and cost efficiency according to your priorities.',
    },
    {
      icon: PackageCheck,
      badge: 'Safety First',
      title: '100% Food-Grade Regulatory Gate',
      description: 'Zero tolerance for non-certified polymers. Evaluates every candidate against US FDA 21 CFR 177, EU 10/2011, and FSSAI standards.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Enter Food Profile',
      desc: 'Input commodity characteristics (moisture, pH, oil/fat, respiration rate) or pick from preloaded presets.',
    },
    {
      num: '02',
      title: 'Barrier & Risk Physics',
      desc: 'The engine models environmental deltas, microbial moisture limits, oxidation sensitivity, and ASTM barrier thresholds.',
    },
    {
      num: '03',
      title: 'Safety Filtering',
      desc: 'Incompatible materials (e.g. non-perforated barriers on respiring produce) are disqualified with scientific explanations.',
    },
    {
      num: '04',
      title: 'Optimal Recommendations',
      desc: 'Receive primary material structure, gauge thickness, MAP gas composition, eco-alternatives, and technical spec sheets.',
    },
  ];

  const showcaseCommodities = [
    { name: 'Tomato', tag: 'Fresh Produce', best: 'Micro-Perforated Film (EMAP)', preset: 'tomato' },
    { name: 'Banana', tag: 'Climacteric Fruit', best: 'Laser-Perforated EMAP Bag', preset: 'banana' },
    { name: 'Potato Chips', tag: 'Crisp Snack', best: 'Met-PET / BOPP Laminate', preset: 'potato_chips' },
    { name: 'Paneer', tag: 'Perishable Dairy', best: 'PET/EVOH/PE High-Barrier Vacuum', preset: 'paneer' },
    { name: 'Frozen Peas', tag: 'Frozen Food', best: 'Metallocene LDPE Co-ex Pouch', preset: 'frozen_peas' },
    { name: 'Milk Powder', tag: 'Dry Powder', best: 'Aluminum Foil Multilayer Laminate', preset: 'milk_powder' },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>AI & Physics-Based Food Packaging Intelligence</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Intelligent Food Packaging Material Recommendation System
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Get smart packaging suggestions for your food products. Optimize shelf-life, barrier protection (OTR & WVTR), food safety, and sustainability in seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link to="/recommend" className="w-full sm:w-auto">
              <Button size="lg" icon={Sparkles} iconPosition="right" fullWidth className="sm:w-auto shadow-lg shadow-emerald-950/50">
                Get Recommendation
              </Button>
            </Link>
            <Link to="/admin" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" icon={FileSpreadsheet} fullWidth className="sm:w-auto">
                Explore Knowledge Base
              </Button>
            </Link>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto pt-6">
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-white font-display">12+</div>
              <div className="text-xs text-slate-400 mt-1">Food Profiles</div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400 font-display">ASTM D3985 / F1249</div>
              <div className="text-xs text-slate-400 mt-1">OTR & WVTR Standardized</div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-teal-300 font-display">100%</div>
              <div className="text-xs text-slate-400 mt-1">Food-Grade Certified</div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-indigo-300 font-display">Explainable</div>
              <div className="text-xs text-slate-400 mt-1">Rule-Based Reasoning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="The Packaging Challenge"
          badgeVariant="rose"
          title="Why Food Packaging Fails"
          subtitle="Selecting packaging without scientific barrier analysis leads to spoilage, regulatory failure, and unnecessary plastic waste."
          centered
          className="mb-10"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <Card key={idx} hover className="border-slate-800 hover:border-rose-500/40">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{prob.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{prob.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Solution Overview Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="The Solution"
          badgeVariant="brand"
          title="Predictive, Scientific Packaging Intelligence"
          subtitle="PackWise AI matches food degradation vectors with precise polymer barrier properties and environmental sustainability criteria."
          centered
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} hover accent={idx === 0} className="relative group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="slate" size="xs">{feat.badge}</Badge>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="packwise-card p-6 sm:p-10 border-slate-800">
          <SectionHeader
            badge="Workflow"
            badgeVariant="teal"
            title="How PackWise AI Works"
            subtitle="A transparent, deterministic 4-stage decision pipeline rooted in food chemistry and packaging engineering."
            centered
            className="mb-10"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((st, idx) => (
              <div key={idx} className="glass-panel p-5 relative group hover:border-emerald-500/40 transition-colors">
                <div className="text-2xl font-extrabold font-display text-emerald-400/40 group-hover:text-emerald-400 transition-colors mb-2">
                  {st.num}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">{st.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/recommend">
              <Button size="md" icon={ArrowRight} iconPosition="right">
                Start Recommendation Wizard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Target Food Sectors & Ready Presets */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Preconfigured Presets"
          badgeVariant="amber"
          title="Supported Food Commodities"
          subtitle="Instant packaging barrier calculations available for common high-risk and high-volume food sectors."
          action={
            <Link to="/recommend" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1">
              <span>Test in wizard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
          className="mb-8"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {showcaseCommodities.map((comm, idx) => (
            <Card key={idx} hover className="p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="slate" size="xs">{comm.tag}</Badge>
                  <span className="text-[10px] text-emerald-400 font-medium">Ready Preset</span>
                </div>
                <h4 className="text-base font-bold text-white">{comm.name}</h4>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold block text-[11px] mb-0.5">Recommended Structure:</span>
                <span>{comm.best}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <DisclaimerBanner />
      </section>
    </div>
  );
}
