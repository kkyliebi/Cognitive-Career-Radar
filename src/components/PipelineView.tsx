import React from 'react';
import { StudioCandidate, PipelineStatus, EditorialTheme } from '../types';
import { EDITORIAL_PALETTES } from '../utils/theme';
import { Send, FileText, ArrowUpRight } from 'lucide-react';

interface PipelineViewProps {
  studios: StudioCandidate[];
  onOpenDossier: (studio: StudioCandidate) => void;
  onDraftOutreach: (studio: StudioCandidate) => void;
  onUpdateStatus: (id: string, status: PipelineStatus) => void;
  editorialTheme?: EditorialTheme;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  studios,
  onOpenDossier,
  onDraftOutreach,
  onUpdateStatus,
  editorialTheme = 'petrol',
}) => {
  const palette = EDITORIAL_PALETTES[editorialTheme] || EDITORIAL_PALETTES.petrol;
  const columns: { id: PipelineStatus; title: string; subtitle: string; dotColor: string }[] = [
    { id: 'discovered', title: 'Discovered', subtitle: 'On active radar', dotColor: 'bg-[#98b8aa]' },
    { id: 'saved', title: 'Watchlist', subtitle: 'Targeted for review', dotColor: 'bg-[#9ad3fa]' },
    { id: 'outreach_prepared', title: 'Pitch Prepared', subtitle: 'Angle & CV ready', dotColor: 'bg-[#f7a8d8]' },
    { id: 'contacted', title: 'Contacted', subtitle: 'Pitch dispatched', dotColor: palette.dotColor },
    { id: 'interviewing', title: 'In Dialogue', subtitle: 'Active conversation', dotColor: 'bg-[#9de6c7]' },
  ];

  return (
    <div className="space-y-6 text-[#0c2b21]">
      {/* Editorial Header Banner */}
      <div className={`${palette.bgClass} ${palette.textClass} rounded-3xl p-6 sm:p-8 border ${palette.borderClass} ${palette.glowClass} relative overflow-hidden shadow-md transition-colors`}>
        <div className={`absolute -right-8 -bottom-10 text-[110px] font-serif font-black ${palette.watermarkTextClass} select-none pointer-events-none`}>
          KANBAN
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className={`flex items-center space-x-2 text-xs ${palette.mutedClass} mb-2 font-mono`}>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${palette.eyebrowBgClass} ${palette.eyebrowTextClass}`}>
                SECTION 03
              </span>
              <span>—</span>
              <span className="uppercase tracking-wider">STAGE LEDGER · {palette.pdfSource}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Spontaneous Outreach &amp; <span className={`font-editorial italic ${palette.headlineAccentClass}`}>Studio Pipeline</span>
            </h2>
            <p className={`text-xs ${palette.subtitleClass} mt-1 max-w-2xl font-editorial italic text-[13px]`}>
              Tracking progression from structural discovery to tailored dossier assembly, cold pitch transmission, and live studio dialogue.
            </p>
          </div>

          <div className={`flex items-center space-x-2.5 text-xs ${palette.headlineAccentClass} ${palette.innerBoxBgClass} px-4 py-2 rounded-full border ${palette.innerBoxBorderClass} flex-shrink-0`}>
            <span className={`w-2 h-2 rounded-full ${palette.dotColor} animate-pulse`} />
            <span className="font-mono font-bold text-white">{studios.length} Active Practices in Orbit</span>
          </div>
        </div>
      </div>

      {/* Editorial Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colStudios = studios.filter((s) => s.pipelineStatus === col.id);
          return (
            <div
              key={col.id}
              className="bg-white rounded-3xl p-4 border border-[#ded9cb] min-w-[240px] flex flex-col shadow-xs"
            >
              {/* Column Header */}
              <div className="mb-3.5 flex items-center justify-between pb-2.5 border-b border-[#ece8dd]">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} border border-[#0c2b21]/20`} />
                  <div>
                    <h3 className="text-xs font-serif font-bold text-[#0c2b21]">
                      {col.title}
                    </h3>
                    <span className="text-[10px] text-[#648274] block font-mono">{col.subtitle}</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-[#f4f2ea] text-[#0c2b21] text-[11px] rounded-full font-mono font-bold border border-[#ded9cb]">
                  {colStudios.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                {colStudios.map((studio) => (
                  <div
                    key={studio.id}
                    className="bg-[#fbfaf6] hover:bg-white rounded-2xl p-3.5 border border-[#e2ded2] shadow-xs space-y-2.5 hover:shadow-md hover:border-[#0c2b21] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="font-serif font-bold text-sm text-[#0c2b21] group-hover:text-[#18523f] transition-colors flex items-center">
                        <a
                          href={studio.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center"
                        >
                          {studio.name}
                          <ArrowUpRight className="w-3 h-3 ml-1 text-[#648274] group-hover:text-[#0c2b21]" />
                        </a>
                      </h4>
                      <span className="text-[10px] font-bold text-[#0c2b21] bg-[#d4f04c] px-2 py-0.5 rounded-full border border-[#b2cf27] flex-shrink-0 shadow-xs">
                        {studio.companyFitScore}%
                      </span>
                    </div>

                    <p className="text-[11px] text-[#557164] font-medium line-clamp-1">
                      {studio.location} · {studio.ecosystem}
                    </p>

                    {/* Quick Move Selector */}
                    <div className="pt-2.5 border-t border-[#ede9df] flex items-center justify-between gap-1">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onOpenDossier(studio)}
                          className="p-1.5 rounded-full text-[#648274] hover:text-[#0c2b21] hover:bg-[#f0ece2] transition-colors"
                          title="Open Strategic Dossier"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDraftOutreach(studio)}
                          className="p-1.5 rounded-full text-[#648274] hover:text-[#0c2b21] hover:bg-[#f0ece2] transition-colors"
                          title="Generate Outreach Pitch"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <select
                        value={studio.pipelineStatus}
                        onChange={(e) => onUpdateStatus(studio.id, e.target.value as PipelineStatus)}
                        className="text-[10px] bg-white border border-[#ded9cb] text-[#0c2b21] font-semibold rounded-full px-2.5 py-0.5 focus:outline-none focus:border-[#0c2b21]"
                      >
                        <option value="discovered">Discovered</option>
                        <option value="saved">Watchlist</option>
                        <option value="outreach_prepared">Pitch Ready</option>
                        <option value="contacted">Contacted</option>
                        <option value="interviewing">In Dialogue</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                ))}

                {colStudios.length === 0 && (
                  <div className="py-8 text-center text-[11px] text-[#718d80] border border-dashed border-[#ded9cb] rounded-2xl font-editorial italic bg-[#fbfaf6]">
                    No studios in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
