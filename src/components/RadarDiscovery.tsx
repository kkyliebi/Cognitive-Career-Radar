import React, { useState } from 'react';
import { StudioCandidate, HiringStatus, ApplicationRecord, EditorialTheme } from '../types';
import { EDITORIAL_PALETTES } from '../utils/theme';
import { StudioCard } from './StudioCard';
import { Compass, Search, Loader2, MapPin, Globe, Sparkles, CheckCircle2 } from 'lucide-react';

interface RadarDiscoveryProps {
  studios: StudioCandidate[];
  records: ApplicationRecord[];
  onAddStudios: (newStudios: StudioCandidate[]) => void;
  onOpenDossier: (studio: StudioCandidate) => void;
  onDraftOutreach: (studio: StudioCandidate) => void;
  onUpdateStatus: (id: string, status: StudioCandidate['pipelineStatus']) => void;
  onDeleteStudio?: (id: string) => void;
  onQuickLogToRecords?: (studio: StudioCandidate) => void;
  editorialTheme?: EditorialTheme;
}

export const RadarDiscovery: React.FC<RadarDiscoveryProps> = ({
  studios,
  records,
  onAddStudios,
  onOpenDossier,
  onDraftOutreach,
  onUpdateStatus,
  onDeleteStudio,
  onQuickLogToRecords,
  editorialTheme = 'petrol',
}) => {
  const palette = EDITORIAL_PALETTES[editorialTheme] || EDITORIAL_PALETTES.petrol;
  const [selectedLocation, setSelectedLocation] = useState('Italy (Milan, Turin, Rome)');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [customKeywords, setCustomKeywords] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Local list filter
  const [statusFilter, setStatusFilter] = useState<'active_all' | HiringStatus | 'recorded' | 'dismissed' | 'all'>('active_all');
  const [searchQuery, setSearchQuery] = useState('');

  const locationPresets = [
    { label: 'Italy (Milan Priority)', value: 'Italy (Milan, Turin, Rome)' },
    { label: 'Milan Only', value: 'Milan, Italy' },
    { label: 'Amsterdam (Speculative & Experience)', value: 'Amsterdam, Netherlands' },
    { label: 'Berlin (Cultural & Media)', value: 'Berlin, Germany' },
    { label: 'Copenhagen (Systems & Design)', value: 'Copenhagen, Denmark' },
    { label: 'European Remote / Global', value: 'Remote Europe' },
  ];

  const domainPresets = [
    { label: 'All Ecosystems (Expanded Universe)', value: 'All' },
    { label: 'Human–AI Interaction & AI Transformation', value: 'Human–AI Interaction, AI Experience, Agent Experience & AI Transformation' },
    { label: 'Design Strategy & Systems Design', value: 'Design Strategy, Systems Design & Complexity Structuring' },
    { label: 'Narrative Systems & Speculative Scenarios', value: 'Narrative Systems, Speculative Scenarios & Worldbuilding' },
    { label: 'Spatial Narrative & Immersive Experience', value: 'Spatial Narrative, Exhibition and Immersive Technology' },
    { label: 'Automotive & Luxury Experience', value: 'Automotive and Luxury Brand Communication & Experience' },
    { label: 'Creative Direction & Interdisciplinary Production', value: 'Creative Direction, Communication and Interdisciplinary Production' },
  ];

  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleLaunchProbe = async () => {
    setIsSearching(true);
    setSearchError(null);
    setSuccessNotice(null);
    try {
      const response = await fetch('/api/discover-studios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedLocation,
          domain: selectedDomain,
          customKeywords,
          existingIds: studios.map((s) => s.id),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || `Server responded with status ${response.status}`);
      }

      if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
        onAddStudios(data.results);
        setSuccessNotice(`Discovered and added ${data.results.length} new studios to the radar!`);
        setTimeout(() => setSuccessNotice(null), 5000);
      } else {
        setSearchError('No new unique studios found matching this precise search angle. Try broadening keywords.');
      }
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || 'Error occurred during discovery probe.');
    } finally {
      setIsSearching(false);
    }
  };

  // Helper to match studio candidate with recorded applications
  const getLinkedRecord = (studio: StudioCandidate): ApplicationRecord | undefined => {
    if (!studio || !studio.name) return undefined;
    const sName = (studio.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return records.find((rec) => {
      if (!rec || !rec.company) return false;
      const rName = (rec.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return sName.includes(rName) || rName.includes(sName);
    });
  };

  // Filtered studios
  const filteredStudios = studios.filter((studio) => {
    if (!studio) return false;
    const isDismissed = studio.pipelineStatus === 'dismissed';
    const linked = getLinkedRecord(studio);

    if (statusFilter === 'active_all') {
      if (isDismissed) return false;
    } else if (statusFilter === 'dismissed') {
      if (!isDismissed) return false;
    } else if (statusFilter === 'recorded') {
      if (!linked) return false;
    } else if (statusFilter === 'all') {
      // Show all
    } else {
      // HiringStatus match, and exclude dismissed
      if (isDismissed || studio.hiringStatus !== statusFilter) return false;
    }

    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return true;

    const sName = (studio.name || '').toLowerCase();
    const sLoc = (studio.location || '').toLowerCase();
    const sEco = (studio.ecosystem || '').toLowerCase();
    const sPhil = (studio.corePhilosophy || '').toLowerCase();

    return (
      sName.includes(q) ||
      sLoc.includes(q) ||
      sEco.includes(q) ||
      sPhil.includes(q)
    );
  });

  const activeAllCount = studios.filter((s) => s && s.pipelineStatus !== 'dismissed').length;
  const activeCount = studios.filter((s) => s && s.hiringStatus === 'active_role' && s.pipelineStatus !== 'dismissed').length;
  const spontaneousCount = studios.filter((s) => s && s.hiringStatus === 'spontaneous_outreach' && s.pipelineStatus !== 'dismissed').length;
  const recordedCount = studios.filter((s) => s && getLinkedRecord(s) !== undefined).length;
  const dismissedCount = studios.filter((s) => s && s.pipelineStatus === 'dismissed').length;

  return (
    <div className="space-y-6">
      {/* Editorial Spread Hero Card (Superside Magazine Style) */}
      <div className={`${palette.bgClass} ${palette.textClass} rounded-3xl p-6 sm:p-9 shadow-lg border ${palette.borderClass} ${palette.glowClass} relative overflow-hidden transition-colors`}>
        {/* Giant Typographic Watermark in Background */}
        <div className="absolute -right-10 -bottom-12 opacity-15 select-none pointer-events-none text-right hidden md:block">
          <div className={`editorial-watermark text-8xl ${palette.watermarkTextClass}`}>02 Discovery</div>
          <div className={`editorial-watermark text-8xl ${palette.headlineAccentClass}`}>Overcommitted</div>
        </div>

        <div className="max-w-3xl relative z-10">
          <div className="flex items-center space-x-2.5 mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${palette.eyebrowBgClass} ${palette.eyebrowTextClass}`}>
              CHAPTER 02 · RADAR
            </span>
            <span className={`text-xs ${palette.subtitleClass} font-editorial italic`}>
              Autonomous Studio &amp; Cognitive Alignment Engine · {palette.pdfSource}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-white mb-3">
            Studio <span className={`font-editorial italic ${palette.headlineAccentClass}`}>&amp; Cognitive</span> Alignment Radar
          </h2>

          <p className={`text-sm ${palette.subtitleClass} leading-relaxed mb-6 font-normal`}>
            Autonomous scouting across independent creative consultancies, experiential practices, and spatial narrative collectives in Milan and Europe.
            <strong className={`${palette.headlineAccentClass} font-bold`}> Priority #1: Structural Fit &amp; Philosophy</strong>. Studios without open postings are prioritized for bespoke cold pitches.
          </p>
        </div>

        {/* Search Parameter Console */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3.5 ${palette.innerBoxBgClass} p-4 sm:p-5 rounded-2xl border ${palette.innerBoxBorderClass} mb-5 text-xs relative z-10`}>
          {/* Location Selector */}
          <div>
            <label className={`block text-[10px] font-bold ${palette.mutedClass} uppercase tracking-wider mb-1.5 flex items-center`}>
              <MapPin className={`w-3.5 h-3.5 mr-1 ${palette.headlineAccentClass}`} />
              Geography / City Hub
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className={`w-full ${palette.bgClass} border ${palette.borderClass} text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-white/30 font-medium`}
            >
              {locationPresets.map((loc) => (
                <option key={loc.value} value={loc.value} className="bg-[#143d46] text-white">
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Domain / Discipline Selector */}
          <div>
            <label className={`block text-[10px] font-bold ${palette.mutedClass} uppercase tracking-wider mb-1.5 flex items-center`}>
              <Globe className="w-3.5 h-3.5 mr-1 text-[#9ad3fa]" />
              Creative Discipline
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className={`w-full ${palette.bgClass} border ${palette.borderClass} text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-white/30 font-medium`}
            >
              {domainPresets.map((dom) => (
                <option key={dom.value} value={dom.value} className="bg-[#143d46] text-white">
                  {dom.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Keywords / Niche */}
          <div>
            <label className={`block text-[10px] font-bold ${palette.mutedClass} uppercase tracking-wider mb-1.5 flex items-center`}>
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#f7a8d8]" />
              Niche Focus / Keywords
            </label>
            <input
              type="text"
              placeholder="e.g. Agent Experience, Systems Design, Restomod"
              value={customKeywords}
              onChange={(e) => setCustomKeywords(e.target.value)}
              className={`w-full ${palette.bgClass} border ${palette.borderClass} text-white placeholder-white/40 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-white/30 font-medium`}
            />
          </div>
        </div>

        {/* Quick-Filter Keyword Universe Chips */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 mb-5 text-[11px] relative z-10">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${palette.mutedClass} mr-1`}>
            Quick Universes:
          </span>
          {[
            'Human–AI & Agent Experience',
            'AI Transformation & UX',
            'Design Strategy & Systems',
            'Narrative Systems & Scenarios',
            'Spatial Narrative & Immersive',
            'Automotive Communication',
            'Physical Artefact Translation',
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setCustomKeywords(tag)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                customKeywords === tag
                  ? 'bg-white text-[#0c2b21] border-white font-bold shadow-xs'
                  : 'bg-white/10 text-white/90 border-white/15 hover:bg-white/20'
              }`}
            >
              {tag}
            </button>
          ))}
          {customKeywords && (
            <button
              type="button"
              onClick={() => setCustomKeywords('')}
              className="text-white/60 hover:text-white underline text-[10px] ml-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Action Button & Telemetry */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className={`text-xs ${palette.mutedClass} flex items-center space-x-2`}>
            <span className={`inline-block w-2 h-2 rounded-full ${palette.dotColor} animate-ping`} />
            <span>Search Grounding Active · 18-Point Cognitive Filter Engaged</span>
          </div>

          <button
            onClick={handleLaunchProbe}
            disabled={isSearching}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider ${palette.buttonBgClass} ${palette.buttonTextClass} ${palette.buttonHoverBgClass} disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md`}
          >
            {isSearching ? (
              <>
                <Loader2 className={`w-4 h-4 animate-spin ${palette.buttonTextClass}`} />
                <span>Scanning Creative Ecosystems...</span>
              </>
            ) : (
              <>
                <Compass className={`w-4 h-4 ${palette.buttonTextClass}`} />
                <span>Launch Discovery Probe</span>
              </>
            )}
          </button>
        </div>

        {successNotice && (
          <div className="mt-4 p-3 bg-[#0a3124] border border-[#a6f4c5]/40 text-[#a6f4c5] text-xs rounded-xl relative z-10 font-medium flex items-center justify-between">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#a6f4c5] mr-2 animate-pulse" />
              {successNotice}
            </span>
          </div>
        )}

        {searchError && (
          <div className="mt-4 p-3 bg-[#3a151b] border border-[#fca590]/50 text-[#fca590] text-xs rounded-xl relative z-10 font-medium">
            {searchError}
          </div>
        )}
      </div>

      {/* Editorial Filter Bar with Pastel Chips */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-2">
        {/* Pastel Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1">
          <button
            onClick={() => setStatusFilter('active_all')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-medium ${
              statusFilter === 'active_all'
                ? 'bg-[#0c2b21] text-white font-bold shadow-sm'
                : 'bg-white text-[#345244] hover:bg-[#eae7dd] border border-[#ded9cb]'
            }`}
          >
            Active Radar ({activeAllCount})
          </button>

          <button
            onClick={() => setStatusFilter('spontaneous_outreach')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-semibold ${
              statusFilter === 'spontaneous_outreach'
                ? 'bg-[#f7a8d8] text-[#58153c] font-bold shadow-xs'
                : 'bg-white text-[#58153c] hover:bg-[#fce7f3] border border-[#f7a8d8]/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#58153c]" />
            <span>Spontaneous Pitch ({spontaneousCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('active_role')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-semibold ${
              statusFilter === 'active_role'
                ? 'bg-[#9de6c7] text-[#0a3824] font-bold shadow-xs'
                : 'bg-white text-[#0a3824] hover:bg-[#d1fae5] border border-[#9de6c7]/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a3824]" />
            <span>Active Openings ({activeCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('recorded')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-semibold ${
              statusFilter === 'recorded'
                ? 'bg-[#9ad3fa] text-[#082d47] font-bold shadow-xs'
                : 'bg-white text-[#082d47] hover:bg-[#e0f2fe] border border-[#9ad3fa]/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>In Records ({recordedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('dismissed')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-semibold ${
              statusFilter === 'dismissed'
                ? 'bg-[#64748b] text-white font-bold shadow-xs'
                : 'bg-white text-[#64748b] hover:bg-[#f1f5f9] border border-[#cbd5e1]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]" />
            <span>Dismissed / 排除 ({dismissedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-medium ${
              statusFilter === 'all'
                ? 'bg-[#18523f] text-white font-bold shadow-xs'
                : 'bg-white text-[#6b7280] hover:bg-[#eae7dd] border border-[#ded9cb]'
            }`}
            title="View all candidates including dismissed"
          >
            Show All ({studios.length})
          </button>
        </div>

        {/* Editorial Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#6c867a] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search studios, domains, philosophies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#ded9cb] rounded-full text-xs text-[#0c2b21] placeholder-[#799587] focus:ring-2 focus:ring-[#d4f04c] focus:border-[#0c2b21] font-medium"
          />
        </div>
      </div>

      {/* Studio Candidate Grid */}
      {filteredStudios.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#ded9cb]">
          <Compass className="w-10 h-10 mx-auto text-[#7e998c] mb-2" />
          <h3 className="text-base font-serif font-bold text-[#0c2b21]">No candidate matches this filter</h3>
          <p className="text-xs text-[#5f7a6e] mt-1 max-w-sm mx-auto font-medium">
            Reset filter to "Active Radar" or click "Launch Discovery Probe" to discover new creative practices.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudios.map((studio) => {
            const linked = getLinkedRecord(studio);
            return (
              <StudioCard
                key={studio.id}
                studio={studio}
                linkedRecord={linked}
                onOpenDossier={onOpenDossier}
                onDraftOutreach={onDraftOutreach}
                onUpdateStatus={onUpdateStatus}
                onDeleteStudio={onDeleteStudio}
                onQuickLogToRecords={onQuickLogToRecords}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

