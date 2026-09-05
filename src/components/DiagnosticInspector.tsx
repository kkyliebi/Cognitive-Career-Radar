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

  // Defensive normalizer to make frontend robust against API shape changes
  const safeNormalize = (data: any) => {
    if (!data) return data;
    const copy: any = Array.isArray(data) ? data : { ...data };

    // If array (discover-studios), normalize each item
    if (Array.isArray(copy)) {
      return copy.map((item: any) => safeNormalize(item));
    }

    copy.philosophyAlignment = copy.philosophyAlignment ?? {
      score: Number(copy.companyFitScore ?? copy.overallFitScore ?? 0),
      summary: copy.philosophyAlignment?.summary ?? copy.whyItFitsKylie ?? copy.corePhilosophy ?? ''
    };

    copy.decisionOwnershipLevel = copy.decisionOwnershipLevel ?? copy.decisionOwnership?.level ?? copy.decisionOwnership?.name ?? 'N/A';

    copy.overallFitScore = Number(copy.overallFitScore ?? copy.companyFitScore ?? 0);

    copy.cvTrackRecommendation = copy.cvTrackRecommendation ?? copy.recommendedCV ?? copy.recommendedCVTrack ?? 'Hybrid';

    copy.alignmentSignals = copy.alignmentSignals ?? copy.positiveSignals ?? [];

    copy.outreachTalkingPoints = copy.outreachTalkingPoints
      ?? (copy.coldOutreachAngle ? [copy.coldOutreachAngle] : (copy.outreachPitchAngle ? [copy.outreachPitchAngle] : (copy.outreachTalkingPointsRaw ?? [])));

    copy._raw = copy._raw ?? data;
    return copy;
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
      setReport(safeNormalize(data));
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
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${palette.eyebrowBgClass} ${palette.eyebrowTextClass} mb-3.5 shadow[...]`}>
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${palette.innerBoxBgClass} hover:bg-white/15 border ${palette.innerBoxBorderClass} text-white hover:${palette.headlineAcce[...`] , 