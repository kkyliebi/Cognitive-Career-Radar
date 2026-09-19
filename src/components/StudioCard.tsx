import React, { useState } from 'react';
import { StudioCandidate, ApplicationRecord } from '../types';
import { ArrowUpRight, PlusCircle, CheckCircle2, FileText, Send, Trash2, X, Ban, RotateCcw } from 'lucide-react';

interface StudioCardProps {
  studio: StudioCandidate;
  linkedRecord?: ApplicationRecord;
  onOpenDossier: (studio: StudioCandidate) => void;
  onDraftOutreach: (studio: StudioCandidate) => void;
  onUpdateStatus: (id: string, status: StudioCandidate['pipelineStatus']) => void;
  onDeleteStudio?: (id: string) => void;
  onQuickLogToRecords?: (studio: StudioCandidate) => void;
}

export const StudioCard: React.FC<StudioCardProps> = ({
  studio,
  linkedRecord,
  onOpenDossier,
  onDraftOutreach,
  onUpdateStatus,
  onDeleteStudio,
  onQuickLogToRecords,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isDismissed = studio?.pipelineStatus === 'dismissed';
  const studioName = studio?.name || 'Creative Studio';

  const getStatusBadge = () => {
    if (isDismissed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]">
          <Ban className="w-3 h-3 mr-1 text-[#64748b]" />
          Dismissed / 排除
        </span>
      );
    }

    switch (studio?.hiringStatus) {
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
    { key: 'understandDomain', fallback: 'understand', label: 'UD', title: '01 Understand Domain' },
    { key: 'identifyRelationships', fallback: 'relationships', label: 'IR', title: '02 Identify Relationships' },
    { key: 'structureComplexity', fallback: 'structure', label: 'SC', title: '03 Structure Complexity' },
    { key: 'createConceptsScenarios', fallback: 'concept', label: 'CS', title: '04 Concepts & Scenarios' },
    { key: 'translateArtefacts', fallback: 'translate', label: 'TA', title: '05 Translate into Artefacts' },
    { key: 'facilitatePeople', fallback: 'facilitate', label: 'FP', title: '06 Facilitate People' },
    { key: 'designSystemsNarrative', fallback: 'design', label: 'DS', title: '07 Design Interaction & Systems' },
    { key: 'coordinateImplementation', fallback: 'coordinate', label: 'CI', title: '08 Coordinate Implementation' },
  ] as const;

  const getPriorityColor = () => {
    if (isDismissed) {
      return 'bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1] font-medium';
    }
    switch (studio?.overallPriority) {
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
    <div
      className={`bg-white rounded-2xl border ${
        isDismissed
          ? 'border-[#cbd5e1] opacity-75 hover:opacity-100 bg-[#fafafa]'
          : 'border-[#e4e0d5]'
      } p-5 sm:p-6 shadow-[0_2px_12px_rgba(12,43,33,0.04)] hover:shadow-[0_12px_32px_rgba(12,43,33,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between text-[#0c2b21] group relative overflow-hidden`}
    >
      {/* Decorative Editorial Watermark Letter in Corner */}
      <div className="absolute top-2 right-4 text-7xl font-serif italic text-[#0c2b21]/[0.03] select-none pointer-events-none">
        {studioName.charAt(0)}
      </div>

      {/* Top Section */}
      <div className="space-y-3.5 relative z-10">
        {/* Linked Record or Location & Actions */}
        <div className="flex items-center justify-between text-xs">
          {linkedRecord ? (
            <div className="p-1.5 px-2.5 rounded-xl bg-[#0c2b21] text-[#f7f6f1] flex items-center space-x-1.5 text-xs border border-[#1b4839] max-w-[70%] truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d4f04c] flex-shrink-0" />
              <span className="font-semibold text-[#d4f04c] truncate">{linkedRecord.id}</span>
              <span className="text-[#a5c2b4] truncate">· {linkedRecord.status}</span>
            </div>
          ) : (
            <span className="text-[#557164] font-medium tracking-wide">
              {studio?.location || 'Milan'} · <span className="font-bold text-[#0c2b21]">{studio?.country || 'Italy'}</span>
            </span>
          )}

          <div className="flex items-center space-x-1.5">
            {!linkedRecord && onQuickLogToRecords && !isDismissed && (
              <button
                onClick={() => onQuickLogToRecords(studio)}
                className="text-[#0c2b21] hover:text-[#18523f] flex items-center space-x-1 font-semibold text-xs transition-colors bg-[#f4f2ea] hover:bg-[#eae6dc] px-2.5 py-1 rounded-full border border-[#e2ded4]"
                title="Log this studio into Application Index"
              >
                <PlusCircle className="w-3 h-3 text-[#0c2b21]" />
                <span>Log</span>
              </button>
            )}

            {/* Quick Dismiss / Restore Toggle */}
            {isDismissed ? (
              <button
                onClick={() => onUpdateStatus(studio.id, 'discovered')}
                className="text-[#0c2b21] hover:bg-[#e2e8f0] p-1.5 rounded-full border border-[#cbd5e1] transition-colors"
                title="Restore candidate to active Radar"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#334155]" />
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(studio.id, 'dismissed')}
                className="text-[#64748b] hover:text-[#0c2b21] hover:bg-[#f1f5f9] p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="Mark as Dismissed (排除此候选)"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete button */}
            {onDeleteStudio && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-[#94a3b8] hover:text-[#b91c1c] hover:bg-[#fee2e2] p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="Permanently remove record (删除重复/错误记录)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="p-3 bg-[#fef2f2] border border-[#fca5a5] rounded-xl text-xs text-[#991b1b] space-y-2 animate-fade-in">
            <div className="flex items-center justify-between font-semibold">
              <span>Delete this candidate permanently?</span>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-[#991b1b] hover:bg-[#fee2e2] p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-[#b91c1c]">
              This will remove "{studioName}" from your Radar Explorer.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 bg-white border border-[#fca5a5] text-[#991b1b] rounded-md text-[11px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteStudio?.(studio.id);
                }}
                className="px-2.5 py-1 bg-[#dc2626] text-white rounded-md text-[11px] font-bold hover:bg-[#b91c1c]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Title, Badges & Fit Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              {getStatusBadge()}
              <span className={`px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase border ${getPriorityColor()}`}>
                {studio?.overallPriority || 'STRONG'}
              </span>
            </div>

            <h3 className="text-xl font-serif font-bold text-[#0c2b21] tracking-tight">
              <a
                href={studio?.website || 'https://'}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#19523f] flex items-center transition-colors group-hover:underline decoration-[#d4f04c] decoration-2 underline-offset-2"
              >
                <span className="truncate">{studioName}</span>
                <ArrowUpRight className="w-4 h-4 ml-1 flex-shrink-0 text-[#718d80] group-hover:text-[#0c2b21] transition-colors" />
              </a>
            </h3>
          </div>

          {/* Editorial Fit Score Box */}
          <div className="text-right flex-shrink-0">
            <div className={`inline-flex items-baseline space-x-0.5 px-3 py-1 rounded-xl ${isDismissed ? 'bg-[#475569] text-[#e2e8f0]' : 'bg-[#0c2b21] text-[#d4f04c]'} shadow-xs`}>
              <span className="text-2xl font-serif font-bold tracking-tight">
                {studio?.companyFitScore ?? 88}
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
          {studio?.ecosystem || 'Independent Design & Creative Practice'}
        </div>

        {/* Active Openings detected if any */}
        {studio?.activeRoles && studio.activeRoles.length > 0 && (
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
            "{studio?.corePhilosophy || studio?.whyItFitsKylie || 'Interdisciplinary practice bridging concept and physical realization.'}"
          </p>
        </div>

        {/* Career Engine Activation Chain */}
        <div className="bg-[#f5f3eb] p-3 rounded-xl border border-[#e3dfd3]">
          <div className="flex items-center justify-between text-[11px] text-[#557164] mb-1.5">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-[#456154]">
              Career Engine Scope:
            </span>
            <span className="text-[#0c2b21] font-medium text-xs">
              Ownership: <strong className="text-[#0c2b21] font-bold underline decoration-[#d4f04c]">{studio?.decisionOwnershipExpected || 'SHAPE'}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {engineSteps.map((step) => {
              const stages = studio?.careerEngineStages as any;
              const active = stages ? Boolean(stages[step.key] ?? stages[step.fallback] ?? true) : true;
              return (
                <div
                  key={step.key}
                  title={`${step.title}: ${active ? 'Activated' : 'Inactive'}`}
                  className={`flex-1 py-1 text-center rounded-md text-[9px] font-bold transition-colors ${
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
            {studio?.recommendedCVTrack || 'Creative / Design version'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3.5 border-t border-[#e8e5dc] flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenDossier(studio)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0c2b21] bg-[#f5f3eb] hover:bg-[#eae6dc] border border-[#d8d3c5] transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-[#0c2b21]" />
            <span>18-Pt Dossier</span>
          </button>

          {!isDismissed && (
            <button
              onClick={() => onDraftOutreach(studio)}
              className="inline-flex items-center space-x-1 px-4 py-1.5 rounded-full text-xs font-bold text-[#0c2b21] bg-[#d4f04c] hover:bg-[#c3e038] transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Pitch</span>
            </button>
          )}
        </div>

        {/* Pipeline Quick Mover */}
        <select
          value={studio?.pipelineStatus || 'discovered'}
          onChange={(e) => onUpdateStatus(studio.id, e.target.value as any)}
          className={`text-xs ${
            isDismissed ? 'bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1]' : 'bg-[#f5f3eb] text-[#0c2b21] border-[#ded9cb]'
          } rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:border-[#0c2b21]`}
        >
          <option value="discovered">Discovered</option>
          <option value="saved">Watchlist</option>
          <option value="outreach_prepared">Pitch Ready</option>
          <option value="contacted">Contacted</option>
          <option value="interviewing">In Dialogue</option>
          <option value="archived">Archived</option>
          <option value="dismissed">Dismissed (排除)</option>
        </select>
      </div>
    </div>
  );
};
