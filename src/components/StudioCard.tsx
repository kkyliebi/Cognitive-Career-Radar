import React from 'react';
import { StudioCandidate, ApplicationRecord } from '../types';
import { ArrowUpRight, PlusCircle, CheckCircle2, FileText, Send } from 'lucide-react';

interface StudioCardProps {
  studio: StudioCandidate;
  linkedRecord?: ApplicationRecord;
  onOpenDossier: (studio: StudioCandidate) => void;
  onDraftOutreach: (studio: StudioCandidate) => void;
  onUpdateStatus: (id: string, status: StudioCandidate['pipelineStatus']) => void;
  onQuickLogToRecords?: (studio: StudioCandidate) => void;
}

export const StudioCard: React.FC<StudioCardProps> = ({
  studio,
  linkedRecord,
  onOpenDossier,
  onDraftOutreach,
  onUpdateStatus,
  onQuickLogToRecords,
}) => {
  const getStatusBadge = () => {
    switch (studio.hiringStatus) {
      case 'active_role':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#9de6c7] text-[#0a3824]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a3824] mr-1.5" />
            Active Role ({studio.activeRoles?.length || 1})
          </span>
        );
      case 'spontaneous_outreach':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#f7a8d8] text-[#58153c]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58153c] mr-1.5" />
            Spontaneous (P#1 Fit)
          </span>
        );
      case 'talent_pool':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#e5e1d5] text-[#364b41]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5a6f65] mr-1.5" />
            Benchmark Watch
          </span>
        );
    }
  };

  const engineSteps = [
    { key: 'understand', label: 'U', title: 'Understand' },
    { key: 'structure', label: 'S', title: 'Structure' },
    { key: 'concept', label: 'C', title: 'Concept' },
    { key: 'translate', label: 'T', title: 'Translate' },
    { key: 'coordinate', label: 'Co', title: 'Coordinate' },
    { key: 'produce', label: 'P', title: 'Produce' },
    { key: 'realise', label: 'R', title: 'Realise' },
  ] as const;

  const getPriorityColor = () => {
    switch (studio.overallPriority) {
      case 'EXCEPTIONAL':
        return 'bg-[#d4f04c] text-[#0c2b21] border-[#d4f04c] font-bold';
      case 'STRONG':
        return 'bg-[#9ad3fa] text-[#082d47] border-[#9ad3fa] font-semibold';
      case 'INVESTIGATE':
      default:
        return 'bg-[#fca590] text-[#4f1609] border-[#fca590] font-semibold';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e4e0d5] p-5 sm:p-6 shadow-[0_2px_12px_rgba(12,43,33,0.04)] hover:shadow-[0_12px_32px_rgba(12,43,33,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between text-[#0c2b21] group relative overflow-hidden">
      {/* Decorative Editorial Watermark Letter in Corner */}
      <div className="absolute top-2 right-4 text-7xl font-serif italic text-[#0c2b21]/[0.03] select-none pointer-events-none">
        {studio.name.charAt(0)}
      </div>

      {/* Top Section */}
      <div className="space-y-3.5 relative z-10">
        {/* Linked Record or Location & Quick Log */}
        {linkedRecord ? (
          <div className="p-2 px-3 rounded-xl bg-[#0c2b21] text-[#f7f6f1] flex items-center justify-between text-xs border border-[#1b4839]">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d4f04c]" />
              <span className="font-semibold text-[#d4f04c]">Recorded: {linkedRecord.id}</span>
              <span className="text-[#a5c2b4]">· {linkedRecord.status}</span>
            </div>
            <span className="text-[11px] text-[#d4f04c] font-mono">{linkedRecord.date}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#557164] font-medium tracking-wide">
              {studio.location} · <span className="font-bold text-[#0c2b21]">{studio.country}</span>
            </span>
            {onQuickLogToRecords && (
              <button
                onClick={() => onQuickLogToRecords(studio)}
                className="text-[#0c2b21] hover:text-[#18523f] flex items-center space-x-1 font-semibold text-xs transition-colors bg-[#f4f2ea] hover:bg-[#eae6dc] px-2.5 py-1 rounded-full border border-[#e2ded4]"
                title="Log this studio into Application Index"
              >
                <PlusCircle className="w-3 h-3 text-[#0c2b21]" />
                <span>Log to Index</span>
              </button>
            )}
          </div>
        )}

        {/* Title, Badges & Fit Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              {getStatusBadge()}
              <span className={`px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase border ${getPriorityColor()}`}>
                {studio.overallPriority}
              </span>
            </div>

            <h3 className="text-xl font-serif font-bold text-[#0c2b21] tracking-tight">
              <a
                href={studio.website}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#19523f] flex items-center transition-colors group-hover:underline decoration-[#d4f04c] decoration-2 underline-offset-2"
              >
                <span className="truncate">{studio.name}</span>
                <ArrowUpRight className="w-4 h-4 ml-1 flex-shrink-0 text-[#718d80] group-hover:text-[#0c2b21] transition-colors" />
              </a>
            </h3>
          </div>

          {/* Editorial Fit Score Box */}
          <div className="text-right flex-shrink-0">
            <div className="inline-flex items-baseline space-x-0.5 px-3 py-1 rounded-xl bg-[#0c2b21] text-[#d4f04c] shadow-xs">
              <span className="text-2xl font-serif font-bold tracking-tight">
                {studio.companyFitScore}
              </span>
              <span className="text-xs font-bold">%</span>
            </div>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-[#6c867a] mt-0.5">
              Fit Score
            </span>
          </div>
        </div>

        {/* Ecosystem Subtitle */}
        <div className="text-xs text-[#324f42] bg-[#f8f7f2] px-3 py-2 rounded-xl border border-[#e8e5dc] font-medium leading-snug">
          <span className="font-bold text-[#0c2b21] block text-[10px] uppercase tracking-wider text-[#69877a] mb-0.5">
            Ecosystem Archetype
          </span>
          {studio.ecosystem}
        </div>

        {/* Active Openings detected if any */}
        {studio.activeRoles && studio.activeRoles.length > 0 && (
          <div className="p-3 bg-[#e8f8f0] border border-[#a2e3c0] rounded-xl text-xs">
            <span className="font-bold text-[#0c3e29] block mb-1 uppercase tracking-wide text-[10px]">
              Open Opportunities:
            </span>
            <ul className="text-[#0c3e29] space-y-0.5 list-disc list-inside text-[11px] font-medium">
              {studio.activeRoles.map((role, idx) => (
                <li key={idx} className="truncate">{role}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Philosophy snippet styled as editorial pull-quote */}
        <div className="pl-3 border-l-2 border-[#d4f04c] py-0.5">
          <p className="text-xs text-[#28473a] font-editorial italic text-[13px] leading-relaxed line-clamp-3">
            "{studio.corePhilosophy}"
          </p>
        </div>

        {/* Career Engine Activation Chain */}
        <div className="bg-[#f5f3eb] p-3 rounded-xl border border-[#e3dfd3]">
          <div className="flex items-center justify-between text-[11px] text-[#557164] mb-1.5">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-[#456154]">
              Career Engine Scope:
            </span>
            <span className="text-[#0c2b21] font-medium text-xs">
              Ownership: <strong className="text-[#0c2b21] font-bold underline decoration-[#d4f04c]">{studio.decisionOwnershipExpected}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {engineSteps.map((step) => {
              const active = studio.careerEngineStages[step.key];
              return (
                <div
                  key={step.key}
                  title={`${step.title}: ${active ? 'Activated' : 'Inactive'}`}
                  className={`flex-1 py-1 text-center rounded-md text-[10px] font-bold transition-colors ${
                    active
                      ? 'bg-[#0c2b21] text-[#d4f04c] shadow-xs'
                      : 'bg-[#e7e3d7] text-[#86998f]'
                  }`}
                >
                  {step.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tailoring Track */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#69877a] text-[11px] font-semibold uppercase tracking-wider">CV Track:</span>
          <span className="px-2.5 py-0.5 bg-[#f5f3eb] text-[#0c2b21] rounded-full text-[11px] border border-[#ded9cb] font-semibold">
            {studio.recommendedCVTrack}
          </span>
        </div>
      </div>

      {/* Action Buttons in Superside Style */}
      <div className="mt-5 pt-3.5 border-t border-[#e8e5dc] flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenDossier(studio)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0c2b21] bg-[#f5f3eb] hover:bg-[#eae6dc] border border-[#d8d3c5] transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-[#0c2b21]" />
            <span>18-Pt Dossier</span>
          </button>

          <button
            onClick={() => onDraftOutreach(studio)}
            className="inline-flex items-center space-x-1 px-4 py-1.5 rounded-full text-xs font-bold text-[#0c2b21] bg-[#d4f04c] hover:bg-[#c3e038] transition-all shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Pitch</span>
          </button>
        </div>

        {/* Pipeline Quick Mover */}
        <select
          value={studio.pipelineStatus}
          onChange={(e) => onUpdateStatus(studio.id, e.target.value as any)}
          className="text-xs bg-[#f5f3eb] border border-[#ded9cb] rounded-lg px-2.5 py-1 text-[#0c2b21] font-medium focus:outline-none focus:border-[#0c2b21]"
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
  );
};

