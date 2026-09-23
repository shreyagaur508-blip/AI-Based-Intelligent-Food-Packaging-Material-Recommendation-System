import React, { useState } from 'react';
import {
  Database,
  Layers,
  Sparkles,
  Sliders,
  ShieldCheck,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  BookOpen,
  Filter
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import {
  PRESET_COMMODITIES,
  INITIAL_MATERIALS_CATALOG,
  ADMIN_STATS_MOCK
} from '../data/mockData';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('commodities');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommodities = PRESET_COMMODITIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMaterials = INITIAL_MATERIALS_CATALOG.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.polymerFamily.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">Knowledge Base Administration</Badge>
          <span className="text-xs text-slate-400">Database & Rule Engine Management</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Packaging Domain Admin Hub
        </h1>
        <p className="text-slate-300 text-sm max-w-3xl">
          Inspect food commodity degradation parameters, ASTM barrier polymer datasheets, and active expert rules.
        </p>
      </div>

      {/* Prominent Phase Notice */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Backend Connection Notice
            </h3>
            <Badge variant="purple" size="sm">Phase 2 / Phase 4 Target</Badge>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Backend connection will be added in a later phase. Currently viewing the Phase 1 local schema and standardized ASTM baseline catalog. Live SQLite/PostgreSQL CRUD endpoints will activate in subsequent phases.
          </p>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Commodities */}
        <Card
          hover
          onClick={() => setActiveTab('commodities')}
          className={`p-5 transition-all ${
            activeTab === 'commodities' ? 'border-brand-500/60 ring-1 ring-brand-500/40 bg-slate-900/90' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Commodities</span>
            <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-white font-display">12</div>
          <div className="text-xs text-slate-400 mt-1">Supported Food Profiles</div>
        </Card>

        {/* Card 2: Packaging Materials */}
        <Card
          hover
          onClick={() => setActiveTab('materials')}
          className={`p-5 transition-all ${
            activeTab === 'materials' ? 'border-teal-500/60 ring-1 ring-teal-500/40 bg-slate-900/90' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Materials</span>
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-white font-display">11</div>
          <div className="text-xs text-slate-400 mt-1">Polymers & Laminates</div>
        </Card>

        {/* Card 3: Decision Rules */}
        <Card
          hover
          onClick={() => setActiveTab('rules')}
          className={`p-5 transition-all ${
            activeTab === 'rules' ? 'border-amber-500/60 ring-1 ring-amber-500/40 bg-slate-900/90' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Decision Rules</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sliders className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-white font-display">18</div>
          <div className="text-xs text-slate-400 mt-1">Active Heuristic Gates</div>
        </Card>

        {/* Card 4: Evaluation Logs */}
        <Card
          hover
          onClick={() => setActiveTab('logs')}
          className={`p-5 transition-all ${
            activeTab === 'logs' ? 'border-purple-500/60 ring-1 ring-purple-500/40 bg-slate-900/90' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Recommendations</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-white font-display">0</div>
          <div className="text-xs text-slate-400 mt-1">Logs (Awaiting Phase 4)</div>
        </Card>
      </div>

      {/* Main Tab View Content */}
      <Card className="p-6 sm:p-8 space-y-6">
        {/* Tab Controls & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('commodities')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'commodities'
                  ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Commodities Catalog
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'materials'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Packaging Materials
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'rules'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Expert Decision Rules
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Evaluation Logs
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Tab 1: Commodities Table */}
        {activeTab === 'commodities' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Commodity</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Moisture</th>
                    <th className="py-3 px-3">Respiration</th>
                    <th className="py-3 px-3">Storage Temp</th>
                    <th className="py-3 px-3">Shelf Life</th>
                    <th className="py-3 px-3">Target Packaging</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCommodities.map((comm) => (
                    <tr key={comm.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">{comm.name}</td>
                      <td className="py-3 px-3">
                        <Badge variant="slate" size="sm">{comm.category}</Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{comm.moisture}%</td>
                      <td className="py-3 px-3 capitalize text-slate-300">{comm.respirationRate}</td>
                      <td className="py-3 px-3 text-slate-300">{comm.storageTemp}°C ({comm.relativeHumidity}% RH)</td>
                      <td className="py-3 px-3 text-brand-300 font-medium">{comm.shelfLifeDays} Days</td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{comm.packagingFormat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Materials Table */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Code / Name</th>
                    <th className="py-3 px-3">Polymer Family</th>
                    <th className="py-3 px-3">OTR (ASTM D3985)</th>
                    <th className="py-3 px-3">WVTR (ASTM F1249)</th>
                    <th className="py-3 px-3">Cost Tier</th>
                    <th className="py-3 px-3">Eco Score</th>
                    <th className="py-3 px-3">Food Safety</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMaterials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{mat.code}</div>
                        <div className="text-[10px] text-slate-400">{mat.name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="slate" size="sm">{mat.polymerFamily}</Badge>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-300">{mat.otr}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-300">{mat.wvtr}</td>
                      <td className="py-3 px-3 text-slate-300">{mat.costTier}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{mat.sustainabilityScore}/100</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30">
                          FDA / EU Compliant
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Decision Rules Overview */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-4 space-y-2 border-l-4 border-l-brand-500">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">RULE_FRESH_EMAP_01</span>
                  <Badge variant="emerald" size="sm">Active Gate</Badge>
                </div>
                <p className="text-xs text-slate-300">
                  <strong>Trigger:</strong> If commodity is fresh produce (respiration &ge; moderate) and candidate material is impermeable non-perforated barrier &rarr; <strong>Disqualify</strong> to avoid anaerobic fermentation.
                </p>
              </div>

              <div className="glass-panel p-4 space-y-2 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">RULE_LIPID_OXIDATION_02</span>
                  <Badge variant="amber" size="sm">Active Gate</Badge>
                </div>
                <p className="text-xs text-slate-300">
                  <strong>Trigger:</strong> If lipid level is High and shelf-life target &ge; 90 days &rarr; Require strict OTR &le; 2.0 cm&sup3;/m&sup2;&middot;d&middot;atm and high light barrier.
                </p>
              </div>

              <div className="glass-panel p-4 space-y-2 border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">RULE_SUBZERO_CRACK_03</span>
                  <Badge variant="blue" size="sm">Active Gate</Badge>
                </div>
                <p className="text-xs text-slate-300">
                  <strong>Trigger:</strong> If storage temperature &lt; 0&deg;C &rarr; Reject brittle polymers lacking low-temperature impact flex crack resistance.
                </p>
              </div>

              <div className="glass-panel p-4 space-y-2 border-l-4 border-l-rose-500">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">RULE_FOOD_SAFETY_00</span>
                  <Badge variant="rose" size="sm">Non-Negotiable</Badge>
                </div>
                <p className="text-xs text-slate-300">
                  <strong>Trigger:</strong> If material lacks verified food-contact certification (FDA 21 CFR 177 / EU 10/2011) &rarr; Unconditionally eliminate.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Evaluation Logs */}
        {activeTab === 'logs' && (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
              <Database className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">No Server Logs Recorded Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              FastAPI persistence and session logging will record real-time recommendation inputs and ranked outputs during Phase 4 integration.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
