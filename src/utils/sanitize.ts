import { StudioCandidate } from '../types';

export function sanitizeStudio(raw: any, fallbackId?: string): StudioCandidate {
  if (!raw || typeof raw !== 'object') {
    return {
      id: fallbackId || `studio-${Date.now()}`,
      name: 'Unknown Studio',
      website: 'https://',
      location: 'Milan',
      country: 'Italy',
      ecosystem: 'Creative & Brand Communication',
      hiringStatus: 'spontaneous_outreach',
      activeRoles: [],
      companyFitScore: 88,
      overallPriority: 'STRONG',
      confidence: 'HIGH',
      decisionOwnershipExpected: 'SHAPE',
      careerEngineStages: {
        understand: true,
        structure: true,
        concept: true,
        translate: true,
        coordinate: true,
        produce: true,
        realise: true,
        explanation: 'Activates strategic realization engine.',
      },
      corePhilosophy: 'Interdisciplinary design and communication practice.',
      structuralStrengths: ['Integrated creative direction'],
      potentialFrictions: [],
      whyItFitsKylie: 'Resonates with multidisciplinary design translation.',
      recommendedCVTrack: 'Creative / Design version',
      outreachPitchAngle: 'Propose multidisciplinary collaboration on upcoming brand initiatives.',
      keyWorkExamples: [],
      pipelineStatus: 'discovered',
      dateDiscovered: new Date().toISOString().split('T')[0],
    };
  }

  const name = String(raw.name || raw.studioName || raw.company || 'Unnamed Studio').trim();
  const fitScore = Number(raw.companyFitScore ?? raw.overallFitScore ?? raw.companyFit ?? 88);

  const engine = raw.careerEngineStages || raw.careerEngine || raw.careerEngineMapping || {};
  const safeEngine = {
    understand: Boolean(engine.understand ?? true),
    structure: Boolean(engine.structure ?? true),
    concept: Boolean(engine.concept ?? true),
    translate: Boolean(engine.translate ?? true),
    coordinate: Boolean(engine.coordinate ?? true),
    produce: Boolean(engine.produce ?? true),
    realise: Boolean(engine.realise ?? true),
    explanation: String(engine.explanation || 'Activates strategic realization engine.'),
  };

  return {
    id: String(raw.id || fallbackId || `studio-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
    name,
    website: String(raw.website || 'https://'),
    location: String(raw.location || 'Milan'),
    country: String(raw.country || 'Italy'),
    ecosystem: String(raw.ecosystem || raw.ecosystemClassification || 'Independent Creative Studio'),
    hiringStatus: raw.hiringStatus === 'active_role' ? 'active_role' : raw.hiringStatus === 'talent_pool' ? 'talent_pool' : 'spontaneous_outreach',
    activeRoles: Array.isArray(raw.activeRoles) ? raw.activeRoles.map(String) : [],
    companyFitScore: isNaN(fitScore) ? 88 : fitScore,
    roleFitScore: Number(raw.roleFitScore ?? fitScore),
    overallPriority: raw.overallPriority || (fitScore >= 90 ? 'EXCEPTIONAL' : fitScore >= 80 ? 'STRONG' : 'INVESTIGATE'),
    confidence: raw.confidence || (fitScore >= 85 ? 'HIGH' : 'MEDIUM'),
    decisionOwnershipExpected: raw.decisionOwnershipExpected || raw.decisionOwnershipLevel || (raw.decisionOwnership?.name) || 'SHAPE',
    careerEngineStages: safeEngine,
    corePhilosophy: String(raw.corePhilosophy || raw.problemSolved || raw.actualRole || 'Interdisciplinary design and communication practice.'),
    structuralStrengths: Array.isArray(raw.structuralStrengths) && raw.structuralStrengths.length > 0 ? raw.structuralStrengths.map(String) : ['High design autonomy'],
    potentialFrictions: Array.isArray(raw.potentialFrictions) ? raw.potentialFrictions.map(String) : [],
    whyItFitsKylie: String(raw.whyItFitsKylie || raw.corePhilosophy || 'Strong resonance with Kylie\'s multidisciplinary background.'),
    recommendedCVTrack: raw.recommendedCVTrack || raw.recommendedCV || raw.cvTrackRecommendation || 'Creative / Design version',
    outreachPitchAngle: String(raw.outreachPitchAngle || raw.coldOutreachAngle || 'Propose multidisciplinary collaboration on upcoming initiatives.'),
    keyWorkExamples: Array.isArray(raw.keyWorkExamples) ? raw.keyWorkExamples.map(String) : [],
    pipelineStatus: raw.pipelineStatus || 'discovered',
    notes: raw.notes ? String(raw.notes) : undefined,
    dateDiscovered: String(raw.dateDiscovered || new Date().toISOString().split('T')[0]),
  };
}

export function sanitizeStudios(rawList: any[]): StudioCandidate[] {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .filter((item) => item !== null && typeof item === 'object')
    .map((item, idx) => sanitizeStudio(item, `studio-${idx}`));
}
