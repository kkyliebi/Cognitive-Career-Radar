export type EditorialTheme = 'petrol' | 'plum' | 'midnight' | 'emerald';

export type HiringStatus = 'active_role' | 'spontaneous_outreach' | 'talent_pool';

export type PriorityLevel = 'EXCEPTIONAL' | 'STRONG' | 'HIGH' | 'INVESTIGATE' | 'MEDIUM' | 'LOW' | 'REJECT' | 'UNKNOWN';

export type DecisionOwnershipLevel = 'EXECUTE' | 'COORDINATE' | 'TRANSLATE' | 'SHAPE' | 'DEFINE' | 'UNKNOWN' | string;

export type CVTrack = 'Creative / Design version' | 'Automotive / Brand Communication version' | 'Hybrid' | string;

export type PipelineStatus = 'discovered' | 'saved' | 'outreach_prepared' | 'contacted' | 'interviewing' | 'archived' | 'dismissed';

export interface CareerEngineActivation {
  // Kylie's 8-Step Career Engine
  understandDomain?: boolean; // Understand unfamiliar domain
  identifyRelationships?: boolean; // Identify relationships
  structureComplexity?: boolean; // Structure complexity
  createConceptsScenarios?: boolean; // Create concepts / scenarios
  translateArtefacts?: boolean; // Translate into artefacts
  facilitatePeople?: boolean; // Facilitate people
  designSystemsNarrative?: boolean; // Design interaction / narrative / systems
  coordinateImplementation?: boolean; // Coordinate implementation

  // Legacy / Shorthand keys for compatibility
  understand?: boolean;
  relationships?: boolean;
  structure?: boolean;
  concept?: boolean;
  translate?: boolean;
  facilitate?: boolean;
  design?: boolean;
  coordinate?: boolean;
  produce?: boolean;
  realise?: boolean;
  explanation?: string;
}

export const SEARCH_ECOSYSTEM_DOMAINS = [
  'All',
  'Human–AI Interaction, AI Experience, Agent Experience & AI Transformation',
  'Design Strategy, Systems Design & Complexity Structuring',
  'Narrative Systems, Speculative Scenarios & Worldbuilding',
  'Spatial Narrative, Exhibition and Immersive Experience',
  'Automotive and Luxury Brand Communication & Experience',
  'Creative Direction, Communication & Interdisciplinary Production',
] as const;

export type SearchEcosystemDomain = (typeof SEARCH_ECOSYSTEM_DOMAINS)[number] | string;

export interface StudioCandidate {
  id: string;
  name: string;
  website: string;
  location: string;
  country: string;
  ecosystem: string;
  hiringStatus: HiringStatus;
  activeRoles?: string[];
  companyFitScore: number;
  roleFitScore?: number;
  overallPriority: PriorityLevel;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'MEDIUM_HIGH' | string;
  decisionOwnershipExpected: DecisionOwnershipLevel;
  careerEngineStages: CareerEngineActivation;
  corePhilosophy: string;
  structuralStrengths: string[];
  potentialFrictions: string[];
  whyItFitsKylie: string;
  recommendedCVTrack: CVTrack;
  outreachPitchAngle: string;
  keyWorkExamples: string[];
  pipelineStatus: PipelineStatus;
  notes?: string;
  dateDiscovered: string;
}

export interface EvaluationReport {
  company: string;
  studioName?: string;
  role: string;
  location: string;
  hiringStatus: HiringStatus;
  
  // 18-Point Protocol Reconstruction
  actualRole: string;
  orgPosition: string;
  problemSolved: string;
  input: string;
  transformation: string;
  output: string;
  decisionOwnership: {
    level: number; // 0 to 4
    name: DecisionOwnershipLevel;
    evidence: string;
  };
  decisionOwnershipLevel?: DecisionOwnershipLevel;
  careerEngine: CareerEngineActivation;
  careerEngineMapping?: CareerEngineActivation;
  crossFunctionalRelationships: string[];
  positiveSignals: string[];
  alignmentSignals?: string[];
  negativeSignals: string[];
  unknowns: string[];
  companyFitScore: number;
  roleFitScore: number;
  overallFitScore?: number;
  priority: PriorityLevel;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  recommendedCV: CVTrack;
  cvTrackRecommendation?: CVTrack;
  recommendedPortfolioEmphasis: string[];
  coldOutreachAngle: string;
  outreachTalkingPoints?: string[];
  philosophyAlignment?: {
    score: number;
    summary: string;
  };
  ecosystemClassification?: string;
  sourceQuality?: string;
}

export interface SearchProbeParams {
  location: string;
  domain: string;
  customKeywords?: string;
  includeSpontaneous: boolean; // default true! Never filter out just because no opening
}

export type RecordCategory = 'application' | 'target' | 'outreach';

export type ApplicationStatus =
  | 'Applied'
  | 'Rejected'
  | 'Target — No Route'
  | 'Outreach Sent'
  | 'Auto-confirmation received'
  | 'Interviewing'
  | 'In Dialogue'
  | 'Offer'
  | 'Draft';

export const APPLICATION_CHANNEL_OPTIONS = [
  'Website',
  'Direct Email',
  'Website + Direct Email',
  'Social Media',
] as const;

export type ApplicationChannel = (typeof APPLICATION_CHANNEL_OPTIONS)[number] | string;

export interface ApplicationRecord {
  id: string; // e.g. APP-001, TGT-001, OUT-001
  category: RecordCategory;
  date: string;
  company: string;
  position: string;
  applicationLink: string;
  applicationChannels: string;
  cvVersion: string;
  status: ApplicationStatus;
  feedback: string;
  compensation?: string;
  lastUpdate: string;
  
  // Specific fields for Target List
  targetRoles?: string;
  milanOffice?: string;
  priority?: 'High' | 'Medium' | 'Low';
  reason?: string;
  nextStep?: string;

  // Specific fields for Direct Outreach
  targetAccount?: string;
  channel?: string;
  purpose?: string;
  messageType?: string;
  portfolioOffered?: boolean;
  notes?: string;
}
