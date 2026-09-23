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
  Info
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function ResultsPage() {
  const location = useLocation();
  const [inputData, setInputData] = useState(null);

  useEffect(() => {
    // 1. Try React Router location state
    if (location.state && location.state.formData) {
      setInputData(location.state.formData);
      return;
    }

    // 2. Fallback to sessionStorage
    try {
      const stored = sessionStorage.getItem('packwise_recommendation_input');
      if (stored) {
        setInputData(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Unable to retrieve cached input data', e);
    }
  }, [location.state]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="md">Phase 1 Output Layout</Badge>
            <span className="text-xs text-slate-400">Recommendation Summary</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Packaging Decision Evaluation
          </h1>
        </div>

        <Link to="/recommend">
          <Button variant="secondary" size="sm" icon={ArrowLeft}>
            Edit Input Parameters
          </Button>
        </Link>
      </div>

      {/* Prominent Phase 4 Engine Connection Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-950/70 via-slate-900 to-teal-950/60 border border-brand-500/40 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Recommendation engine will be connected in Phase 4.
              </h2>
              <Badge variant="brand" size="sm">Phase 1 UI Ready</Badge>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              The user interface, input validation pipeline, and session state are active. In <strong>Phase 4</strong>, this dashboard will seamlessly connect with the Python FastAPI expert system to perform live degradation profiling, constraint elimination, ASTM barrier matching, and multi-criteria scoring.
            </p>
          </div>
        </div>
      </div>

      {/* Input Summary Section */}
      {inputData ? (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Submitted Commodity Input Summary</h3>
                <p className="text-xs text-slate-400">Captured parameters ready for algorithmic evaluation</p>
              </div>
            </div>
            <Badge variant="emerald" size="md">
              Commodity: {inputData.commodityName || 'Custom Food'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            <div className="glass-panel p-3.5 space-y-1">
              <span className="text-slate-400 block font-medium">Food Category</span>
              <span className="font-semibold text-white text-sm">{inputData.category}</span>
            </div>
            <div className="glass-panel p-3.5 space-y-1">
              <span className="text-slate-400 block font-medium">Moisture Content</span>
              <span className="font-semibold text-white text-sm">{inputData.moisture}%</span>
            </div>
            <div className="glass-panel p-3.5 space-y-1">
              <span className="text-slate-400 block font-medium">Lipid / Oil Level</span>
              <span className="font-semibold text-white text-sm capitalize">{inputData.oilFatLevel}</span>
            </div>
            <div className="glass-panel p-3.5 space-y-1">
              <span className="text-slate-400 block font-medium">pH Value</span>
              <span className="font-semibold text-white text-sm">{inputData.pH}</span>
            </div>
            <div className="glass-panel p-3.5 space-y-1">
              <span className="text-slate-400 block font-medium">Respiration Rate</span>
              <span className="font-semibold text-white text-sm capitalize">{inputData.respirationRate}</span>
            </div>
            <div className="glass-panel p-3.5 space-y-1">
              <span className="text-slate-400 block font-medium">Target Shelf Life</span>
              <span className="font-semibold text-white text-sm">{inputData.shelfLifeDays} Days</span>
            </div>
            <div className="glass-panel p-3.5 space-y-1">
              <span className="text-slate-400 block font-medium">Storage Regime</span>
              <span className="font-semibold text-white text-sm capitalize">
                {inputData.storageType} ({inputData.storageTemp}°C, {inputData.relativeHumidity}% RH)
              </span>
            </div>
            <div className="glass-panel p-3.5 space-y-1">
              <span className="text-slate-400 block font-medium">Logistics & Transit</span>
              <span className="font-semibold text-white text-sm">
                {inputData.transportDays}d ({inputData.transportCondition})
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center space-y-4 border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Active Input Submission Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please use the Packaging Recommendation Wizard to enter food properties and storage conditions.
            </p>
          </div>
          <Link to="/recommend">
            <Button size="md" icon={Sparkles}>
              Open Recommendation Form
            </Button>
          </Link>
        </Card>
      )}

      {/* Structural Placeholders for Phase 4 Results Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white font-display">
          Upcoming Decision Modules (Scaffold Preview)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Primary Recommendation Placeholder */}
          <Card className="p-6 border-slate-800 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Primary Match</span>
              <Badge variant="slate" size="sm">Phase 4</Badge>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Optimal Material & Structure</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Calculates recommended polymer (e.g. Micro-perforated LDPE or High-Barrier EVOH), suggested gauge thickness (µm / microns), and recommended MAP gas mixture.
            </p>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-brand-500/40 animate-pulse"></div>
            </div>
          </Card>

          {/* Card 2: Multi-Criteria Radar Comparison Placeholder */}
          <Card className="p-6 border-slate-800 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">MCDA Benchmark</span>
              <Badge variant="slate" size="sm">Phase 4</Badge>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Barrier & Sustainability Radar</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Recharts radar graphic comparing Oxygen Barrier, Moisture Barrier, Recyclability Score, Tensile Strength, and Cost Index against target constraints.
            </p>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-teal-500/40 animate-pulse"></div>
            </div>
          </Card>

          {/* Card 3: Disqualified Materials & Explainability Placeholder */}
          <Card className="p-6 border-slate-800 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Explainable AI</span>
              <Badge variant="slate" size="sm">Phase 4</Badge>
            </div>
            <h4 className="text-base font-bold text-white mb-2">Constraint Failure Analysis</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Explicit scientific reasoning for eliminated materials (e.g. why Aluminum foil is prohibited on fresh bananas due to anaerobic fermentation risk).
            </p>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-amber-500/40 animate-pulse"></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Decision Support Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
}
