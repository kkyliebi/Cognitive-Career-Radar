import React from 'react';
import { StudioCandidate, EditorialTheme } from '../types';
import { EDITORIAL_PALETTES } from '../utils/theme';
import { X, ArrowUpRight, Send, CheckCircle, AlertTriangle } from 'lucide-react';

interface DossierModalProps {
  studio: StudioCandidate | null;
  onClose: () => void;
  onDraftOutreach: (studio: StudioCandidate) => void;
  editorialTheme?: EditorialTheme;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  studio,
  onClose,
  onDraftOutreach,
  editorialTheme = 'petrol',
}) => {
  if (!studio) return null;
  const palette = EDITORIAL_PALETTES[editorialTheme] || EDITORIAL_PALETTES.petrol;

  const engineSteps = [
    { key: 'understand', label: 'Understand' },
    { key: 'structure', label: 'Structure' },
    { key: 'concept', label: 'Concept' },
    { key: 'translate', label: 'Translate' },
    { key: 'coordinate', label: 'Coordinate' },
    { key: 'produce', label: 'Produce' },
    { key: 'realise', label: 'Realise' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#ded9cb] shadow-[0_25px_60px_rgba(12,43,33,0.25)] overflow-hidden my-8 text-[#0c2b21] animate-scale-in">
        {/* Editorial Dossier Header */}
        <div className={`${palette.bgClass} ${palette.textClass} p-6 sm:p-8 border-b ${palette.borderClass} relative overflow-hidden transition-colors`}>
          <div className={`absolute right-4 -bottom-6 text-[90px] font-serif font-black ${palette.watermarkTextClass} opacity-40 select-none pointer-events-none`}>
            {studio.companyFitScore}%
          </div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2.5 mb-3 flex-wrap gap-y-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${palette.eyebrowBgClass} ${palette.eyebrowTextClass} shadow-xs`}>
                  Strategic Fit {studio.companyFitScore}%
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${palette.innerBoxBgClass} text-white border ${palette.innerBoxBorderClass}`}>
                  Priority: {studio.overallPriority}
                </span>
                <span className={`text-xs ${palette.mutedClass} font-mono`}>
                  {studio.location}, {studio.country} · {palette.name}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center tracking-tight">
                {studio.name}
                <a
                  href={studio.website}
                  target="_blank"
                  rel="noreferrer"
                  className={`ml-2.5 ${palette.mutedClass} hover:${palette.headlineAccentClass} transition-colors`}
                  title="Visit Website"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </a>
              </h2>
              <p className={`text-xs ${palette.subtitleClass} mt-1 font-medium`}>
                Sector Ecosystem: <strong className="text-white">{studio.ecosystem}</strong>
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
              <ul className="mt-2.5 space-y-1 text-xs">
                {studio.activeRoles.map((role, idx) => (
                  <li key={idx} className="font-bold flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0c2b21]"></span>
                    <span>{role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Philosophy & Purpose */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#144434]">
              Studio Philosophy &amp; Implicit Problem Solved
            </h4>
            <div className="p-5 bg-white rounded-2xl border border-[#ded9cb] leading-relaxed text-[#203c2f] font-editorial text-[13px] italic shadow-xs">
              "{studio.corePhilosophy}"
            </div>
          </div>

          {/* Career Continuum */}
          <div className="space-y-2.5 bg-white p-5 rounded-2xl border border-[#ded9cb] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#527263]">
              <span className="font-bold uppercase tracking-wider text-[#0c2b21] text-[10px]">
                End-to-End Execution Continuum
              </span>
              <span className="text-[11px]">
                Decision Ownership: <strong className="text-[#0c2b21]">{studio.decisionOwnershipExpected}</strong>
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {engineSteps.map((step) => {
                const active = studio.careerEngineStages[step.key];
                return (
                  <div
                    key={step.key}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all ${
                      active
                        ? 'bg-[#d4f04c] text-[#0c2b21] shadow-xs border border-[#b2cf27]'
                        : 'bg-[#f4f2ea] text-[#718d80]'
                    }`}
                  >
                    {step.label}
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
                {studio.structuralStrengths.map((s, idx) => (
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
                {studio.potentialFrictions.map((f, idx) => (
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
                <span className="font-serif font-bold text-sm text-[#0c2b21] mt-0.5 block">{studio.recommendedCVTrack}</span>
              </div>
              <div>
                <span className="text-[#648274] block text-[10px] font-bold uppercase">Key Reference Artifacts:</span>
                <span className="text-[#203c2f] font-medium mt-0.5 block">{studio.keyWorkExamples.join(', ')}</span>
              </div>
            </div>
            <div>
              <span className="text-[#648274] block text-[10px] font-bold uppercase">Customized Outreach Angle:</span>
              <p className="text-[#203c2f] font-editorial italic text-xs bg-[#f8f7f2] p-3.5 rounded-xl border border-[#e8e5dc] mt-1.5">
                "{studio.outreachPitchAngle}"
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#f4f2ea] border-t border-[#ded9cb] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#0c2b21] hover:bg-[#e8e4d8] transition-colors"
          >
            Close Dossier
          </button>

          <button
            onClick={() => onDraftOutreach(studio)}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d4f04c] text-[#0c2b21] hover:bg-[#c2e038] transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate Targeted Pitch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
