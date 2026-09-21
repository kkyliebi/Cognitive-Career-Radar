import React from 'react';
import { EditorialTheme } from '../types';
import { EDITORIAL_PALETTES } from '../utils/theme';
import { BookOpen, AlertTriangle, Layers, Target, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

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

        {/* 8-Step Career Engine Continuum */}
        <div className="pt-6 border-t border-[#ede9df]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] block">
              SECTION 02 — THE 8-STEP CONTINUUM OF THE CAREER ENGINE
            </span>
            <span className="text-[10px] font-bold text-[#0c2b21] bg-[#d4f04c] px-2.5 py-0.5 rounded-full border border-[#b2cf27]">
              8 Active Phases
            </span>
          </div>
          
          {/* Visual Step Flow */}
          <div className="bg-[#fbfaf6] p-4 sm:p-5 rounded-2xl border border-[#ded9cb] overflow-x-auto">
            <div className="flex items-center space-x-2 whitespace-nowrap text-xs font-bold tracking-tight">
              <span className="text-[#0c2b21] bg-[#d4f04c] px-3 py-1.5 rounded-xl border border-[#b2cf27] shadow-xs">
                01 Understand Unfamiliar Domain
              </span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#0c2b21] bg-[#d4f04c] px-3 py-1.5 rounded-xl border border-[#b2cf27] shadow-xs">
                02 Identify Relationships
              </span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#0c2b21] bg-[#d4f04c] px-3 py-1.5 rounded-xl border border-[#b2cf27] shadow-xs">
                03 Structure Complexity
              </span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#0c2b21] bg-[#9de6c7] px-3 py-1.5 rounded-xl border border-[#7ad4ab] shadow-xs">
                04 Create Concepts / Scenarios
              </span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#0c2b21] bg-[#9de6c7] px-3 py-1.5 rounded-xl border border-[#7ad4ab] shadow-xs">
                05 Translate into Artefacts
              </span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#0c2b21] bg-[#9ad3fa] px-3 py-1.5 rounded-xl border border-[#7ac2f5] shadow-xs">
                06 Facilitate People
              </span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#0c2b21] bg-[#9ad3fa] px-3 py-1.5 rounded-xl border border-[#7ac2f5] shadow-xs">
                07 Design Interaction / Narrative / Systems
              </span>
              <span className="text-[#718d80]">→</span>
              <span className="text-[#557164] bg-[#f4f2ea] px-3 py-1.5 rounded-xl border border-[#ded9cb]">
                08 Coordinate Implementation
              </span>
            </div>
          </div>

          {/* 8-Step Grid Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mt-3 text-xs">
            <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e4e0d5]">
              <span className="text-[10px] font-mono font-bold text-[#456154] block mb-0.5">PHASE 01 & 02</span>
              <span className="font-serif font-bold text-[#0c2b21] block">Deconstruct & Connect</span>
              <p className="text-[11px] text-[#557164] mt-1 leading-snug">Rapidly comprehend alien domains, identify invisible linkages between tech, human, and business constraints.</p>
            </div>
            <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e4e0d5]">
              <span className="text-[10px] font-mono font-bold text-[#456154] block mb-0.5">PHASE 03 & 04</span>
              <span className="font-serif font-bold text-[#0c2b21] block">Structure & Scenario</span>
              <p className="text-[11px] text-[#557164] mt-1 leading-snug">Transform ambiguous complexity into clear strategic frameworks, future scenarios, and actionable concepts.</p>
            </div>
            <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e4e0d5]">
              <span className="text-[10px] font-mono font-bold text-[#456154] block mb-0.5">PHASE 05 & 06</span>
              <span className="font-serif font-bold text-[#0c2b21] block">Artefact & Facilitate</span>
              <p className="text-[11px] text-[#557164] mt-1 leading-snug">Materialize abstract thinking into tangible artefacts, while aligning cross-disciplinary stakeholders and partners.</p>
            </div>
            <div className="p-3 bg-[#f8f7f2] rounded-xl border border-[#e4e0d5]">
              <span className="text-[10px] font-mono font-bold text-[#456154] block mb-0.5">PHASE 07 & 08</span>
              <span className="font-serif font-bold text-[#0c2b21] block">Systems & Delivery</span>
              <p className="text-[11px] text-[#557164] mt-1 leading-snug">Author systemic interaction, narrative coherence, and ensure rigorous execution down to final realisation.</p>
            </div>
          </div>

          <p className="text-xs text-[#557164] mt-3 leading-relaxed font-medium">
            <strong className="text-[#0c2b21]">High-Leverage Synergy:</strong> Kylie thrives where cognitive complexity, strategic narrative, human facilitation, and high-fidelity artefact creation converge.
          </p>
        </div>

        {/* Expanded Search Universe */}
        <div className="pt-6 border-t border-[#ede9df]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] block">
              SECTION 03 — EXPANDED SEARCH UNIVERSE & TARGET ECOSYSTEMS
            </span>
            <span className="text-[10px] font-bold text-[#0369a1] bg-[#e0f2fe] px-2.5 py-0.5 rounded-full border border-[#bae6fd]">
              Ecosystem Map
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl">
              <span className="font-serif font-bold text-sm text-[#0369a1] block mb-1">
                Human–AI Interaction &amp; AI Transformation
              </span>
              <p className="text-[#0c4a6e] text-[11px] leading-relaxed">
                Agent Experience (AX), Generative &amp; Adaptive UI, Human–AI Co-creation, Cognitive Interfaces, Multi-agent workflow systems, and organizational AI transformation.
              </p>
            </div>

            <div className="p-4 bg-[#fbfaf6] border border-[#ded9cb] rounded-2xl">
              <span className="font-serif font-bold text-sm text-[#0c2b21] block mb-1">
                Design Strategy &amp; Systems Design
              </span>
              <p className="text-[#3b5448] text-[11px] leading-relaxed">
                Structuring organizational &amp; product complexity, service architectures, cross-domain ecosystem strategy, and frameworks that bridge design and technical execution.
              </p>
            </div>

            <div className="p-4 bg-[#fbfaf6] border border-[#ded9cb] rounded-2xl">
              <span className="font-serif font-bold text-sm text-[#0c2b21] block mb-1">
                Narrative Systems &amp; Speculative Scenarios
              </span>
              <p className="text-[#3b5448] text-[11px] leading-relaxed">
                Future forecasting, speculative worldbuilding, strategic foresight, tangible future artefacts, and interactive storytelling frameworks.
              </p>
            </div>

            <div className="p-4 bg-[#fbfaf6] border border-[#ded9cb] rounded-2xl">
              <span className="font-serif font-bold text-sm text-[#0c2b21] block mb-1">
                Spatial Narrative, Exhibition &amp; Immersive
              </span>
              <p className="text-[#3b5448] text-[11px] leading-relaxed">
                Physical/digital hybrid environments, brand pavilions, museum &amp; gallery scenography, interactive spatial computing, and sensory interfaces.
              </p>
            </div>

            <div className="p-4 bg-[#fbfaf6] border border-[#ded9cb] rounded-2xl">
              <span className="font-serif font-bold text-sm text-[#0c2b21] block mb-1">
                Automotive &amp; Luxury Brand Experience
              </span>
              <p className="text-[#3b5448] text-[11px] leading-relaxed">
                Integrated brand communication, high-craft restomod &amp; industrial identity, coachbuilding narratives, and premium mobility experiences (e.g. Audi, Amos).
              </p>
            </div>

            <div className="p-4 bg-[#fbfaf6] border border-[#ded9cb] rounded-2xl">
              <span className="font-serif font-bold text-sm text-[#0c2b21] block mb-1">
                Creative Direction &amp; Interdisciplinary Production
              </span>
              <p className="text-[#3b5448] text-[11px] leading-relaxed">
                Multidisciplinary studio leadership, concept-to-fabrication translation, artisanal craft execution, and collaborative facilitation.
              </p>
            </div>
          </div>
        </div>

        {/* Decision Ownership Spectrum */}
        <div className="pt-6 border-t border-[#ede9df]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] block mb-3">
            SECTION 04 — DECISION OWNERSHIP SPECTRUM (LEVELS 0 TO 4)
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
            SECTION 05 — HARD NEGATIVE CONSTRAINTS (INSTANT REDUCTION)
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

        {/* Section 06: 18-Point Protocol Rubric & Scoring */}
        <div className="pt-6 border-t border-[#ede9df]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] flex items-center">
              <Target className="w-3.5 h-3.5 mr-1.5 text-[#0c2b21]" />
              SECTION 06 — THE 18-POINT EVALUATION RUBRIC &amp; GROUND TRUTH SCORING
            </span>
            <span className="text-[10px] font-bold text-[#0c2b21] bg-[#d4f04c] px-2.5 py-0.5 rounded-full border border-[#b2cf27]">
              18 Inspection Points
            </span>
          </div>
          <p className="text-xs text-[#557164] mb-4 font-editorial italic">
            The multi-dimensional diagnostic matrix executed whenever evaluating candidate studios, spontaneous outreach angles, or incoming opportunity briefs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Cluster 1: Structural Position */}
            <div className="p-4 bg-[#fbfaf6] border border-[#ded9cb] rounded-2xl space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] block">
                Cluster I · Structural Positioning
              </span>
              <ul className="space-y-1.5 text-[#244133] text-[11px]">
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">01.</span>
                  <span><strong>Actual Role:</strong> Deconstructed underlying function beyond title convention.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">02.</span>
                  <span><strong>Organizational Position:</strong> Proximity to executive decision-makers and founders.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">03.</span>
                  <span><strong>Problem Solved:</strong> Strategic tension addressed (complexity vs. delivery).</span>
                </li>
              </ul>
            </div>

            {/* Cluster 2: Value Transformation */}
            <div className="p-4 bg-[#fbfaf6] border border-[#ded9cb] rounded-2xl space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] block">
                Cluster II · Cognitive Value Stream
              </span>
              <ul className="space-y-1.5 text-[#244133] text-[11px]">
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">04.</span>
                  <span><strong>Input:</strong> Abstract briefs, raw engineering data, or cultural intention.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">05.</span>
                  <span><strong>Transformation:</strong> Cognitive framing, translation, and systems structuring.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">06.</span>
                  <span><strong>Output:</strong> High-craft tangible artefacts, spatial realities, and narrative frameworks.</span>
                </li>
              </ul>
            </div>

            {/* Cluster 3: Autonomy & Engine */}
            <div className="p-4 bg-[#fbfaf6] border border-[#ded9cb] rounded-2xl space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] block">
                Cluster III · Autonomy &amp; Career Engine
              </span>
              <ul className="space-y-1.5 text-[#244133] text-[11px]">
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">07.</span>
                  <span><strong>Decision Ownership:</strong> Calibration on Level 0 to Level 4 spectrum.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">08.</span>
                  <span><strong>8-Step Engine Fit:</strong> Mapping across Kylie's active career phases.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">09.</span>
                  <span><strong>Cross-Functional Bridge:</strong> Design, engineering, strategy, and business alignment.</span>
                </li>
              </ul>
            </div>

            {/* Cluster 4: Calibration & Pitch */}
            <div className="p-4 bg-[#fbfaf6] border border-[#ded9cb] rounded-2xl space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#648274] block">
                Cluster IV · Calibration &amp; Action
              </span>
              <ul className="space-y-1.5 text-[#244133] text-[11px]">
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">10–12.</span>
                  <span><strong>Signals &amp; Unknowns:</strong> Positive alignments, friction traps, and critical unknowns.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">13–16.</span>
                  <span><strong>Scoring &amp; Priority:</strong> Studio fit (0-100), role fit (0-100), ranking tier &amp; confidence.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="font-mono font-bold text-[#0c2b21]">17–18.</span>
                  <span><strong>Action &amp; Outreach:</strong> Recommended CV track, portfolio emphasis, and pitch angle.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
