import React from 'react';
import { EditorialTheme } from '../types';
import { EDITORIAL_PALETTES } from '../utils/theme';
import { BookOpen, AlertTriangle, Layers } from 'lucide-react';

interface DnaProtocolViewProps {
  editorialTheme?: EditorialTheme;
}

export const DnaProtocolView: React.FC<DnaProtocolViewProps> = ({
  editorialTheme = 'petrol',
}) => {
  const palette = EDITORIAL_PALETTES[editorialTheme] || EDITORIAL_PALETTES.petrol;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-[#0c2b21]">
      {/* Editorial Header Banner */}
      <div className={`${palette.bgClass} ${palette.textClass} rounded-3xl p-6 sm:p-8 border ${palette.borderClass} ${palette.glowClass} relative overflow-hidden shadow-md transition-colors`}>
        <div className={`absolute -right-8 -bottom-10 text-[120px] font-serif font-black ${palette.watermarkTextClass} select-none pointer-events-none`}>
          DNA
        </div>
        <div className="relative z-10">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${palette.eyebrowBgClass} ${palette.eyebrowTextClass} mb-3.5 shadow-xs`}>
            <BookOpen className={`w-3.5 h-3.5 ${palette.eyebrowTextClass}`} />
            <span>OPERATING PROTOCOL // GROUND TRUTH</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mb-2">
            Professional Operating System &amp; <span className={`font-editorial italic ${palette.headlineAccentClass}`}>Cognitive Architecture</span>
          </h2>
          <p className={`text-xs sm:text-sm ${palette.subtitleClass} max-w-2xl font-editorial italic text-[14px] leading-relaxed`}>
            The mathematical criteria that govern studio discovery, score computation, and JD deconstruction. Job titles are noisy conventions; cognitive translation, physical craft, and decision ownership are the ground truth · {palette.pdfSource}.
          </p>
        </div>
      </div>

      {/* Core Identity & The Career Engine */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded9cb] shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] block mb-2">
            SECTION 01 — CORE PROFESSIONAL IDENTITY
          </span>
          <blockquote className="text-2xl sm:text-3xl font-serif font-bold text-[#0c2b21] border-l-4 border-[#d4f04c] pl-4 py-1 tracking-tight">
            "A translator of possibilities."
          </blockquote>
          <p className="text-xs sm:text-sm text-[#244133] mt-3 font-editorial italic text-[14px] leading-relaxed">
            Discovering hidden relationships between abstract creative intention and rigorous technical feasibility, formulating underlying frameworks, and translating them into tangible experiences, physical artifacts, and spatial realities.
          </p>
        </div>

        {/* 7-Step Career Engine Continuum */}
        <div className="pt-6 border-t border-[#ede9df]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] block mb-3">
            SECTION 02 — THE 7-STEP CONTINUUM OF EXECUTION
          </span>
          <div className="bg-[#fbfaf6] p-4 sm:p-5 rounded-2xl border border-[#ded9cb] overflow-x-auto">
            <div className="flex items-center space-x-2 whitespace-nowrap text-xs font-bold uppercase tracking-wider">
              <span className="text-[#0c2b21] bg-[#d4f04c] px-3 py-1.5 rounded-xl border border-[#b2cf27] shadow-xs">01 Understand</span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#0c2b21] bg-[#d4f04c] px-3 py-1.5 rounded-xl border border-[#b2cf27] shadow-xs">02 Structure</span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#0c2b21] bg-[#d4f04c] px-3 py-1.5 rounded-xl border border-[#b2cf27] shadow-xs">03 Concept</span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#0c2b21] bg-[#9de6c7] px-3 py-1.5 rounded-xl border border-[#7ad4ab] shadow-xs">04 Translate</span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#557164] bg-[#f4f2ea] px-3 py-1.5 rounded-xl border border-[#ded9cb]">05 Coordinate</span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#557164] bg-[#f4f2ea] px-3 py-1.5 rounded-xl border border-[#ded9cb]">06 Produce</span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#0c2b21] bg-[#9ad3fa] px-3 py-1.5 rounded-xl border border-[#7ac2f5] shadow-xs">07 Realise</span>
            </div>
          </div>
          <p className="text-xs text-[#557164] mt-3 leading-relaxed font-medium">
            <strong className="text-[#0c2b21]">Highest-Value Core:</strong> Kylie achieves maximum organizational leverage when participating simultaneously in problem framing, conceptual architecture, cross-disciplinary translation, and rigorous physical realisation.
          </p>
        </div>

        {/* Decision Ownership Spectrum */}
        <div className="pt-6 border-t border-[#ede9df]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] block mb-3">
            SECTION 03 — DECISION OWNERSHIP SPECTRUM (LEVELS 0 TO 4)
          </span>
          <div className="space-y-3 text-xs">
            <div className="p-4 sm:p-5 bg-[#eefcf4] rounded-2xl border border-[#9de6c7] flex items-start justify-between gap-4">
              <div>
                <span className="font-serif font-bold text-base text-[#0c2b21]">Level 4 — DEFINE (Prime Priority Tier)</span>
                <p className="text-[#1a4435] mt-1 text-xs">Co-determines root problem formulation: "What is the genuine question we are answering?"</p>
              </div>
              <span className="text-[#0c2b21] bg-[#d4f04c] border border-[#b2cf27] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-xs">Target Priority #1</span>
            </div>

            <div className="p-4 sm:p-5 bg-[#eefcf4] rounded-2xl border border-[#9de6c7] flex items-start justify-between gap-4">
              <div>
                <span className="font-serif font-bold text-base text-[#0c2b21]">Level 3 — SHAPE (Very Strong Fit)</span>
                <p className="text-[#1a4435] mt-1 text-xs">Directly authors concepts, narrative structures, communication formats, or experiential logic.</p>
              </div>
              <span className="text-[#0c2b21] bg-[#9de6c7] border border-[#7ad4ab] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-xs">Target Priority #2</span>
            </div>

            <div className="p-4 sm:p-5 bg-[#fbfaf6] rounded-2xl border border-[#ded9cb] flex items-start justify-between gap-4">
              <div>
                <span className="font-serif font-bold text-base text-[#0c2b21]">Level 2 — TRANSLATE (Compatible Zone)</span>
                <p className="text-[#557164] mt-1 text-xs">Bridges high-level artistic vision with physical, technological, and fabrication realities.</p>
              </div>
              <span className="text-[#082d47] bg-[#e0f2fe] border border-[#9ad3fa] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Viable Target</span>
            </div>

            <div className="p-4 sm:p-5 bg-[#fbfaf6] rounded-2xl border border-[#ded9cb] flex items-start justify-between gap-4 opacity-80">
              <div>
                <span className="font-serif font-bold text-base text-[#557164]">Level 1 — COORDINATE (Boundary Friction Risk)</span>
                <p className="text-[#718d80] mt-1 text-xs">Chasing timelines, budgets, and vendors without influencing substance or craft.</p>
              </div>
              <span className="text-[#5a1b0f] bg-[#fff5f2] border border-[#fca590] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Friction Warning</span>
            </div>

            <div className="p-4 sm:p-5 bg-[#fff5f2] rounded-2xl border border-[#fca590] flex items-start justify-between gap-4 opacity-75">
              <div>
                <span className="font-serif font-bold text-base text-[#b02213]">Level 0 — DELIVER (Immediate Rejection)</span>
                <p className="text-[#5a1b0f] mt-1 text-xs">Mechanical production with zero latitude (banner resizing, repetitive copy adjustments).</p>
              </div>
              <span className="text-white bg-[#b02213] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-xs">Auto Downgrade</span>
            </div>
          </div>
        </div>

        {/* Hard Negatives Check */}
        <div className="pt-6 border-t border-[#ede9df]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#b02213] flex items-center mb-3">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            SECTION 04 — HARD NEGATIVE CONSTRAINTS (INSTANT REDUCTION)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 sm:p-5 bg-[#fff5f2] border border-[#fca590] rounded-2xl text-[#4a1208]">
              <span className="font-serif font-bold text-sm block mb-1 text-[#b02213]">Social Growth Calendars:</span>
              Daily Instagram/TikTok publishing grind, influencer logistics, and vanity engagement metrics.
            </div>
            <div className="p-4 sm:p-5 bg-[#fff5f2] border border-[#fca590] rounded-2xl text-[#4a1208]">
              <span className="font-serif font-bold text-sm block mb-1 text-[#b02213]">Mechanical Asset Adaptation:</span>
              Figma resizing across dozens of ad dimensions without strategic conceptual input.
            </div>
            <div className="p-4 sm:p-5 bg-[#fff5f2] border border-[#fca590] rounded-2xl text-[#4a1208]">
              <span className="font-serif font-bold text-sm block mb-1 text-[#b02213]">Administrative Chasing:</span>
              Managing client status spreadsheets as the primary deliverable without creative ownership.
            </div>
            <div className="p-4 sm:p-5 bg-[#fff5f2] border border-[#fca590] rounded-2xl text-[#4a1208]">
              <span className="font-serif font-bold text-sm block mb-1 text-[#b02213]">Superficial "Creativity":</span>
              Visual flair applied at the very end to decorate weak conceptual foundations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
