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
  FileSpreadsheet
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function LandingPage() {
  const problems = [
    {
      icon: Flame,
      title: 'High Food Spoilage & Waste',
      description: 'Up to 30% of perishable and shelf-stable foods spoil prematurely due to mismatched moisture and oxygen transmission rates.',
    },
    {
      icon: Layers,
      title: 'Costly Trial & Error Selection',
      description: 'Packaging engineers spend weeks in physical barrier lab trials without deterministic predictive modeling.',
    },
    {
      icon: Leaf,
      title: 'Recyclability vs Barrier Trade-offs',
      description: 'Balancing ultra-high oxygen barriers with circular single-material recycling streams is complex and non-intuitive.',
    },
  ];

  const features = [
    {
      icon: Wind,
      badge: 'Produce Physiology',
      title: 'Respiration-Aware EMAP Logic',
      description: 'Distinguishes climacteric fruits and high-respiration produce to recommend breathable or micro-perforated films, preventing anaerobic fermentation.',
    },
    {
      icon: ShieldCheck,
      badge: 'Lipid Protection',
      title: 'Oxidation & Light Barrier Rules',
      description: 'Calculates strict maximum OTR (≤ 1.0 - 5.0 cm³/m²·d) and UV-blocking requirements for high-fat snacks, roasted nuts, and dairy powders.',
    },
    {
      icon: Droplets,
      badge: 'Crispness & Moisture',
      title: 'Water Vapor Sorption Control',
      description: 'Derives WVTR thresholds (≤ 1.5 g/m²·d) to safeguard crispy snacks from softening and dry powders from moisture caking.',
    },
    {
      icon: ThermometerSnowflake,
      badge: 'Cold-Chain Integrity',
      title: 'Sub-Zero Flex Crack Defense',
      description: 'Mandates cold-impact sealants and puncture resistance for frozen foods, eliminating brittle polymers prone to freezer burn.',
    },
    {
      icon: Scale,
      badge: 'MCDA Optimization',
      title: 'Multi-Criteria Decision Analysis',
      description: 'Dynamically balances barrier protection, carbon footprint, recyclability code, and cost efficiency based on user priorities.',
    },
    {
      icon: PackageCheck,
      badge: 'Compliance First',
      title: '100% Food-Grade Safety Gate',
      description: 'Zero tolerance for non-certified polymers. Evaluates against FDA 21 CFR 177, EU 10/2011, and FSSAI standards.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Enter Food Profile',
      desc: 'Input commodity characteristics (moisture %, fat level, pH, respiration rate, and shelf-life target).',
    },
    {
      num: '02',
      title: 'Analyze Degradation Risks',
      desc: 'Engine calculates environmental deltas, microbial vectors, oxidation risks, and barrier thresholds.',
    },
    {
      num: '03',
      title: 'Constraint Elimination',
      desc: 'Incompatible materials (e.g. non-perforated barriers on fresh produce) are hard-filtered with scientific reasoning.',
    },
    {
      num: '04',
      title: 'Receive Ranked Recommendations',
      desc: 'Get primary material recommendation, suggested gauge thickness, MAP gas mixture, eco-alternatives, and spec sheet.',
    },
  ];

  const showcaseCommodities = [
    { name: 'Banana', tag: 'Fresh Produce', best: 'Micro-Perforated Film (EMAP)', color: 'emerald' },
    { name: 'Potato Chips', tag: 'Dry Crisp Snack', best: 'Metallized PET / BOPP Laminate', color: 'amber' },
    { name: 'Paneer', tag: 'Perishable Dairy', best: 'PET/EVOH/PE High-Barrier Vacuum', color: 'blue' },
    { name: 'Frozen Peas', tag: 'Frozen Foods', best: 'Metallocene LDPE Co-ex Pouch', color: 'purple' },
    { name: 'Milk Powder', tag: 'Hygroscopic Powder', best: 'Aluminum Foil Multilayer Laminate', color: 'rose' },
  ];

  return (
    <div className="space-y-24 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs sm:text-sm font-medium animate-pulse">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>AI-Powered Food Packaging Material Recommendation System</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Intelligent Packaging Design for <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-teal-300 bg-clip-text text-transparent">Zero Food Waste</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Match food commodity degradation kinetics with precise barrier physics (OTR & WVTR), environmental sustainability, and MAP specifications in seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/recommend" className="w-full sm:w-auto">
              <Button size="lg" icon={Sparkles} iconPosition="right" className="w-full sm:w-auto shadow-xl shadow-brand-500/25">
                Get Recommendation
              </Button>
            </Link>
            <Link to="/admin" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" icon={FileSpreadsheet} className="w-full sm:w-auto">
                Explore Knowledge Hub
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-white font-display">12+</div>
              <div className="text-xs text-slate-400 mt-0.5">Commodity Profiles</div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-brand-400 font-display">11+</div>
              <div className="text-xs text-slate-400 mt-0.5">Food-Grade Polymers</div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-white font-display">ASTM D3985 / F1249</div>
              <div className="text-xs text-slate-400 mt-0.5">Standardized OTR/WVTR</div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-teal-300 font-display">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Explainable AI Logic</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <Badge variant="rose" size="md">The Industry Challenge</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Why Traditional Packaging Selection Fails
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Selecting packaging through trial and error leads to severe product spoilage, customer dissatisfaction, and massive plastic waste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <Card key={idx} hover className="border-slate-800/80 hover:border-rose-500/30">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{prob.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{prob.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* The Solution / Core Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="brand" size="md">The Solution</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Scientific, Rule-Based Packaging Intelligence
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            PackWise AI computes optimal packaging barriers tailored to respiration rates, lipid oxidation dynamics, and water vapor permeability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} hover glow={idx === 0} className="relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="slate" size="sm">{feat.badge}</Badge>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-300 transition-colors">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-12 border-slate-800">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge variant="emerald" size="md">Decision Workflow</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              How PackWise AI Formulates Recommendations
            </h2>
            <p className="text-slate-400 text-sm">
              Deterministic, transparent, 4-step decision hierarchy rooted in food chemistry and packaging engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((st, idx) => (
              <div key={idx} className="glass-panel p-6 relative group hover:border-brand-500/40 transition-colors">
                <div className="text-3xl font-extrabold font-display text-brand-400/30 group-hover:text-brand-400 transition-colors mb-3">
                  {st.num}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{st.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/recommend">
              <Button size="md" icon={ArrowRight} iconPosition="right">
                Launch Recommendation Wizard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Supported Commodities Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <Badge variant="amber" size="md">Target Food Sectors</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Ready-to-Evaluate Commodities
            </h2>
          </div>
          <Link to="/recommend" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1">
            <span>Test a preset</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {showcaseCommodities.map((comm, idx) => (
            <Card key={idx} hover className="p-4 flex flex-col justify-between space-y-3">
              <div>
                <Badge variant="slate" size="sm" className="mb-2">{comm.tag}</Badge>
                <h4 className="text-base font-bold text-white">{comm.name}</h4>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="text-brand-400 block font-medium">Optimal Match:</span>
                {comm.best}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Disclaimer Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DisclaimerBanner />
      </section>
    </div>
  );
}
