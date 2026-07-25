/**
 * JobPilot AI Types & Interfaces
 */

export type RemoteType = 'remote' | 'hybrid' | 'onsite' | 'unspecified';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary' | 'unspecified';

export interface StructuredJob {
  externalId: string;
  title: string;
  company: string;
  location: string;
  country: string;
  remoteType: RemoteType;
  employmentType: EmploymentType;
  salaryMinimum: number | null;
  salaryMaximum: number | null;
  salaryCurrency: string | null;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  requiredEducation: string[];
  requiredExperienceYears: number | null;
  workAuthorisation: string | null;
  applicationDeadline: string | null; // ISO date
  sourceName: string;
  sourceUrl: string;
  applicationUrl: string;
  datePosted: string | null; // ISO date
  dateDiscovered: string; // ISO timestamp
  possibleScam: boolean;
  scamReasons: string[];
  fingerprint?: string;
  isDemo?: boolean;
}

export interface EmploymentHistoryItem {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string; // 'Present' or ISO
  isVerified: boolean;
  achievements: string[];
  technologies: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: number;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  credentialId?: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  countryOfResidence: string;
  preferredJobTitles: string[];
  preferredCountries: string[];
  remotePreference: RemoteType;
  minimumAcceptableSalary: number;
  salaryCurrency: string;
  preferredIndustries: string[];
  employmentType: EmploymentType;
  skills: string[];
  education: EducationItem[];
  certifications: CertificationItem[];
  verifiedEmploymentHistory: EmploymentHistoryItem[];
  workAuthorisationInfo: string;
  excludedRolesAndIndustries: string[];
  updatedAt: string;
}

export interface CVDocument {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'text';
  isMaster: boolean;
  rawText: string;
  extractedSkills: string[];
  extractedSummary: string;
  createdAt: string;
}

export interface ScoreBreakdown {
  requiredSkillsScore: number; // Max 35
  experienceScore: number;     // Max 20
  educationScore: number;      // Max 15
  locationRemoteScore: number; // Max 10
  salaryScore: number;         // Max 10
  industryRoleScore: number;   // Max 10
  disqualificationPenalties: number;
}

export type RecommendationLevel = 'Strongly Recommended' | 'Recommended with Caveats' | 'Not Recommended';

export interface JobMatchResult {
  id: string;
  userId: string;
  jobId: string;
  totalScore: number; // 0 to 100
  breakdown: ScoreBreakdown;
  strongMatches: string[];
  partialMatches: string[];
  missingRequirements: string[];
  disqualifyingRequirements: string[];
  recommendation: RecommendationLevel;
  explanation: string;
  calculatedAt: string;
}

export interface ClaimEvidence {
  generatedClaim: string;
  supportingSource: string; // E.g., "Profile -> EmploymentHistory -> TechCorp"
  confidence: number; // 0.0 - 1.0
  requiresUserConfirmation: boolean;
}

export interface ScreeningQuestionAnswer {
  question: string;
  suggestedAnswer: string;
  requiresManualUserAnswer: boolean;
  manualAnswerReason?: string;
}

export interface ApplicationDraft {
  id: string;
  userId: string;
  jobId: string;
  cvVersionId: string;
  tailoredSummary: string;
  suggestedCvChanges: string[];
  tailoredCoverLetter: string;
  wordCount: number;
  screeningAnswers: ScreeningQuestionAnswer[];
  claimEvidence: ClaimEvidence[];
  missingInformation: string[];
  isApproved: boolean;
  createdAt: string;
}

export type ApplicationStatus = 
  | 'draft'
  | 'awaiting_approval'
  | 'approved'
  | 'submitted'
  | 'assessment'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface ApplicationRecord {
  id: string;
  userId: string;
  jobId: string;
  draftId: string;
  status: ApplicationStatus;
  jobTitle: string;
  companyName: string;
  appliedAt: string | null;
  followUpDate: string | null;
  notes: string;
  officialApplicationUrl: string;
  safetyChecksPassed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchSettings {
  userId: string;
  searchTerms: string;
  location: string;
  remoteFilter: RemoteType;
  salaryFilter: number;
  minMatchScore: number;
  sourceFilter: string; // 'all' | 'greenhouse' | 'lever' | 'google_grounding' | 'career_pages'
  scheduledFrequency: 'off' | 'daily' | 'weekly';
  isScheduled: boolean;
}

export interface AutomationSources {
  googleSearch: boolean;
  greenhouse: boolean;
  lever: boolean;
  companyCareerPages: boolean;
}

export interface AutomationSettings {
  userId: string;
  enabled: boolean;
  frequencyHours: 6 | 12 | 24;
  timezone: string;
  minimumMatchScore: number;
  maximumJobsPerRun: number;
  automaticallyPrepareApplications: boolean;
  notifyWhenComplete: boolean;
  notifyWhenNoJobsFound?: boolean;
  sources: AutomationSources;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type SearchRunTrigger = 'scheduled' | 'manual';
export type SearchRunStatus = 'queued' | 'running' | 'completed' | 'partially_completed' | 'failed' | 'skipped';

export interface SearchRun {
  runId: string;
  userId?: string;
  trigger: SearchRunTrigger;
  scheduledTime: string;
  status: SearchRunStatus;
  eligibleUsers: number;
  tasksCreated: number;
  tasksCompleted: number;
  tasksFailed: number;
  jobsDiscovered: number;
  jobsValidated: number;
  duplicatesRejected: number;
  jobsBelowThreshold: number;
  jobsSaved: number;
  applicationsPrepared: number;
  startedAt: string;
  completedAt: string | null;
  errorSummary: string[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface WorkerTask {
  taskId: string;
  runId: string;
  userId: string;
  source: 'googleSearch' | 'greenhouse' | 'lever' | 'companyCareerPages' | string;
  status: TaskStatus;
  attemptCount: number;
  jobsDiscovered: number;
  jobsSaved: number;
  duplicatesRejected: number;
  jobsBelowThreshold: number;
  startedAt: string | null;
  completedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  runId?: string;
  createdAt: string;
}

export interface SearchRunRecord {
  id: string;
  userId: string;
  searchTerms: string;
  timestamp: string;
  jobsFoundCount: number;
  newJobsAdded: number;
  source: string;
  triggerType: 'manual' | 'scheduled';
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface DashboardMetrics {
  newJobsCount: number;
  recommendedJobsCount: number;
  awaitingApprovalCount: number;
  submittedCount: number;
  interviewsCount: number;
  rejectionsCount: number;
  savedJobsCount: number;
  weeklyStats: { day: string; searched: number; applications: number; interviews: number }[];
}
