import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  Sparkles,
  Sliders,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import SectionHeader from '../components/common/SectionHeader';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import {
  PRESET_COMMODITIES,
  INITIAL_MATERIALS_CATALOG,
  ADMIN_STATS_MOCK
} from '../data/mockData';
import { fetchCommodities, fetchMaterials, fetchAdminSummary, checkBackendHealth } from '../api/recommendationApi';

const HEURISTIC_RULES = [
  { id: 1, name: 'Climacteric EMAP Rule', trigger: 'Respiration Rate = High/Very High', action: 'Mandate laser micro-perforated or breathable film (OTR > 1000)', standard: 'Produce Physiology' },
  { id: 2, name: 'Lipid Oxidation Defense', trigger: 'Oil/Fat Level = High (>20%)', action: 'Require high gas barrier (OTR ≤ 2.0) and light barrier (Met-PET/Alu)', standard: 'ASTM D3985' },
  { id: 3, name: 'Hygroscopic Sogginess Barrier', trigger: 'Moisture ≤ 10% (Crisp Snacks)', action: 'Enforce strict water vapor barrier (WVTR ≤ 1.5 g/m²·d)', standard: 'ASTM F1249' },
  { id: 4, name: 'Sub-Zero Flex Crack Gate', trigger: 'Storage Type = Frozen (-18°C)', action: 'Disqualify brittle polymers; require metallocene LDPE/impact copolymers', standard: 'ASTM D1709' },
  { id: 5, name: '100% Food-Grade Safety Gate', trigger: 'All food evaluations', action: 'Hard eliminate non-certified industrial polymers (US FDA 21 CFR / EU 10/2011)', standard: 'FDA 21 CFR 177' },
  { id: 6, name: 'Anaerobic Spoilage Interlock', trigger: 'Fresh Produce (Respiration > 0)', action: 'Disqualify non-perforated absolute barriers (e.g. Alu-foil / EVOH)', standard: 'Post-Harvest Safety' },
  { id: 7, name: 'Perishable Dairy Vacuum Gate', trigger: 'Moisture > 50% & Chilled', action: 'Require hermetic vacuum seal with OTR ≤ 5.0 to suppress aerobic bacteria', standard: 'Dairy Microbiology' },
  { id: 8, name: 'Recyclability MCDA Weighting', trigger: 'Sustainability = High / Recyclable', action: 'Boost mono-material PE/PP score +25% in MCDA ranking matrix', standard: 'Circular Economy' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('commodities');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [commodities, setCommodities] = useState(PRESET_COMMODITIES);
  const [materials, setMaterials] = useState(INITIAL_MATERIALS_CATALOG);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Check backend health & fetch live data on mount
  useEffect(() => {
    async function loadData() {
      const isOnline = await checkBackendHealth();
      setIsBackendConnected(isOnline);

      if (isOnline) {
        const liveComms = await fetchCommodities();
        if (liveComms && liveComms.length > 0) setCommodities(liveComms);

        const liveMats = await fetchMaterials();
        if (liveMats && liveMats.length > 0) setMaterials(liveMats);
      }
    }
    loadData();
  }, []);

  // Filter commodities
  const filteredCommodities = commodities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter materials
  const filteredMaterials = materials.filter((m) => {
    return (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.polymerFamily && m.polymerFamily.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.bestFor && m.bestFor.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Filter rules
  const filteredRules = HEURISTIC_RULES.filter((r) => {
    return (
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.action.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Reset pagination on search / filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, activeTab]);

  // Pagination calculation
  const currentList =
    activeTab === 'commodities'
      ? filteredCommodities
      : activeTab === 'materials'
      ? filteredMaterials
      : filteredRules;

  const totalPages = Math.ceil(currentList.length / itemsPerPage) || 1;
  const paginatedList = currentList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple" size="sm">Admin Knowledge Hub</Badge>
            <span className="text-xs text-slate-400">Database & Heuristic Rules Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Packaging Knowledge Hub
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Explore commodity degradation parameters, ASTM barrier polymer specifications, and active expert rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            isBackendConnected
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-900 text-slate-300 border-slate-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span>{isBackendConnected ? 'FastAPI Backend Online' : 'Local Seed Catalog'}</span>
          </div>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Commodities */}
        <Card
          hover
          onClick={() => setActiveTab('commodities')}
          className={`p-5 transition-all ${
            activeTab === 'commodities' ? 'border-emerald-500/60 ring-1 ring-emerald-500/40 bg-slate-900/95' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Commodities</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-display">{commodities.length}</div>
          <div className="text-xs text-slate-400 mt-1">Food Profiles</div>
        </Card>

        {/* Materials */}
        <Card
          hover
          onClick={() => setActiveTab('materials')}
          className={`p-5 transition-all ${
            activeTab === 'materials' ? 'border-teal-500/60 ring-1 ring-teal-500/40 bg-slate-900/95' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Materials</span>
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-display">{materials.length}</div>
          <div className="text-xs text-slate-400 mt-1">ASTM Polymers & Laminates</div>
        </Card>

        {/* Decision Rules */}
        <Card
          hover
          onClick={() => setActiveTab('rules')}
          className={`p-5 transition-all ${
            activeTab === 'rules' ? 'border-amber-500/60 ring-1 ring-amber-500/40 bg-slate-900/95' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Heuristic Rules</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sliders className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-display">{HEURISTIC_RULES.length}</div>
          <div className="text-xs text-slate-400 mt-1">Active Safety Gates</div>
        </Card>

        {/* Food-Grade Compliance */}
        <Card className="p-5 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Compliance</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-display">100%</div>
          <div className="text-xs text-slate-400 mt-1">FDA & EU Food-Contact</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('commodities')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'commodities'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Commodities ({commodities.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('materials')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'materials'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Packaging Materials ({materials.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'rules'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Decision Rules ({HEURISTIC_RULES.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-72">
            <Input
              name="search"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
        </div>
      </Card>

      {/* Tab 1: Commodities Table */}
      {activeTab === 'commodities' && (
        <Card className="p-0 overflow-hidden border-slate-800 space-y-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Commodity Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5 text-center">Moisture %</th>
                  <th className="px-5 py-3.5 text-center">pH</th>
                  <th className="px-5 py-3.5">Respiration</th>
                  <th className="px-5 py-3.5">Storage</th>
                  <th className="px-5 py-3.5 text-center">Shelf Life</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                      No commodities match your search query.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((c, idx) => (
                    <tr key={c.id || idx} className="hover:bg-slate-850/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-white">
                        <div>{c.name}</div>
                        {c.badge && (
                          <span className="text-[10px] text-emerald-400 font-normal block mt-0.5">
                            {c.badge}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="slate" size="xs">{c.category || 'Standard'}</Badge>
                      </td>
                      <td className="px-5 py-4 text-center font-mono">
                        {c.default_moisture_percent ?? c.moisture ?? '—'}%
                      </td>
                      <td className="px-5 py-4 text-center font-mono">
                        {c.default_ph ?? c.pH ?? '—'}
                      </td>
                      <td className="px-5 py-4 capitalize">
                        {c.respiration_class || c.respirationRate || 'very_low'}
                      </td>
                      <td className="px-5 py-4 capitalize">
                        {c.recommended_storage_type || c.storageType || 'ambient'} ({c.storageTemp ?? 20}°C)
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-emerald-400">
                        {c.base_shelf_life_days ?? c.shelfLifeDays ?? '30'} d
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Materials Catalog */}
      {activeTab === 'materials' && (
        <Card className="p-0 overflow-hidden border-slate-800 space-y-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Material Name</th>
                  <th className="px-5 py-3.5">Polymer Family</th>
                  <th className="px-5 py-3.5">ASTM D3985 OTR</th>
                  <th className="px-5 py-3.5">ASTM F1249 WVTR</th>
                  <th className="px-5 py-3.5 text-center">Cost</th>
                  <th className="px-5 py-3.5 text-center">Eco Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                      No packaging materials match your search query.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((m, idx) => (
                    <tr key={m.id || idx} className="hover:bg-slate-850/40 transition-colors">
                      <td className="px-5 py-4 font-bold font-mono text-emerald-400">
                        {m.code || m.material_code || `MAT-${m.id}`}
                      </td>
                      <td className="px-5 py-4 font-semibold text-white">
                        <div>{m.name || m.material_name}</div>
                        {m.bestFor && (
                          <div className="text-[10px] text-slate-400 mt-0.5 max-w-xs truncate">
                            {m.bestFor}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="teal" size="xs">{m.polymerFamily || m.material_type || 'Polyolefin'}</Badge>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-300">
                        {m.otr || (m.oxygen_transmission_rate !== undefined ? `${m.oxygen_transmission_rate} cm³` : 'Standard')}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-300">
                        {m.wvtr || (m.water_vapor_transmission_rate !== undefined ? `${m.water_vapor_transmission_rate} g` : 'Standard')}
                      </td>
                      <td className="px-5 py-4 text-center capitalize">
                        <Badge variant="blue" size="xs">{m.costTier || m.cost_level || 'Moderate'}</Badge>
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-emerald-400">
                        {Math.round(m.sustainabilityScore ?? m.sustainability_score ?? 80)}/100
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Decision Rules */}
      {activeTab === 'rules' && (
        <Card className="p-0 overflow-hidden border-slate-800 space-y-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Rule Identifier</th>
                  <th className="px-5 py-3.5">Activation Trigger</th>
                  <th className="px-5 py-3.5">Engine Action & Filtering</th>
                  <th className="px-5 py-3.5">Scientific Domain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-emerald-400 font-mono">
                      0{r.id}
                    </td>
                    <td className="px-5 py-4 font-bold text-white">
                      {r.name}
                    </td>
                    <td className="px-5 py-4 font-mono text-amber-300">
                      {r.trigger}
                    </td>
                    <td className="px-5 py-4 text-slate-300 max-w-sm leading-relaxed">
                      {r.action}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="slate" size="xs">{r.standard}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, currentList.length)} of {currentList.length} items
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="xs"
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-white font-medium">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="xs"
              variant="secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              icon={ChevronRight}
              iconPosition="right"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Admin Decision Notice */}
      <DisclaimerBanner compact />
    </div>
  );
}
