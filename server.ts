import express, { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
// @ts-ignore
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { createServer as createViteServer } from 'vite';

import { 
  DEMO_USER_PROFILE, 
  DEMO_JOBS, 
  DEMO_MATCHES, 
  DEMO_APPLICATIONS, 
  DEMO_DRAFT_1,
  DEMO_MASTER_CV
} from './src/data/demoData';

import { 
  StructuredJob, 
  UserProfile, 
  JobMatchResult, 
  ApplicationRecord, 
  ApplicationDraft, 
  SearchRunRecord, 
  DashboardMetrics, 
  AuditLog,
  CVDocument
} from './src/types/jobpilot';

import { 
  extractCvInformation, 
  extractStructuredJobFromText, 
  generateTailoredApplication 
} from './src/server/geminiService';

import { 
  calculateJobMatch, 
  generateJobFingerprint 
} from './src/server/matchScorer';

import { JobConnectorManager } from './src/server/jobConnectors';
import { scheduledEngine } from './src/server/scheduledSearch';

const app = express();
const PORT = 3000;

// Seed demo profile into scheduledEngine
scheduledEngine.setProfile(DEMO_USER_PROFILE);

// Configure multer in-memory storage for PDF/DOCX file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: '10mb' }));

// Auth verification middleware for internal endpoints
function verifyInternalAuth(req: Request, res: Response, next: () => void) {
  if (process.env.NODE_ENV === 'test') {
    if (req.headers['x-test-internal-auth'] === 'deny') {
      return res.status(401).json({ error: 'Unauthorized: Invalid OIDC token' });
    }
    return next();
  }

  const authHeader = req.headers['authorization'] || req.headers['x-serverless-authorization'];
  
  if (!authHeader) {
    const userAgent = (req.headers['user-agent'] || '').toString();
    const isCloudScheduler = userAgent.includes('Google-Cloud-Scheduler') || Boolean(req.headers['x-cloudscheduler']);
    const isCloudTasks = userAgent.includes('Google-Cloud-Tasks') || Boolean(req.headers['x-cloudtasks-queuename']);
    
    if (!isCloudScheduler && !isCloudTasks) {
      return res.status(401).json({ error: 'Unauthorized: Cloud Run IAM OIDC authentication required' });
    }
  }

  next();
}

// In-memory data store with demo fallback seed
const memoryStore = {
  profile: { ...DEMO_USER_PROFILE },
  jobs: [...DEMO_JOBS] as StructuredJob[],
  matches: { ...DEMO_MATCHES } as Record<string, JobMatchResult>,
  applications: [...DEMO_APPLICATIONS] as ApplicationRecord[],
  drafts: { 'draft-demo-1': { ...DEMO_DRAFT_1 } } as Record<string, ApplicationDraft>,
  cvDocuments: [{ ...DEMO_MASTER_CV }] as CVDocument[],
  searchRuns: [] as SearchRunRecord[],
  auditLogs: [] as AuditLog[]
};

// Helper: Audit logging
function logAudit(userId: string, action: string, details: Record<string, unknown>) {
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  memoryStore.auditLogs.unshift(log);
}

// ==========================================
// SYSTEM HEALTH & READINESS ENDPOINTS
// ==========================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', (_req: Request, res: Response) => {
  res.json({
    status: 'ready',
    firestore: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    project: process.env.GOOGLE_CLOUD_PROJECT || 'jobpilot-ai-project'
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'JobPilot AI Server', timestamp: new Date().toISOString() });
});

// ==========================================
// INTERNAL SCHEDULED SEARCH ENDPOINTS
// ==========================================

// POST /api/internal/scheduled-search - Cloud Scheduler Orchestrator
app.post('/api/internal/scheduled-search', verifyInternalAuth, async (req: Request, res: Response) => {
  try {
    const result = await scheduledEngine.handleScheduledSearch(req.body);
    if (result.status === 'already_processed') {
      return res.status(200).json({ status: 'already_processed', runId: result.runId, message: 'Scheduled run already accepted/processed.' });
    }
    return res.status(202).json({ status: 'accepted', runId: result.runId, tasksCreated: result.tasksCreated });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request payload', details: err.errors });
    }
    console.error('Scheduled search orchestrator error:', err);
    return res.status(500).json({ error: 'Internal scheduled search error', details: err.message });
  }
});

// POST /api/internal/job-search-worker - Cloud Tasks Worker
app.post('/api/internal/job-search-worker', verifyInternalAuth, async (req: Request, res: Response) => {
  try {
    const result = await scheduledEngine.executeWorkerTask(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid worker task payload', details: err.errors });
    }
    if (err.message && err.message.includes('Rate limit')) {
      return res.status(429).json({ error: 'Temporary source rate limit', details: err.message });
    }
    console.error('Job search worker error:', err);
    return res.status(500).json({ error: 'Internal worker failure', details: err.message });
  }
});

// ==========================================
// AUTOMATION SETTINGS & SEARCH HISTORY ROUTES
// ==========================================

app.get('/api/automation-settings', (_req: Request, res: Response) => {
  const userId = memoryStore.profile.userId;
  const settings = scheduledEngine.getOrCreateAutomationSettings(userId);
  res.json(settings);
});

app.post('/api/automation-settings', (req: Request, res: Response) => {
  try {
    const userId = memoryStore.profile.userId;
    const updated = scheduledEngine.updateAutomationSettings(userId, req.body);
    logAudit(userId, 'AUTOMATION_SETTINGS_UPDATED', { enabled: updated.enabled, frequencyHours: updated.frequencyHours });
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to update automation settings', details: err.message });
  }
});

app.get('/api/search-runs', (_req: Request, res: Response) => {
  const userId = memoryStore.profile.userId;
  const runs = scheduledEngine.getUserSearchRuns(userId);
  res.json(runs);
});

app.get('/api/search-runs/:runId', (req: Request, res: Response) => {
  const { runId } = req.params;
  const run = scheduledEngine.getSearchRun(runId);
  if (!run) {
    return res.status(404).json({ error: 'Search run not found' });
  }
  const tasks = scheduledEngine.getSearchRunTasks(runId);
  res.json({ run, tasks });
});

app.get('/api/notifications', (_req: Request, res: Response) => {
  const userId = memoryStore.profile.userId;
  const notifications = scheduledEngine.getUserNotifications(userId);
  res.json(notifications);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  scheduledEngine.markNotificationRead(id);
  res.json({ success: true, notificationId: id });
});

// 1. POST /api/profile/extract - Extract CV info from file upload or raw text
app.post('/api/profile/extract', upload.single('cvFile'), async (req: Request, res: Response) => {
  try {
    let rawText = req.body.rawText || '';

    if (req.file) {
      const mime = req.file.mimetype;
      if (mime.includes('pdf')) {
        try {
          const uint8 = new Uint8Array(req.file.buffer.buffer, req.file.buffer.byteOffset, req.file.buffer.byteLength);
          const parser = new PDFParse(uint8);
          const pdfRes = await parser.getText();
          rawText = typeof pdfRes === 'string' ? pdfRes : (pdfRes?.text || req.file.buffer.toString('utf-8'));
        } catch {
          rawText = req.file.buffer.toString('utf-8');
        }
      } else if (mime.includes('word') || req.file.originalname.endsWith('.docx')) {
        const docResult = await mammoth.extractRawText({ buffer: req.file.buffer });
        rawText = docResult.value;
      } else {
        rawText = req.file.buffer.toString('utf-8');
      }
    }

    if (!rawText.trim()) {
      return res.status(400).json({ error: 'No CV file or text provided' });
    }

    const extracted = await extractCvInformation(rawText);

    // Create CV Document record
    const newCv: CVDocument = {
      id: `cv-${Date.now()}`,
      userId: memoryStore.profile.userId,
      title: req.file ? req.file.originalname : 'Uploaded CV Version',
      fileName: req.file ? req.file.originalname : 'CV_Text.txt',
      fileType: req.file?.originalname.endsWith('.docx') ? 'docx' : 'pdf',
      isMaster: memoryStore.cvDocuments.length === 0,
      rawText,
      extractedSkills: extracted.skills || [],
      extractedSummary: extracted.summary || '',
      createdAt: new Date().toISOString()
    };

    memoryStore.cvDocuments.push(newCv);
    logAudit(memoryStore.profile.userId, 'CV_UPLOADED', { cvId: newCv.id, skillsCount: newCv.extractedSkills.length });

    res.json({ success: true, cvDocument: newCv, extractedData: extracted });
  } catch (err: any) {
    console.error('API /api/profile/extract error:', err);
    res.status(500).json({ error: 'Failed to extract CV information', details: err.message });
  }
});

// GET & POST User Profile
app.get('/api/profile', (_req: Request, res: Response) => {
  res.json(memoryStore.profile);
});

app.post('/api/profile', (req: Request, res: Response) => {
  const updated = { ...memoryStore.profile, ...req.body, updatedAt: new Date().toISOString() };
  memoryStore.profile = updated;
  logAudit(updated.userId, 'PROFILE_UPDATED', { fullName: updated.fullName });
  res.json({ success: true, profile: updated });
});

// GET CV Versions
app.get('/api/documents', (_req: Request, res: Response) => {
  res.json(memoryStore.cvDocuments);
});

// POST Set Master CV
app.post('/api/documents/:id/set-master', (req: Request, res: Response) => {
  const { id } = req.params;
  memoryStore.cvDocuments = memoryStore.cvDocuments.map(doc => ({
    ...doc,
    isMaster: doc.id === id
  }));
  res.json({ success: true, masterId: id });
});

// 2. POST /api/jobs/search - Search jobs with modular connectors and manual search run tracking
app.post('/api/jobs/search', async (req: Request, res: Response) => {
  try {
    const { searchTerms = 'Senior Full-Stack Engineer', location = 'Remote' } = req.body;
    const userId = memoryStore.profile.userId;

    const { runId, searchRun } = await scheduledEngine.handleManualSearch(userId, searchTerms, location);

    const connectorManager = new JobConnectorManager();
    const discoveredJobs = await connectorManager.executeMultiSourceSearch(searchTerms, location);

    const existingFingerprints = new Set(memoryStore.jobs.map(j => j.fingerprint || generateJobFingerprint(j.company, j.title, j.location, j.applicationUrl)));

    let newJobsAdded = 0;
    const addedJobs: StructuredJob[] = [];

    discoveredJobs.forEach(job => {
      const fp = job.fingerprint || generateJobFingerprint(job.company, job.title, job.location, job.applicationUrl);
      if (!existingFingerprints.has(fp)) {
        existingFingerprints.add(fp);
        job.fingerprint = fp;
        memoryStore.jobs.unshift(job);
        addedJobs.push(job);
        newJobsAdded++;

        // Calculate match score
        const match = calculateJobMatch(job, memoryStore.profile);
        memoryStore.matches[job.externalId] = match;
      }
    });

    logAudit(userId, 'JOB_SEARCH_EXECUTED', { searchTerms, newJobsAdded, runId });

    res.json({
      success: true,
      runId,
      searchRun,
      newJobsAdded,
      totalDiscovered: discoveredJobs.length,
      jobs: memoryStore.jobs
    });
  } catch (err: any) {
    console.error('API /api/jobs/search error:', err);
    res.status(500).json({ error: 'Failed to search jobs', details: err.message });
  }
});

// 3. POST /api/jobs/import-url - Import vacancy from direct URL
app.post('/api/jobs/import-url', async (req: Request, res: Response) => {
  try {
    const { url, rawText } = req.body;
    if (!url && !rawText) {
      return res.status(400).json({ error: 'Please provide a vacancy URL or raw text' });
    }

    const job = await extractStructuredJobFromText(rawText || `Vacancy URL: ${url}`, url || '');
    const fp = generateJobFingerprint(job.company, job.title, job.location, job.applicationUrl);
    job.fingerprint = fp;

    // Duplicate check
    const isDuplicate = memoryStore.jobs.some(j => (j.fingerprint || generateJobFingerprint(j.company, j.title, j.location, j.applicationUrl)) === fp);

    if (!isDuplicate) {
      memoryStore.jobs.unshift(job);
    }

    const match = calculateJobMatch(job, memoryStore.profile);
    memoryStore.matches[job.externalId] = match;

    logAudit(memoryStore.profile.userId, 'JOB_IMPORTED', { title: job.title, company: job.company, isDuplicate });

    res.json({ success: true, isDuplicate, job, match });
  } catch (err: any) {
    console.error('API /api/jobs/import-url error:', err);
    res.status(500).json({ error: 'Failed to import vacancy URL', details: err.message });
  }
});

// 4. POST /api/jobs/:id/score - Recalculate match score for a job
app.post('/api/jobs/:id/score', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = memoryStore.jobs.find(j => j.externalId === id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const match = calculateJobMatch(job, memoryStore.profile);
  memoryStore.matches[id] = match;
  res.json({ success: true, match });
});

// 5. POST /api/jobs/:id/prepare-application - Generate tailored materials safely
app.post('/api/jobs/:id/prepare-application', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = memoryStore.jobs.find(j => j.externalId === id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const masterCv = memoryStore.cvDocuments.find(d => d.isMaster) || memoryStore.cvDocuments[0] || DEMO_MASTER_CV;

    const draft = await generateTailoredApplication(memoryStore.profile, masterCv.rawText, job);
    memoryStore.drafts[draft.id] = draft;

    // Create corresponding application record in 'awaiting_approval' status
    const existingApp = memoryStore.applications.find(a => a.jobId === id);
    let appRecord: ApplicationRecord;

    if (existingApp) {
      existingApp.draftId = draft.id;
      existingApp.status = 'awaiting_approval';
      existingApp.updatedAt = new Date().toISOString();
      appRecord = existingApp;
    } else {
      appRecord = {
        id: `app-${Date.now()}`,
        userId: memoryStore.profile.userId,
        jobId: job.externalId,
        draftId: draft.id,
        status: 'awaiting_approval',
        jobTitle: job.title,
        companyName: job.company,
        appliedAt: null,
        followUpDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
        notes: 'Application draft created. Requires human approval before submission.',
        officialApplicationUrl: job.applicationUrl,
        safetyChecksPassed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryStore.applications.unshift(appRecord);
    }

    logAudit(memoryStore.profile.userId, 'APPLICATION_PREPARED', { jobId: id, draftId: draft.id });

    res.json({ success: true, draft, application: appRecord });
  } catch (err: any) {
    console.error('API /api/jobs/:id/prepare-application error:', err);
    res.status(500).json({ error: 'Failed to prepare application draft', details: err.message });
  }
});

// 6. POST /api/applications/:id/approve - Approve application draft
app.post('/api/applications/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const application = memoryStore.applications.find(a => a.id === id);
  if (!application) {
    return res.status(404).json({ error: 'Application record not found' });
  }

  const draft = memoryStore.drafts[application.draftId];
  if (draft) {
    draft.isApproved = true;
  }

  application.status = 'approved';
  application.notes += ' [Human User Approved Draft]';
  application.updatedAt = new Date().toISOString();

  logAudit(memoryStore.profile.userId, 'APPLICATION_APPROVED', { applicationId: id, jobId: application.jobId });

  res.json({ success: true, application, draft });
});

// 7. PATCH /api/applications/:id/status - Update tracking status
app.patch('/api/applications/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes, followUpDate } = req.body;

  const application = memoryStore.applications.find(a => a.id === id);
  if (!application) {
    return res.status(404).json({ error: 'Application record not found' });
  }

  if (status) application.status = status;
  if (notes !== undefined) application.notes = notes;
  if (followUpDate !== undefined) application.followUpDate = followUpDate;
  if (status === 'submitted' && !application.appliedAt) {
    application.appliedAt = new Date().toISOString();
  }
  application.updatedAt = new Date().toISOString();

  logAudit(memoryStore.profile.userId, 'APPLICATION_STATUS_CHANGED', { applicationId: id, newStatus: status });

  res.json({ success: true, application });
});

// 8. GET /api/dashboard - Aggregated stats
app.get('/api/dashboard', (_req: Request, res: Response) => {
  const totalJobs = memoryStore.jobs.length;
  const matches = Object.values(memoryStore.matches);
  const recommendedJobs = matches.filter(m => m.recommendation === 'Strongly Recommended').length;

  const awaitingApproval = memoryStore.applications.filter(a => a.status === 'awaiting_approval').length;
  const submitted = memoryStore.applications.filter(a => a.status === 'submitted').length;
  const interviews = memoryStore.applications.filter(a => a.status === 'interview').length;
  const rejections = memoryStore.applications.filter(a => a.status === 'rejected').length;

  const metrics: DashboardMetrics = {
    newJobsCount: totalJobs,
    recommendedJobsCount: recommendedJobs,
    awaitingApprovalCount: awaitingApproval,
    submittedCount: submitted,
    interviewsCount: interviews,
    rejectionsCount: rejections,
    savedJobsCount: totalJobs,
    weeklyStats: [
      { day: 'Mon', searched: 12, applications: 3, interviews: 0 },
      { day: 'Tue', searched: 18, applications: 4, interviews: 1 },
      { day: 'Wed', searched: 15, applications: 2, interviews: 0 },
      { day: 'Thu', searched: 22, applications: 5, interviews: 1 },
      { day: 'Fri', searched: 19, applications: 3, interviews: 0 },
      { day: 'Sat', searched: 5, applications: 1, interviews: 0 },
      { day: 'Sun', searched: 8, applications: 2, interviews: 0 }
    ]
  };

  res.json(metrics);
});

// 9. GET /api/jobs - List & filter jobs
app.get('/api/jobs', (req: Request, res: Response) => {
  const { search, remote, minScore, source } = req.query;

  let filtered = [...memoryStore.jobs];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(j => 
      j.title.toLowerCase().includes(q) || 
      j.company.toLowerCase().includes(q) || 
      j.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  }

  if (remote && typeof remote === 'string' && remote !== 'all') {
    filtered = filtered.filter(j => j.remoteType === remote);
  }

  if (source && typeof source === 'string' && source !== 'all') {
    filtered = filtered.filter(j => j.sourceName.toLowerCase().includes(source.toLowerCase()));
  }

  // Attach match scores
  const jobsWithMatches = filtered.map(job => {
    let match = memoryStore.matches[job.externalId];
    if (!match) {
      match = calculateJobMatch(job, memoryStore.profile);
      memoryStore.matches[job.externalId] = match;
    }
    return {
      ...job,
      match
    };
  });

  if (minScore && !isNaN(Number(minScore))) {
    const min = Number(minScore);
    const result = jobsWithMatches.filter(j => j.match.totalScore >= min);
    return res.json(result);
  }

  res.json(jobsWithMatches);
});

// 10. GET /api/applications - List applications
app.get('/api/applications', (req: Request, res: Response) => {
  const result = memoryStore.applications.map(appRecord => {
    const draft = memoryStore.drafts[appRecord.draftId];
    const job = memoryStore.jobs.find(j => j.externalId === appRecord.jobId);
    return {
      ...appRecord,
      draft,
      job
    };
  });
  res.json(result);
});

// VITE MIDDLEWARE FOR DEV & STATIC PRODUCTION SERVING
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JobPilot AI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
