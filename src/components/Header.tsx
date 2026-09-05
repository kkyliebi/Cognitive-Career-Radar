import React, { useState } from 'react';
import { Compass, Zap, ListFilter, BookOpen, Database, Radio, ArrowUpRight, Palette, Check } from 'lucide-react';
import { EditorialTheme } from '../types';
import { EDITORIAL_PALETTES } from '../utils/theme';

interface HeaderProps {
  activeTab: 'radar' | 'records' | 'inspector' | 'pipeline' | 'dna';
  setActiveTab: (tab: 'radar' | 'records' | 'inspector' | 'pipeline' | 'dna') => void;
  editorialTheme: EditorialTheme;
  setEditorialTheme: (theme: EditorialTheme) => void;
  stats: {
    total: number;
    activeRoles: number;
    spontaneous: number;
    highFit: number;
    recordsCount: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  editorialTheme,
  setEditorialTheme,
  stats,
}) => {
  const palette = EDITORIAL_PALETTES[editorialTheme] || EDITORIAL_PALETTES.petrol;
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  return (
    <header className={`sticky top-0 z-40 ${palette.bgClass} ${palette.textClass} border-b ${palette.borderClass} shadow-md transition-all`}>
      {/* Top Editorial Folio Bar (Superside Report Style) */}
      <div className="border-b border-white/10 text-[11px] font-medium tracking-wide uppercase px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-white/70">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-white font-bold tracking-tight text-xs">
            <span className={`w-2 h-2 rounded-full ${palette.dotColor}`} />
            <span className={`font-editorial italic font-normal text-sm lowercase ${palette.headlineAccentClass}`}>.kyliebi</span>
            <span className="text-white/40 font-normal">/</span>
            <span className="tracking-wider uppercase text-[10px] text-white">Career OS</span>
          </div>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline text-[10px] tracking-widest text-white/60">
            Report Issue 2025/2026 · Milan &amp; Europe
          </span>
        </div>

        {/* PDF Edition Palette Picker Pill */}
        <div className="flex items-center space-x-3 text-[10px] tracking-wider">
          <div className="flex items-center space-x-1.5 bg-black/25 px-2.5 py-1 rounded-full border border-white/15">
            <Palette className="w-3 h-3 text-white/80" />
            <span className="font-mono text-white/60 hidden md:inline">PDF Palette:</span>
            <div className="flex items-center space-x-1">
              {Object.values(EDITORIAL_PALETTES).map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => setEditorialTheme(pal.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all flex items-center space-x-1 ${
                    editorialTheme === pal.id
                      ? `${pal.eyebrowBgClass} ${pal.eyebrowTextClass} font-bold shadow-xs`
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title={`${pal.name} (${pal.pdfSource})`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pal.sampleColorHex }} />
                  <span>{pal.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <span className="hidden lg:inline text-white/70 font-mono text-[10px]">
            {palette.pdfPage}
          </span>
        </div>
      </div>

      {/* Masthead Headline & Quick Metric Chips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${palette.eyebrowBgClass} ${palette.eyebrowTextClass}`}>
                OVERCOMMITTED REPORT
              </span>
              <span className={`text-xs ${palette.subtitleClass} font-editorial italic`}>
                The State of Autonomous Creative Career Navigation · {palette.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight">
              Cognitive Career Radar <span className={`font-editorial italic font-normal ${palette.headlineAccentClass}`}>&amp;</span> Application Index
            </h1>
          </div>

          {/* Quick Metrics in Pastel / Acid Lime Chips */}
          <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1.5">
            {/* Records Logged */}
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center space-x-2 border text-xs font-medium ${
                activeTab === 'records'
                  ? `${palette.buttonBgClass} ${palette.buttonTextClass} font-bold shadow-sm`
                  : `${palette.innerBoxBgClass} hover:bg-white/15 ${palette.innerBoxBorderClass} text-white`
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{stats.recordsCount} Records</span>
            </button>

            {/* Radar Studios */}
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center space-x-2 border text-xs font-medium ${
                activeTab === 'radar'
                  ? `${palette.buttonBgClass} ${palette.buttonTextClass} font-bold shadow-sm`
                  : `${palette.innerBoxBgClass} hover:bg-white/15 ${palette.innerBoxBorderClass} text-white`
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{stats.total} Studios</span>
            </button>

            {/* Spontaneous Pitches (Pastel Coral/Pink) */}
            <div className="hidden sm:flex px-3 py-1.5 rounded-full border border-pink-300/30 bg-pink-400/10 items-center space-x-1.5 text-pink-200 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-300" />
              <span className="font-bold text-white">{stats.spontaneous}</span>
              <span>Spontaneous</span>
            </div>

            {/* Active Roles (Pastel Mint) */}
            <div className="hidden sm:flex px-3 py-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/10 items-center space-x-1.5 text-emerald-200 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              <span className="font-bold text-white">{stats.activeRoles}</span>
              <span>Openings</span>
            </div>
          </div>
        </div>

        {/* Editorial Chapter Navigation Bar */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between overflow-x-auto">
          <nav className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-medium">
            {/* Tab 01: Records & Index */}
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'records'
                  ? `${palette.buttonBgClass} ${palette.buttonTextClass} font-bold shadow-sm`
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-mono opacity-80">01</span>
              <span>Application Index</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'records'
                    ? `${palette.innerBoxBgClass} text-white`
                    : 'bg-white/15 text-white'
                }`}
              >
                {stats.recordsCount}
              </span>
            </button>

            {/* Tab 02: Radar Explorer */}
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'radar'
                  ? `${palette.buttonBgClass} ${palette.buttonTextClass} font-bold shadow-sm`
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-mono opacity-80">02</span>
              <span>Radar Explorer</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'radar'
                    ? `${palette.innerBoxBgClass} text-white`
                    : 'bg-white/15 text-white'
                }`}
              >
                {stats.total}
              </span>
            </button>

            {/* Tab 03: Diagnostic Sandbox */}
            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'inspector'
                  ? `${palette.buttonBgClass} ${palette.buttonTextClass} font-bold shadow-sm`
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-mono opacity-80">03</span>
              <span>Diagnostic Sandbox</span>
            </button>

            {/* Tab 04: Pipeline */}
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'pipeline'
                  ? `${palette.buttonBgClass} ${palette.buttonTextClass} font-bold shadow-sm`
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-mono opacity-80">04</span>
              <span>Pipeline Kanban</span>
            </button>

            {/* Tab 05: Career DNA Spec */}
            <button
              onClick={() => setActiveTab('dna')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'dna'
                  ? `${palette.buttonBgClass} ${palette.buttonTextClass} font-bold shadow-sm`
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-mono opacity-80">05</span>
              <span>18-Point Protocol</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

