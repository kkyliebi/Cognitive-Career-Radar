import React, { useState } from 'react';
import { StudioCandidate, PipelineStatus, EditorialTheme } from '../types';
import { EDITORIAL_PALETTES } from '../utils/theme';
import { X, ArrowUpRight, Send, CheckCircle, AlertTriangle, Trash2, Ban, RotateCcw } from 'lucide-react';

interface DossierModalProps {
  studio: StudioCandidate | null;
  onClose: () => void;
  onDraftOutreach: (studio: StudioCandidate) => void;
  onUpdateStatus?: (id: string, status: PipelineStatus) => void;
  onDeleteStudio?: (id: string) => void;
  editorialTheme?: EditorialTheme;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  studio,
  onClose,
  onDraftOutreach,
  onUpdateStatus,
  onDeleteStudio,
  editorialTheme = 'petrol',
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!studio) return null;
  const palette = EDITORIAL_PALETTES[editorialTheme] || EDITORIAL_PALETTES.petrol;
  const isDismissed = studio.pipelineStatus === 'dismissed';

  const engineSteps = [
    { key: 'understandDomain', fallback: 'understand', num: '01', label: 'Understand Domain', short: 'Understand' },
    { key: 'identifyRelationships', fallback: 'relationships', num: '02', label: 'Identify Relationships', short: 'Relationships' },
    { key: 'structureComplexity', fallback: 'structure', num: '03', label: 'Structure Complexity', short: 'Structure' },
    { key: 'createConceptsScenarios', fallback: 'concept', num: '04', label: 'Create Concepts & Scenarios', short: 'Concepts' },
    { key: 'translateArtefacts', fallback: 'translate', num: '05', label: 'Translate into Artefacts', short: 'Artefacts' },
    { key: 'facilitatePeople', fallback: 'facilitate', num: '06', label: 'Facilitate People', short: 'Facilitate' },
    { key: 'designSystemsNarrative', fallback: 'design', num: '07', label: 'Design Systems & Narrative', short: 'Systems' },
    { key: 'coordinateImplementation', fallback: 'coordinate', num: '08', label: 'Coordinate Implementation', short: 'Deliver' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#ded9cb] shadow-[0_25px_60px_rgba(12,43,33,0.25)] overflow-hidden my-8 text-[#0c2b21] animate-scale-in">
        {/* Editorial Dossier Header */}
        <div className={`${palette.bgClass} ${palette.textClass} p-6 sm:p-8 border-b ${palette.borderClass} relative overflow-hidden transition-colors`}>
          <div className={`absolute right-4 -bottom-6 text-[90px] font-serif font-black ${palette.watermarkTextClass} opacity-40 select-none pointer-events-none`}>
            {studio.companyFitScore ?? 88}%
          </div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2.5 mb-3 flex-wrap gap-y-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${palette.eyebrowBgClass} ${palette.eyebrowTextClass} shadow-xs`}>
                  Strategic Fit {studio.companyFitScore ?? 88}%
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${palette.innerBoxBgClass} text-white border ${palette.innerBoxBorderClass}`}>
                  Priority: {studio.overallPriority || 'STRONG'}
                </span>
                <span className={`text-xs ${palette.mutedClass} font-mono`}>
                  {studio.location || 'Milan'}, {studio.country || 'Italy'} · {palette.name}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center tracking-tight">
                {studio.name}
                <a
                  href={studio.website || 'https://'}
                  target="_blank"
                  rel="noreferrer"
                  className={`ml-2.5 ${palette.mutedClass} hover:${palette.headlineAccentClass} transition-colors`}
                  title="Visit Website"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </a>
              </h2>
              <p className={`text-xs ${palette.subtitleClass} mt-1 font-medium`}>
                Sector Ecosystem: <strong className="text-white">{studio.ecosystem || 'Independent Creative Practice'}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto text-xs bg-[#fbfaf6]">
          {/* Hiring Status Highlight Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            studio.hiringStatus === 'active_role'
              ? 'bg-[#eefcf4] border-[#9de6c7] text-[#0c2b21]'
              : 'bg-[#fff5f2] border-[#fca590] text-[#0c2b21]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm">
                {studio.hiringStatus === 'active_role'
                  ? 'Active Role Openings Detected'
                  : 'Priority Spontaneous Positioning Target'}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 border border-current">
                {studio.hiringStatus === 'active_role' ? 'Standard Route' : 'Direct Pitch Route'}
              </span>
            </div>
            {studio.activeRoles && studio.activeRoles.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-[#9de6c7]/50">
                <span className="text-[11px] font-semibold text-[#1a5b42] block mb-1">Open Positions:</span>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-[#0a3824]">
                  {studio.activeRoles.map((role, idx) => (
                    <li key={idx} className="font-medium">{role}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Core Philosophy Section */}
          <div className="p-5 rounded-2xl bg-white border border-[#ded9cb] space-y-2.5 shadow-xs">
            <span className="font-bold text-[#0c2b21] block uppercase tracking-wider text-[11px]">
              Core Philosophy &amp; Problem Solved
            </span>
            <p className="text-xs text-[#2b4b3d] leading-relaxed font-editorial text-[14px]">
              "{studio.corePhilosophy || 'Interdisciplinary design and creative production practice.'}"
            </p>
          </div>

          {/* Career Engine Mapping */}
          <div className="p-5 rounded-2xl bg-white border border-[#ded9cb] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0c2b21] uppercase tracking-wider text-[11px]">
                Career Engine Activation
              </span>
              <span className="text-[11px]">
                Decision Ownership: <strong className="text-[#0c2b21]">{studio.decisionOwnershipExpected || 'SHAPE'}</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
              {engineSteps.map((step) => {
                const stages = studio.careerEngineStages as any;
                const active = stages ? Boolean(stages[step.key] ?? stages[step.fallback] ?? true) : true;
                return (
                  <div
                    key={step.key}
                    title={`${step.num} ${step.label}: ${active ? 'Activated' : 'Inactive'}`}
                    className={`p-2 text-center rounded-xl transition-all flex flex-col justify-center items-center ${
                      active
                        ? 'bg-[#d4f04c] text-[#0c2b21] shadow-xs border border-[#b2cf27]'
                        : 'bg-[#f4f2ea] text-[#718d80] border border-[#e8e4d8]'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold opacity-75">{step.num}</span>
                    <span className="text-[10px] font-bold tracking-tight leading-tight mt-0.5">{step.short}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signals Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl border border-[#9de6c7] bg-[#eefcf4]">
              <span className="font-serif font-bold text-sm text-[#0c2b21] block mb-2.5 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5 text-[#1a5b42]" />
                Structural Strengths
              </span>
              <ul className="space-y-1.5 text-xs text-[#1e4b37]">
                {(studio.structuralStrengths || []).map((s, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-[#1a5b42] font-bold">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-[#fca590] bg-[#fff5f2]">
              <span className="font-serif font-bold text-sm text-[#4a1208] block mb-2.5 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-[#b02213]" />
                Strategic Friction Watchpoints
              </span>
              <ul className="space-y-1.5 text-xs text-[#5a1b0f]">
                {(studio.potentialFrictions || []).map((f, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-[#b02213] font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tailoring & Recommended Track */}
          <div className="p-5 rounded-2xl bg-white border border-[#ded9cb] space-y-3.5 shadow-xs">
            <span className="font-bold text-[#0c2b21] block uppercase tracking-wider text-[11px]">
              Portfolio Selection &amp; Narrative Angle
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#648274] block text-[10px] font-bold uppercase">CV Dossier Track:</span>
                <span className="font-serif font-bold text-sm text-[#0c2b21] mt-0.5 block">{studio.recommendedCVTrack || 'Creative / Design version'}</span>
              </div>
              <div>
                <span className="text-[#648274] block text-[10px] font-bold uppercase">Key Reference Artifacts:</span>
                <span className="text-[#203c2f] font-medium mt-0.5 block">{studio.keyWorkExamples?.join(', ') || 'Spatial systems, Audi integrated campaign'}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#f0ede4]">
              <span className="text-[#648274] block text-[10px] font-bold uppercase mb-1">Recommended Cold Outreach Pitch Angle:</span>
              <p className="text-xs text-[#1e4133] italic bg-[#fbfaf6] p-3 rounded-xl border border-[#e8e5dc]">
                "{studio.outreachPitchAngle || 'Position as a multidisciplinary communication designer & creative producer who bridges high-level concept with physical execution.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 bg-white border-t border-[#ded9cb] flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {onDeleteStudio && (
              confirmDelete ? (
                <div className="flex items-center space-x-1.5 bg-[#fef2f2] border border-[#fca5a5] px-2.5 py-1 rounded-full animate-fade-in">
                  <span className="text-[11px] text-[#991b1b] font-medium">Delete candidate?</span>
                  <button
                    onClick={() => {
                      onDeleteStudio(studio.id);
                      onClose();
                    }}
                    className="text-[11px] font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] px-2 py-0.5 rounded"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-[11px] text-[#6b7280] hover:text-[#111827] px-1"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-[#94a3b8] hover:text-[#dc2626] p-2 rounded-full hover:bg-[#fef2f2] transition-colors"
                  title="Delete this candidate permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}

            {onUpdateStatus && (
              isDismissed ? (
                <button
                  onClick={() => onUpdateStatus(studio.id, 'discovered')}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0c2b21] bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#cbd5e1] transition-colors"
                  title="Restore candidate to active radar"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#334155]" />
                  <span>Restore</span>
                </button>
              ) : (
                <button
                  onClick={() => onUpdateStatus(studio.id, 'dismissed')}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#64748b] hover:text-[#0c2b21] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-colors"
                  title="Mark as Dismissed"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </button>
              )
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#5a7165] hover:text-[#0c2b21] hover:bg-[#f4f2ea] transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onDraftOutreach(studio)}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-full text-xs font-bold text-[#0c2b21] bg-[#d4f04c] hover:bg-[#c3e038] transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Generate Cold Pitch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
