import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Leaf,
  Layers,
  ThermometerSnowflake,
  Wind,
  Droplets,
  Flame,
  PackageCheck,
  Scale,
  FileSpreadsheet
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import { useTranslation } from '../i18n';

export default function LandingPage() {
  const { t, getCommodityName, getCategoryName } = useTranslation();

  const problems = [
    {
      icon: Flame,
      title: t('landing.prob_1_title'),
      description: t('landing.prob_1_desc'),
    },
    {
      icon: Layers,
      title: t('landing.prob_2_title'),
      description: t('landing.prob_2_desc'),
    },
    {
      icon: Leaf,
      title: t('landing.prob_3_title'),
      description: t('landing.prob_3_desc'),
    },
  ];

  const features = [
    {
      icon: Wind,
      badge: t('landing.feat_1_badge'),
      title: t('landing.feat_1_title'),
      description: t('landing.feat_1_desc'),
    },
    {
      icon: ShieldCheck,
      badge: t('landing.feat_2_badge'),
      title: t('landing.feat_2_title'),
      description: t('landing.feat_2_desc'),
    },
    {
      icon: Droplets,
      badge: t('landing.feat_3_badge'),
      title: t('landing.feat_3_title'),
      description: t('landing.feat_3_desc'),
    },
    {
      icon: ThermometerSnowflake,
      badge: t('landing.feat_4_badge'),
      title: t('landing.feat_4_title'),
      description: t('landing.feat_4_desc'),
    },
    {
      icon: Scale,
      badge: t('landing.feat_5_badge'),
      title: t('landing.feat_5_title'),
      description: t('landing.feat_5_desc'),
    },
    {
      icon: PackageCheck,
      badge: t('landing.feat_6_badge'),
      title: t('landing.feat_6_title'),
      description: t('landing.feat_6_desc'),
    },
  ];

  const steps = [
    {
      num: '01',
      title: t('landing.step_1_title'),
      desc: t('landing.step_1_desc'),
    },
    {
      num: '02',
      title: t('landing.step_2_title'),
      desc: t('landing.step_2_desc'),
    },
    {
      num: '03',
      title: t('landing.step_3_title'),
      desc: t('landing.step_3_desc'),
    },
    {
      num: '04',
      title: t('landing.step_4_title'),
      desc: t('landing.step_4_desc'),
    },
  ];

  const showcaseCommodities = [
    { name: 'Tomato', tag: 'Fresh Produce', best: 'Micro-Perforated Film (EMAP)', preset: 'tomato' },
    { name: 'Banana', tag: 'Fresh Produce', best: 'Laser-Perforated EMAP Bag', preset: 'banana' },
    { name: 'Potato Chips', tag: 'Dry Crisp Foods', best: 'Met-PET / BOPP Laminate', preset: 'potato_chips' },
    { name: 'Paneer', tag: 'Perishable Dairy', best: 'PET/EVOH/PE High-Barrier Vacuum', preset: 'paneer' },
    { name: 'Frozen Peas', tag: 'Frozen Foods', best: 'Metallocene LDPE Co-ex Pouch', preset: 'frozen_peas' },
    { name: 'Milk Powder', tag: 'Powders & Grains', best: 'Aluminum Foil Multilayer Laminate', preset: 'milk_powder' },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t('landing.badge')}</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              {t('landing.hero_title')}
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero_subtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link to="/recommend" className="w-full sm:w-auto">
              <Button size="lg" icon={Sparkles} iconPosition="right" fullWidth className="sm:w-auto shadow-lg shadow-emerald-950/50">
                {t('landing.cta_recommend')}
              </Button>
            </Link>
            <Link to="/admin" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" icon={FileSpreadsheet} fullWidth className="sm:w-auto">
                {t('landing.cta_admin')}
              </Button>
            </Link>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto pt-6">
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-white font-display">12+</div>
              <div className="text-xs text-slate-400 mt-1">{t('landing.metric_profiles')}</div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400 font-display">ASTM D3985 / F1249</div>
              <div className="text-xs text-slate-400 mt-1">{t('landing.metric_astm')}</div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-teal-300 font-display">100%</div>
              <div className="text-xs text-slate-400 mt-1">{t('landing.metric_compliance')}</div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-2xl font-bold text-indigo-300 font-display">{t('landing.metric_explainable')}</div>
              <div className="text-xs text-slate-400 mt-1">{t('landing.metric_mcda_sub')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('landing.challenge_badge')}
          badgeVariant="rose"
          title={t('landing.challenge_title')}
          subtitle={t('landing.challenge_subtitle')}
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
          badge={t('landing.sol_badge')}
          badgeVariant="brand"
          title={t('landing.sol_title')}
          subtitle={t('landing.sol_subtitle')}
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
            badge={t('landing.workflow_badge')}
            badgeVariant="teal"
            title={t('landing.workflow_title')}
            subtitle={t('landing.workflow_subtitle')}
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
                {t('landing.start_wizard')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Target Food Sectors & Ready Presets */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('landing.presets_badge')}
          badgeVariant="amber"
          title={t('landing.presets_title')}
          subtitle={t('landing.presets_subtitle')}
          action={
            <Link to="/recommend" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1">
              <span>{t('landing.test_in_wizard')}</span>
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
                  <Badge variant="slate" size="xs">{getCategoryName(comm.tag)}</Badge>
                  <span className="text-[10px] text-emerald-400 font-medium">{t('landing.ready_preset')}</span>
                </div>
                <h4 className="text-base font-bold text-white">{getCommodityName(comm.name)}</h4>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold block text-[11px] mb-0.5">{t('landing.recommended_structure')}</span>
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
