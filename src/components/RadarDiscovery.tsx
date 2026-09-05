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
  const [statusFilter, setStatusFilter] = useState<'all' | HiringStatus | 'recorded'>('all');
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
    { label: 'All Ecosystems', value: 'All' },
    { label: 'Automotive & Luxury Experience', value: 'Automotive and Luxury Brand Communication' },
    { label: 'Spatial Narrative & Exhibition', value: 'Spatial Narrative, Exhibition and Immersive Technology' },
    { label: 'Speculative Design & Future Systems', value: 'Speculative Design, R&D and Strategic Communication' },
    { label: 'Interdisciplinary Creative Production', value: 'Creative Direction and Creative Production' },
  ];

  const handleLaunchProbe = async () => {
    setIsSearching(true);
    setSearchError(null);
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

      if (!response.ok) {
        throw new Error('Failed to retrieve studio candidates from radar.');
      }

      const data = await response.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        onAddStudios(data.results);
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
    const sName = studio.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return records.find((rec) => {
      const rName = rec.company.toLowerCase().replace(/[^a-z0-9]/g, '');
      return sName.includes(rName) || rName.includes(sName);
    });
  };

  // Filtered studios
  const filteredStudios = studios.filter((studio) => {
    const linked = getLinkedRecord(studio);
    if (statusFilter === 'recorded') {
      if (!linked) return false;
    } else if (statusFilter !== 'all') {
      if (studio.hiringStatus !== statusFilter) return false;
    }

    const matchesQuery =
      searchQuery.trim() === '' ||
      studio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studio.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studio.ecosystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studio.corePhilosophy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  const activeCount = studios.filter((s) => s.hiringStatus === 'active_role').length;
  const spontaneousCount = studios.filter((s) => s.hiringStatus === 'spontaneous_outreach').length;
  const recordedCount = studios.filter((s) => getLinkedRecord(s) !== undefined).length;

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
              placeholder="e.g. Restomod, Spatial Narrative, R&amp;D"
              value={customKeywords}
              onChange={(e) => setCustomKeywords(e.target.value)}
              className={`w-full ${palette.bgClass} border ${palette.borderClass} text-white placeholder-white/40 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-white/30 font-medium`}
            />
          </div>
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
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap font-medium ${
              statusFilter === 'all'
                ? 'bg-[#0c2b21] text-white font-bold shadow-sm'
                : 'bg-white text-[#345244] hover:bg-[#eae7dd] border border-[#ded9cb]'
            }`}
          >
            All Studios ({studios.length})
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
            Reset filter to "All Studios" or click "Launch Discovery Probe" to discover new creative practices.
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
                onQuickLogToRecords={onQuickLogToRecords}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

