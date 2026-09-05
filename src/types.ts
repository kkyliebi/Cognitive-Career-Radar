export type EditorialTheme = 'petrol' | 'plum' | 'midnight' | 'emerald';

export type HiringStatus = 'active_role' | 'spontaneous_outreach' | 'talent_pool';

export type PriorityLevel = 'EXCEPTIONAL' | 'STRONG' | 'INVESTIGATE' | 'LOW' | 'REJECT' | 'UNKNOWN';

export type DecisionOwnershipLevel = 'EXECUTE' | 'COORDINATE' | 'TRANSLATE' | 'SHAPE' | 'DEFINE' | 'UNKNOWN';

export type CVTrack = 'Creative / Design version' | 'Automotive / Brand Communication version' | 'Hybrid';

export type PipelineStatus = 'discovered' | 'saved' | 'outreach_prepared' | 'contacted' | 'interviewing' | 'archived';

export interface CareerEngineActivation {
  understand: boolean;
  structure: boolean;
  concept: boolean;
  translate: boolean;
  coordinate: boolean;
  produce: boolean;
  realise: boolean;
  explanation?: string;
}

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
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
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
  careerEngine: CareerEngineActivation;
  crossFunctionalRelationships: string[];
  positiveSignals: string[];
  negativeSignals: string[];
  unknowns: string[];
  companyFitScore: number;
  roleFitScore: number;
  priority: PriorityLevel;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  recommendedCV: CVTrack;
  recommendedPortfolioEmphasis: string[];
  coldOutreachAngle: string;
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
