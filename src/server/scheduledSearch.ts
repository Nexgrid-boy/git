import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { CloudTasksClient } from '@google-cloud/tasks';
import { 
  StructuredJob, 
  UserProfile, 
  AutomationSettings, 
  SearchRun, 
  WorkerTask, 
  InAppNotification,
  ApplicationRecord
} from '../types/jobpilot';
import { calculateJobMatch, generateJobFingerprint } from './matchScorer';
import { 
  GreenhouseConnector, 
  LeverConnector, 
  GoogleSearchGroundingConnector, 
  CareerPagesConnector,
  JobConnector
} from './jobConnectors';
import { generateTailoredApplication } from './geminiService';

// Zod Schemas
export const ScheduledSearchRequestSchema = z.object({
  trigger: z.literal('cloud-scheduler'),
  mode: z.literal('scheduled'),
  scheduledTime: z.string()
});

export const WorkerTaskPayloadSchema = z.object({
  runId: z.string(),
  userId: z.string(),
  source: z.enum(['googleSearch', 'greenhouse', 'lever', 'companyCareerPages']),
  attempt: z.number().optional().default(1)
});

export const AutomationSettingsSchema = z.object({
  userId: z.string(),
  enabled: z.boolean(),
  frequencyHours: z.union([z.literal(6), z.literal(12), z.literal(24)]),
  timezone: z.string().default('Africa/Lagos'),
  minimumMatchScore: z.number().min(0).max(100),
  maximumJobsPerRun: z.number().min(1).max(500),
  automaticallyPrepareApplications: z.boolean(),
  notifyWhenComplete: z.boolean(),
  notifyWhenNoJobsFound: z.boolean().optional().default(false),
  sources: z.object({
    googleSearch: z.boolean(),
    greenhouse: z.boolean(),
    lever: z.boolean(),
    companyCareerPages: z.boolean()
  })
});

// Helper: Sanitise task name for Google Cloud Tasks
export function sanitiseTaskName(runId: string, userId: string, source: string): string {
  const userHash = crypto.createHash('md5').update(userId).digest('hex').slice(0, 10);
  const raw = `search-${runId}-${userHash}-${source}`;
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 400);
}

// In-memory + persistent database store abstraction
export class ScheduledSearchEngine {
  private dbStore: {
    automationSettings: Map<string, AutomationSettings>;
    searchRuns: Map<string, SearchRun>;
    tasks: Map<string, WorkerTask>; // key: `${runId}:${taskId}`
    jobs: Map<string, StructuredJob>;
    matches: Map<string, any>;
    notifications: Map<string, InAppNotification>;
    profiles: Map<string, UserProfile>;
    applications: Map<string, ApplicationRecord>;
    drafts: Map<string, any>;
  };

  private tasksClient?: CloudTasksClient;

  constructor() {
    this.dbStore = {
      automationSettings: new Map(),
      searchRuns: new Map(),
      tasks: new Map(),
      jobs: new Map(),
      matches: new Map(),
      notifications: new Map(),
      profiles: new Map(),
      applications: new Map(),
      drafts: new Map()
    };

    if (process.env.GOOGLE_CLOUD_PROJECT && process.env.CLOUD_TASKS_QUEUE) {
      try {
        this.tasksClient = new CloudTasksClient();
      } catch (err) {
        console.warn('[Cloud Tasks] Could not initialize native CloudTasksClient:', err);
      }
    }
  }

  // Seeding default settings for user
  getOrCreateAutomationSettings(userId: string): AutomationSettings {
    let settings = this.dbStore.automationSettings.get(userId);
    if (!settings) {
      settings = {
        userId,
        enabled: false,
        frequencyHours: 6,
        timezone: 'Africa/Lagos',
        minimumMatchScore: 65,
        maximumJobsPerRun: 50,
        automaticallyPrepareApplications: false,
        notifyWhenComplete: true,
        notifyWhenNoJobsFound: false,
        sources: {
          googleSearch: true,
          greenhouse: true,
          lever: true,
          companyCareerPages: true
        },
        lastRunAt: null,
        nextRunAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.dbStore.automationSettings.set(userId, settings);
    }
    return settings;
  }

  updateAutomationSettings(userId: string, partial: Partial<AutomationSettings>): AutomationSettings {
    const current = this.getOrCreateAutomationSettings(userId);
    const updated: AutomationSettings = {
      ...current,
      ...partial,
      userId,
      sources: {
        ...current.sources,
        ...(partial.sources || {})
      },
      updatedAt: new Date().toISOString()
    };
    this.dbStore.automationSettings.set(userId, updated);
    return updated;
  }

  setProfile(profile: UserProfile) {
    this.dbStore.profiles.set(profile.userId, profile);
  }

  getProfile(userId: string): UserProfile | undefined {
    return this.dbStore.profiles.get(userId);
  }

  getSearchRun(runId: string): SearchRun | undefined {
    return this.dbStore.searchRuns.get(runId);
  }

  getSearchRunTasks(runId: string): WorkerTask[] {
    const result: WorkerTask[] = [];
    for (const [key, task] of this.dbStore.tasks.entries()) {
      if (key.startsWith(`${runId}:`)) {
        result.push(task);
      }
    }
    return result;
  }

  getUserSearchRuns(userId: string): SearchRun[] {
    return Array.from(this.dbStore.searchRuns.values())
      .filter(run => run.userId === userId || run.eligibleUsers > 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getUserNotifications(userId: string): InAppNotification[] {
    return Array.from(this.dbStore.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markNotificationRead(notificationId: string) {
    const n = this.dbStore.notifications.get(notificationId);
    if (n) {
      n.read = true;
    }
  }

  // 1. SCHEDULED ORCHESTRATOR
  async handleScheduledSearch(reqBody: unknown): Promise<{ status: 'accepted' | 'already_processed'; runId: string; tasksCreated: number }> {
    const validated = ScheduledSearchRequestSchema.parse(reqBody);

    // Generate deterministic runId from scheduled time
    const schedDate = new Date(validated.scheduledTime);
    const timeMs = isNaN(schedDate.getTime()) ? Date.now() : schedDate.getTime();
    const runId = `sched-${timeMs}`;

    // Transactional check: check if run already processed
    const existingRun = this.dbStore.searchRuns.get(runId);
    if (existingRun && existingRun.status !== 'failed') {
      return { status: 'already_processed', runId, tasksCreated: existingRun.tasksCreated };
    }

    // Create search run document
    const nowIso = new Date().toISOString();
    const searchRun: SearchRun = {
      runId,
      trigger: 'scheduled',
      scheduledTime: validated.scheduledTime,
      status: 'queued',
      eligibleUsers: 0,
      tasksCreated: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      jobsDiscovered: 0,
      jobsValidated: 0,
      duplicatesRejected: 0,
      jobsBelowThreshold: 0,
      jobsSaved: 0,
      applicationsPrepared: 0,
      startedAt: nowIso,
      completedAt: null,
      errorSummary: [],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    this.dbStore.searchRuns.set(runId, searchRun);

    // Query all enabled automation settings
    const eligibleSettings: AutomationSettings[] = [];
    for (const settings of this.dbStore.automationSettings.values()) {
      if (settings.enabled) {
        eligibleSettings.push(settings);
      }
    }

    let tasksCreatedCount = 0;
    const tasksToDispatch: { payload: any; taskId: string }[] = [];

    const sourcesKeys: (keyof AutomationSettings['sources'])[] = ['googleSearch', 'greenhouse', 'lever', 'companyCareerPages'];

    for (const settings of eligibleSettings) {
      for (const srcKey of sourcesKeys) {
        if (settings.sources[srcKey]) {
          const taskId = sanitiseTaskName(runId, settings.userId, srcKey);
          const taskKey = `${runId}:${taskId}`;

          if (!this.dbStore.tasks.has(taskKey)) {
            const workerTask: WorkerTask = {
              taskId,
              runId,
              userId: settings.userId,
              source: srcKey,
              status: 'queued',
              attemptCount: 0,
              jobsDiscovered: 0,
              jobsSaved: 0,
              duplicatesRejected: 0,
              jobsBelowThreshold: 0,
              startedAt: null,
              completedAt: null,
              lastError: null,
              createdAt: nowIso,
              updatedAt: nowIso
            };

            this.dbStore.tasks.set(taskKey, workerTask);
            tasksCreatedCount++;
            tasksToDispatch.push({
              taskId,
              payload: {
                runId,
                userId: settings.userId,
                source: srcKey,
                attempt: 1
              }
            });
          }
        }
      }
    }

    searchRun.eligibleUsers = eligibleSettings.length;
    searchRun.tasksCreated = tasksCreatedCount;
    searchRun.status = tasksCreatedCount > 0 ? 'running' : 'completed';
    searchRun.updatedAt = new Date().toISOString();

    if (tasksCreatedCount === 0) {
      searchRun.completedAt = new Date().toISOString();
    }

    // Dispatch Cloud Tasks asynchronously
    this.dispatchTasksAsync(tasksToDispatch);

    return { status: 'accepted', runId, tasksCreated: tasksCreatedCount };
  }

  // Dispatch tasks either via Cloud Tasks SDK or async worker execution
  private async dispatchTasksAsync(tasks: { payload: any; taskId: string }[]) {
    for (const item of tasks) {
      const project = process.env.GOOGLE_CLOUD_PROJECT;
      const location = process.env.CLOUD_TASKS_LOCATION || 'europe-west1';
      const queue = process.env.CLOUD_TASKS_QUEUE || 'job-search-queue';
      const serviceUrl = process.env.CLOUD_RUN_SERVICE_URL || process.env.APP_URL || 'http://localhost:3000';

      if (this.tasksClient && project) {
        try {
          const parent = this.tasksClient.queuePath(project, location, queue);
          const taskName = `${parent}/tasks/${item.taskId}`;

          const task = {
            name: taskName,
            httpRequest: {
              httpMethod: 'POST' as const,
              url: `${serviceUrl.replace(/\/$/, '')}/api/internal/job-search-worker`,
              headers: { 'Content-Type': 'application/json' },
              body: Buffer.from(JSON.stringify(item.payload)).toString('base64'),
              oidcToken: {
                serviceAccountEmail: process.env.TASKS_SERVICE_ACCOUNT_EMAIL
              }
            }
          };

          await this.tasksClient.createTask({ parent, task });
          continue;
        } catch (err: any) {
          // If ALREADY_EXISTS (code 6), ignore safely
          if (err.code !== 6) {
            console.warn(`[Cloud Tasks] Failed to queue task ${item.taskId}, executing internally:`, err.message);
          }
        }
      }

      // Local / Fallback execution
      setImmediate(() => {
        this.executeWorkerTask(item.payload).catch(err => console.error('[Worker Error]', err));
      });
    }
  }

  // 2. WORKER EXECUTION
  async executeWorkerTask(payloadRaw: unknown): Promise<{ success: boolean; taskId: string; jobsSaved: number }> {
    const payload = WorkerTaskPayloadSchema.parse(payloadRaw);
    const taskId = sanitiseTaskName(payload.runId, payload.userId, payload.source);
    const taskKey = `${payload.runId}:${taskId}`;

    let task = this.dbStore.tasks.get(taskKey);
    const nowIso = new Date().toISOString();

    if (!task) {
      task = {
        taskId,
        runId: payload.runId,
        userId: payload.userId,
        source: payload.source,
        status: 'queued',
        attemptCount: 0,
        jobsDiscovered: 0,
        jobsSaved: 0,
        duplicatesRejected: 0,
        jobsBelowThreshold: 0,
        startedAt: null,
        completedAt: null,
        lastError: null,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      this.dbStore.tasks.set(taskKey, task);
    }

    // Replay / Duplicate check: return 200 if already completed
    if (task.status === 'completed') {
      return { success: true, taskId, jobsSaved: task.jobsSaved };
    }

    // Update status to running
    task.status = 'running';
    task.attemptCount += 1;
    task.startedAt = task.startedAt || nowIso;
    task.updatedAt = nowIso;

    const run = this.dbStore.searchRuns.get(payload.runId);
    if (!run) {
      task.status = 'failed';
      task.lastError = 'Search run record not found';
      task.completedAt = nowIso;
      task.updatedAt = nowIso;
      throw new Error(`Search run ${payload.runId} not found`);
    }

    const settings = this.getOrCreateAutomationSettings(payload.userId);
    if (!settings.enabled) {
      task.status = 'completed';
      task.completedAt = nowIso;
      task.updatedAt = nowIso;
      this.updateSearchRunCompletion(payload.runId);
      return { success: true, taskId, jobsSaved: 0 };
    }

    // Load user profile securely
    const profile = this.dbStore.profiles.get(payload.userId);
    const userTerms = profile?.preferredJobTitles?.join(' ') || 'Software Engineer';
    const userLocation = profile?.preferredCountries?.[0] || 'Remote';

    // Select connector based on source
    let connector: JobConnector;
    switch (payload.source) {
      case 'greenhouse':
        connector = new GreenhouseConnector();
        break;
      case 'lever':
        connector = new LeverConnector();
        break;
      case 'googleSearch':
        connector = new GoogleSearchGroundingConnector();
        break;
      case 'companyCareerPages':
      default:
        connector = new CareerPagesConnector();
        break;
    }

    try {
      const fetchedJobs = await connector.fetchJobs(userTerms, userLocation);
      task.jobsDiscovered = fetchedJobs.length;

      let saved = 0;
      let dups = 0;
      let belowThreshold = 0;
      let appsPrepared = 0;

      const maxJobs = settings.maximumJobsPerRun || 50;

      for (const rawJob of fetchedJobs) {
        if (saved >= maxJobs) break;

        const fp = rawJob.fingerprint || generateJobFingerprint(rawJob.company, rawJob.title, rawJob.location, rawJob.applicationUrl);
        rawJob.fingerprint = fp;

        // Check for duplicate in store
        const isDup = Array.from(this.dbStore.jobs.values()).some(j => j.fingerprint === fp);
        if (isDup) {
          dups++;
          continue;
        }

        // Match scoring against user profile if available
        let matchScore = 75; // default fallback score
        if (profile) {
          const match = calculateJobMatch(rawJob, profile);
          matchScore = match.totalScore;
          this.dbStore.matches.set(rawJob.externalId, match);
        }

        if (matchScore < settings.minimumMatchScore) {
          belowThreshold++;
          continue;
        }

        // Save qualified job
        this.dbStore.jobs.set(rawJob.externalId, rawJob);
        saved++;

        // Prepare application draft if enabled and matchScore >= 80
        if (settings.automaticallyPrepareApplications && matchScore >= 80 && profile) {
          try {
            const userCvContext = profile.skills?.join(', ') || profile.fullName;
            const draft = await generateTailoredApplication(profile, userCvContext, rawJob);
            this.dbStore.drafts.set(draft.id, draft);

            const appRecord: ApplicationRecord = {
              id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              userId: payload.userId,
              jobId: rawJob.externalId,
              draftId: draft.id,
              status: 'awaiting_approval',
              jobTitle: rawJob.title,
              companyName: rawJob.company,
              appliedAt: null,
              followUpDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
              notes: 'Automatically prepared application draft. Awaiting user approval.',
              officialApplicationUrl: rawJob.applicationUrl,
              safetyChecksPassed: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            this.dbStore.applications.set(appRecord.id, appRecord);
            appsPrepared++;
          } catch (err) {
            console.error('[Application Prep Error]', err);
          }
        }
      }

      task.jobsSaved = saved;
      task.duplicatesRejected = dups;
      task.jobsBelowThreshold = belowThreshold;
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.updatedAt = new Date().toISOString();

      // Update run counters
      run.jobsDiscovered += task.jobsDiscovered;
      run.jobsValidated += task.jobsDiscovered;
      run.duplicatesRejected += dups;
      run.jobsBelowThreshold += belowThreshold;
      run.jobsSaved += saved;
      run.applicationsPrepared += appsPrepared;
      run.tasksCompleted += 1;
      run.updatedAt = new Date().toISOString();

      this.updateSearchRunCompletion(payload.runId);

      return { success: true, taskId, jobsSaved: saved };
    } catch (err: any) {
      console.error(`[Worker Task Failed] ${taskId}:`, err);
      task.status = 'failed';
      task.lastError = err.message || 'Worker processing error';
      task.completedAt = new Date().toISOString();
      task.updatedAt = new Date().toISOString();

      run.tasksFailed += 1;
      run.errorSummary.push(`${payload.source}: ${task.lastError}`);
      run.updatedAt = new Date().toISOString();

      this.updateSearchRunCompletion(payload.runId);
      throw err;
    }
  }

  // 3. RUN COMPLETION AGGREGATOR
  updateSearchRunCompletion(runId: string) {
    const run = this.dbStore.searchRuns.get(runId);
    if (!run) return;

    const tasks = this.getSearchRunTasks(runId);
    const totalTasks = tasks.length;

    if (totalTasks === 0) return;

    const queuedCount = tasks.filter(t => t.status === 'queued').length;
    const runningCount = tasks.filter(t => t.status === 'running').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const failedCount = tasks.filter(t => t.status === 'failed').length;

    // Do NOT mark as completed while tasks are still queued or running
    if (queuedCount > 0 || runningCount > 0) {
      return;
    }

    if (completedCount === totalTasks) {
      run.status = 'completed';
    } else if (completedCount > 0 && failedCount > 0) {
      run.status = 'partially_completed';
    } else {
      run.status = 'failed';
    }

    run.completedAt = new Date().toISOString();
    run.updatedAt = new Date().toISOString();

    // Update user's lastRunAt & nextRunAt and send in-app notification
    const affectedUserIds = new Set(tasks.map(t => t.userId));

    for (const userId of affectedUserIds) {
      const settings = this.getOrCreateAutomationSettings(userId);
      const freqMs = settings.frequencyHours * 3600 * 1000;

      settings.lastRunAt = run.completedAt;
      settings.nextRunAt = new Date(Date.now() + freqMs).toISOString();
      settings.updatedAt = new Date().toISOString();

      const userJobsSaved = run.jobsSaved;

      if (userJobsSaved > 0 || settings.notifyWhenNoJobsFound) {
        const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const message = userJobsSaved > 0
          ? `Your scheduled job search found ${run.jobsDiscovered} vacancies. ${userJobsSaved} matched your minimum score.`
          : `Your scheduled job search completed. No new vacancies met your threshold during this run.`;

        const notification: InAppNotification = {
          id: notifId,
          userId,
          title: 'Scheduled Job Search Complete',
          message,
          read: false,
          runId,
          createdAt: new Date().toISOString()
        };

        this.dbStore.notifications.set(notifId, notification);
      }
    }
  }

  // 4. MANUAL SEARCH TRIGGER
  async handleManualSearch(userId: string, searchTerms: string, location: string): Promise<{ runId: string; searchRun: SearchRun }> {
    const runId = `manual-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const searchRun: SearchRun = {
      runId,
      userId,
      trigger: 'manual',
      scheduledTime: nowIso,
      status: 'queued',
      eligibleUsers: 1,
      tasksCreated: 4,
      tasksCompleted: 0,
      tasksFailed: 0,
      jobsDiscovered: 0,
      jobsValidated: 0,
      duplicatesRejected: 0,
      jobsBelowThreshold: 0,
      jobsSaved: 0,
      applicationsPrepared: 0,
      startedAt: nowIso,
      completedAt: null,
      errorSummary: [],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    this.dbStore.searchRuns.set(runId, searchRun);

    const sources: WorkerTask['source'][] = ['googleSearch', 'greenhouse', 'lever', 'companyCareerPages'];
    const tasksToDispatch: { payload: any; taskId: string }[] = [];

    for (const src of sources) {
      const taskId = sanitiseTaskName(runId, userId, src);
      const taskKey = `${runId}:${taskId}`;

      const workerTask: WorkerTask = {
        taskId,
        runId,
        userId,
        source: src,
        status: 'queued',
        attemptCount: 0,
        jobsDiscovered: 0,
        jobsSaved: 0,
        duplicatesRejected: 0,
        jobsBelowThreshold: 0,
        startedAt: null,
        completedAt: null,
        lastError: null,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      this.dbStore.tasks.set(taskKey, workerTask);
      tasksToDispatch.push({
        taskId,
        payload: {
          runId,
          userId,
          source: src,
          attempt: 1
        }
      });
    }

    searchRun.status = 'running';
    this.dispatchTasksAsync(tasksToDispatch);

    return { runId, searchRun };
  }
}

// Global Singleton Instance
export const scheduledEngine = new ScheduledSearchEngine();
