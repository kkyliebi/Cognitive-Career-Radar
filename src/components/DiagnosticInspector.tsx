import React, { useState } from 'react';
import { EvaluationReport, StudioCandidate, ApplicationRecord, EditorialTheme } from '../types';
import { EDITORIAL_PALETTES } from '../utils/theme';
import { Zap, Loader2, CheckCircle, AlertTriangle, BookmarkPlus, Sparkles, Copy, Check, Database, Globe } from 'lucide-react';
import { TeVuMeter } from './TeWidgets';

interface DiagnosticInspectorProps {
  onSaveAsCandidate: (candidate: StudioCandidate) => void;
  onDraftOutreach: (studio: StudioCandidate) => void;
  onSaveToRecords?: (record: ApplicationRecord) => void;
  editorialTheme?: EditorialTheme;
}

export const DiagnosticInspector: React.FC<DiagnosticInspectorProps> = ({
  onSaveAsCandidate,
  onDraftOutreach,
  onSaveToRecords,
  editorialTheme = 'petrol',
}) => {
  const palette = EDITORIAL_PALETTES[editorialTheme] || EDITORIAL_PALETTES.petrol;
  const [targetName, setTargetName] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  const presets = [
    {
      label: 'Calibration: Cheil Event Producer',
      name: 'Cheil Worldwide',
      url: 'https://cheil.com',
      text: `Role: Event Producer
Location: Milan, Italy
Key Responsibilities:
- Partner closely with Creative and Strategy leads on major automotive experiential campaigns.
- Receive creative concepts, 3D renderings, and design proposals; evaluate production feasibility, spatial logistics, and technical execution.
- Source and manage specialized fabricators, LED technology vendors, sound designers, and interactive lighting suppliers.
- Oversee budget allocation, construction timelines, and on-site build quality during Milan Design Week and automotive product reveals.
- Protect the integrity and visual coherence of the creative concept while resolving rigorous physical and engineering constraints on site.
Requirements: Strong visual sensibility, deep knowledge of experiential materials, ability to mediate between visionary creative directors and technical engineers.`
    },
    {
      label: 'Sample: Milan Luxury Restomod Lead',
      name: 'Boutique Coachbuilder / Art Direction Studio',
      url: 'https://milan-studio.example',
      text: `Role: Creative Communication Producer & Narrative Lead
Location: Milan, Italy
We build one-off hyper-luxury restomods and bespoke mobility machines.
What you'll do:
- Reframe how modern collectors perceive high-craft mechanical artistry and speculative mobility futures.
- Lead multi-touchpoint communication systems: from editorial books documenting the car's carbon chassis to launch films, physical gallery reveals, and bespoke client delivery rituals.
- Work directly with founders, automotive exterior designers, and physical coachbuilders.
- Turn complex engineering milestones into compelling narrative stories across print, film, and spatial experiences.`
    },
    {
      label: 'Trap Role (Social/Digital Negative)',
      name: 'Digital Growth Agency',
      url: 'https://growth-trap.example',
      text: `Role: Creative Content & Brand Strategist
Location: Remote / Milan
Responsibilities:
- Plan and manage daily social media publishing calendars across Instagram, TikTok, LinkedIn.
- Coordinate micro-influencer gifting and report weekly engagement rate KPIs.
- Resize banner ads and adapt static Figma assets across 12 digital formats.
- Assist account executives with weekly client status presentations and chase stakeholder approvals.
- Optimize paid social conversions and SEO landing page copy.`
    }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setTargetName(preset.name);
    setUrl(preset.url);
    setContent(preset.text);
    setReport(null);
    setError(null);
  };

  const handleRunEvaluation = async () => {
    if (!content.trim() && !url.trim()) {
      setError('Please provide a JD text, studio description, or a live website URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSavedSuccessMsg(null);

    try {
      const response = await fetch('/api/evaluate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetName: targetName.trim() || undefined,
          url: url.trim() || undefined,
          content: content.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Diagnostic evaluation failed.');
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete cognitive evaluation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToCandidatePool = () => {
    if (!report) return;

    const newCandidate: StudioCandidate = {
      id: `diag-${Date.now()}`,
      name: targetName.trim() || report.studioName || 'Diagnostic Studio Candidate',
      location: 'Europe',
      country: 'EU / Italy',
      website: url.trim() || 'https://',
      ecosystem: report.ecosystemClassification,
      companyFitScore: report.overallFitScore,
      hiringStatus: report.hiringStatus || 'spontaneous_outreach',
      activeRoles: content.includes('Role:') ? [content.split('\n')[0].replace('Role:', '').trim()] : undefined,
      careerEngineStages: report.careerEngineMapping,
      decisionOwnershipExpected: report.decisionOwnershipLevel,
      corePhilosophy: report.philosophyAlignment.summary,
      structuralStrengths: report.alignmentSignals || ['Cognitive translation alignment'],
      potentialFrictions: report.negativeSignals || [],
      whyItFitsKylie: report.philosophyAlignment.summary,
      recommendedCVTrack: report.cvTrackRecommendation,
      outreachPitchAngle: report.outreachTalkingPoints[0] || 'Focus on shared philosophy and cognitive translation',
      keyWorkExamples: ['Brand Strategy & Narrative Systems', 'Exhibition & Material Production'],
      confidence: report.overallFitScore >= 80 ? 'HIGH' : report.overallFitScore >= 60 ? 'MEDIUM' : 'LOW',
      overallPriority: report.overallFitScore >= 85 ? 'EXCEPTIONAL' : report.overallFitScore >= 70 ? 'STRONG' : 'INVESTIGATE',
      pipelineStatus: 'discovered',
      dateDiscovered: new Date().toISOString().split('T')[0],
    };

    onSaveAsCandidate(newCandidate);
    setSavedSuccessMsg(`Added "${newCandidate.name}" to Radar Explorer candidates.`);
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#0c2b21]">
      {/* Editorial Diagnostic Header */}
      <div className={`${palette.bgClass} ${palette.textClass} rounded-3xl p-6 sm:p-8 border ${palette.borderClass} ${palette.glowClass} relative overflow-hidden shadow-md transition-colors`}>
        <div className={`absolute -right-8 -bottom-10 text-[110px] font-serif font-black ${palette.watermarkTextClass} select-none pointer-events-none`}>
          SANDBOX
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${palette.eyebrowBgClass} ${palette.eyebrowTextClass} mb-3.5 shadow-xs`}>
            <Zap className={`w-3.5 h-3.5 ${palette.eyebrowTextClass}`} />
            <span>18-POINT COGNITIVE FILTER SANDBOX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mb-2">
            Diagnostic Sandbox &amp; <span className={`font-editorial italic ${palette.headlineAccentClass}`}>Alignment Analyzer</span>
          </h2>
          <p className={`text-xs sm:text-sm ${palette.subtitleClass} font-editorial italic text-[14px] leading-relaxed`}>
            Deconstruct any job description or studio domain directly against Kylie's 18-point cognitive DNA.
            Evaluates genuine structural fit, filters out operational traps, and generates tailored outreach strategy · {palette.pdfSource}.
          </p>
        </div>

        {/* Editorial Preset Chips */}
        <div className={`relative z-10 mt-6 pt-5 border-t ${palette.borderClass}`}>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${palette.mutedClass} block mb-2.5`}>
            CALIBRATION PROTOCOLS:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${palette.innerBoxBgClass} hover:bg-white/15 border ${palette.innerBoxBorderClass} text-white hover:${palette.headlineAccentClass} transition-all font-mono`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className={`relative z-10 mt-6 space-y-4 pt-5 border-t ${palette.borderClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-mono font-bold uppercase tracking-wider ${palette.mutedClass} mb-1.5`}>
                Studio / Entity Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Balich Wonder Studio, Random Studio"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className={`w-full ${palette.innerBoxBgClass} border ${palette.innerBoxBorderClass} text-white placeholder-white/40 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-white/30 focus:outline-none transition-all`}
              />
            </div>

            <div>
              <label className={`block text-xs font-mono font-bold uppercase tracking-wider ${palette.mutedClass} mb-1.5 flex items-center justify-between`}>
                <span>Studio Domain URL (Live Autonomous Scrape)</span>
                <span className={`text-[10px] ${palette.headlineAccentClass} font-normal flex items-center normal-case`}>
                  <Globe className="w-3 h-3 mr-1" />
                  URL-Only Supported
                </span>
              </label>
              <input
                type="text"
                placeholder="https://studio-domain.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`w-full ${palette.innerBoxBgClass} border ${palette.innerBoxBorderClass} text-white placeholder-white/40 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-white/30 focus:outline-none transition-all`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-mono font-bold uppercase tracking-wider ${palette.mutedClass} mb-1.5 flex items-center justify-between`}>
              <span>Job Description / Studio About Dossier Copy</span>
              <span className={`text-[10px] ${palette.mutedClass} font-normal normal-case`}>Leave empty to crawl URL autonomously</span>
            </label>
            <textarea
              rows={5}
              placeholder="Paste job description or studio background text here, or leave empty if a valid URL is provided above..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full ${palette.innerBoxBgClass} border ${palette.innerBoxBorderClass} text-white placeholder-white/40 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-white/30 focus:outline-none transition-all font-mono`}
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className={`text-xs ${palette.mutedClass} flex items-center space-x-2 font-mono`}>
              <span className={`w-2 h-2 rounded-full ${palette.dotColor} animate-pulse`} />
              <span>Full 18-Point Cognitive Architecture Spec Active</span>
            </div>

            <button
              onClick={handleRunEvaluation}
              disabled={isLoading || (!content.trim() && !url.trim())}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider ${palette.buttonBgClass} ${palette.buttonTextClass} ${palette.buttonHoverBgClass} active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md`}
            >
              {isLoading ? (
                <>
                  <Loader2 className={`w-4 h-4 animate-spin ${palette.buttonTextClass}`} />
                  <span>Evaluating Against 18 Points...</span>
                </>
              ) : (
                <>
                  <Zap className={`w-4 h-4 ${palette.buttonTextClass}`} />
                  <span>Execute Diagnostic</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-[#fff5f2] border border-[#fca590] text-[#5a1b0f] text-xs rounded-2xl flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#b02213]" />
              <span>{error}</span>
            </div>
          )}

          {savedSuccessMsg && (
            <div className="p-4 bg-[#eefcf4] border border-[#9de6c7] text-[#0c2b21] text-xs rounded-2xl flex items-center justify-between shadow-xs">
              <span className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-[#1a7f5a]" />
                <span className="font-semibold">{savedSuccessMsg}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Report Dossier Presentation */}
      {report && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ded9cb] shadow-xs space-y-6">
          {/* Header Metric Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#ede9df] pb-5">
            <div>
              <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d4f04c] text-[#0c2b21] border border-[#b2cf27] shadow-xs font-mono">
                  Fit Score {report.overallFitScore}%
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f4f2ea] text-[#0c2b21] border border-[#ded9cb]">
                  {report.ecosystemClassification}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#9de6c7] text-[#0c2b21] border border-[#7ad4ab]">
                  Track: {report.cvTrackRecommendation}
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#0c2b21]">
                {targetName || report.studioName || 'Diagnostic Evaluation Dossier'}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveToCandidatePool}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0c2b21] text-white hover:bg-[#18523f] transition-all shadow-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[#d4f04c]" />
                <span>Save to Radar Candidates</span>
              </button>
            </div>
          </div>

          {/* 3-Column Diagnostic Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Philosophy Alignment */}
            <div className="bg-[#fbfaf6] p-5 rounded-2xl border border-[#ded9cb] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#0c2b21]">Philosophy Fit</span>
                <span className="text-xs font-bold font-mono text-[#0c2b21] bg-[#d4f04c] px-2 py-0.5 rounded-md">{report.philosophyAlignment.score}%</span>
              </div>
              <p className="text-xs text-[#557164] font-medium leading-relaxed">
                {report.philosophyAlignment.summary}
              </p>
            </div>

            {/* Decision Ownership */}
            <div className="bg-[#fbfaf6] p-5 rounded-2xl border border-[#ded9cb] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#0c2b21]">Decision Ownership</span>
                <span className="text-xs font-bold font-mono text-[#0c2b21] bg-[#9de6c7] px-2 py-0.5 rounded-md">{report.decisionOwnershipLevel}</span>
              </div>
              <p className="text-xs text-[#557164] font-medium leading-relaxed">
                Expected authority over conceptual core, material logic, and narrative integrity.
              </p>
            </div>

            {/* Outreach Readiness */}
            <div className="bg-[#fbfaf6] p-5 rounded-2xl border border-[#ded9cb] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#0c2b21]">Outreach Approach</span>
                <span className="text-xs font-bold font-mono text-[#0c2b21] bg-[#9ad3fa] px-2 py-0.5 rounded-md">
                  {report.hiringStatus === 'active_role' ? 'Active App' : 'Spontaneous Pitch'}
                </span>
              </div>
              <p className="text-xs text-[#557164] font-medium leading-relaxed">
                Strategic focus: Studio philosophy resonance outranks cold public job boards.
              </p>
            </div>
          </div>

          {/* Positive Alignment Signals */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1a7f5a] flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Positive Alignment Signals
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {report.alignmentSignals.map((sig, idx) => (
                <div key={idx} className="p-3.5 bg-[#eefcf4] border border-[#9de6c7] rounded-xl text-[#0c2b21] font-medium flex items-start space-x-2">
                  <span className="text-[#1a7f5a] font-bold">•</span>
                  <span>{sig}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Negative & Warning Signals if any */}
          {report.negativeSignals && report.negativeSignals.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#b02213] flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Negative / Operational Trap Signals
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {report.negativeSignals.map((sig, idx) => (
                  <div key={idx} className="p-3.5 bg-[#fff5f2] border border-[#fca590] text-[#5a1b0f] font-medium rounded-xl flex items-start space-x-2">
                    <span className="text-[#b02213] font-bold">•</span>
                    <span>{sig}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic Talking Points */}
          <div className="space-y-2.5 pt-4 border-t border-[#ede9df]">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0c2b21] flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#d4f04c]" />
              Tailored Outreach Talking Points
            </h4>
            <ul className="space-y-2.5 text-xs text-[#334e40]">
              {report.outreachTalkingPoints.map((tp, idx) => (
                <li key={idx} className="p-3.5 bg-[#fbfaf6] border border-[#ded9cb] rounded-xl flex items-start space-x-2.5">
                  <span className="text-[#0c2b21] font-bold font-mono bg-[#f4f2ea] w-5 h-5 flex items-center justify-center rounded-full text-[10px] flex-shrink-0 mt-0.5 border border-[#ded9cb]">{idx + 1}</span>
                  <span className="font-editorial text-[13px]">{tp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
