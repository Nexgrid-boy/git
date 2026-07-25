import { 
  UserProfile, 
  StructuredJob, 
  JobMatchResult, 
  ApplicationRecord, 
  ApplicationDraft, 
  CVDocument,
  DashboardMetrics,
  SearchRunRecord,
  AutomationSettings,
  SearchRun,
  WorkerTask,
  InAppNotification
} from '../types/jobpilot';

export const api = {
  // Extract CV
  async extractCv(formData: FormData): Promise<{ cvDocument: CVDocument; extractedData: any }> {
    const res = await fetch('/api/profile/extract', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to extract CV file');
    return res.json();
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<{ profile: UserProfile }> {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Documents
  async getDocuments(): Promise<CVDocument[]> {
    const res = await fetch('/api/documents');
    if (!res.ok) throw new Error('Failed to fetch CV documents');
    return res.json();
  },

  async setMasterCv(id: string): Promise<void> {
    const res = await fetch(`/api/documents/${id}/set-master`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to set master CV');
  },

  // Search
  async searchJobs(params: { searchTerms: string; location: string; isScheduled?: boolean }): Promise<{
    searchRun: SearchRunRecord;
    newJobsAdded: number;
    jobs: StructuredJob[];
  }> {
    const res = await fetch('/api/jobs/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to execute job search');
    return res.json();
  },

  // Import Job URL
  async importJobUrl(url: string, rawText?: string): Promise<{ isDuplicate: boolean; job: StructuredJob; match: JobMatchResult }> {
    const res = await fetch('/api/jobs/import-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, rawText })
    });
    if (!res.ok) throw new Error('Failed to import job URL');
    return res.json();
  },

  // Get Jobs
  async getJobs(filters?: { search?: string; remote?: string; minScore?: number; source?: string }): Promise<(StructuredJob & { match: JobMatchResult })[]> {
    const query = new URLSearchParams();
    if (filters?.search) query.set('search', filters.search);
    if (filters?.remote) query.set('remote', filters.remote);
    if (filters?.minScore) query.set('minScore', filters.minScore.toString());
    if (filters?.source) query.set('source', filters.source);

    const res = await fetch(`/api/jobs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  // Prepare Application Draft
  async prepareApplication(jobId: string): Promise<{ draft: ApplicationDraft; application: ApplicationRecord }> {
    const res = await fetch(`/api/jobs/${jobId}/prepare-application`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to prepare application draft');
    return res.json();
  },

  // Approve Application
  async approveApplication(appId: string): Promise<{ application: ApplicationRecord; draft: ApplicationDraft }> {
    const res = await fetch(`/api/applications/${appId}/approve`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to approve application');
    return res.json();
  },

  // Update Status
  async updateApplicationStatus(appId: string, status: string, notes?: string, followUpDate?: string): Promise<{ application: ApplicationRecord }> {
    const res = await fetch(`/api/applications/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, followUpDate })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  // Dashboard Metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  // Applications
  async getApplications(): Promise<(ApplicationRecord & { draft?: ApplicationDraft; job?: StructuredJob })[]> {
    const res = await fetch('/api/applications');
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  // Automation Settings
  async getAutomationSettings(): Promise<AutomationSettings> {
    const res = await fetch('/api/automation-settings');
    if (!res.ok) throw new Error('Failed to fetch automation settings');
    return res.json();
  },

  async updateAutomationSettings(settings: Partial<AutomationSettings>): Promise<{ success: boolean; settings: AutomationSettings }> {
    const res = await fetch('/api/automation-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update automation settings');
    return res.json();
  },

  // Search Runs
  async getSearchRuns(): Promise<SearchRun[]> {
    const res = await fetch('/api/search-runs');
    if (!res.ok) throw new Error('Failed to fetch search runs');
    return res.json();
  },

  async getSearchRun(runId: string): Promise<{ run: SearchRun; tasks: WorkerTask[] }> {
    const res = await fetch(`/api/search-runs/${runId}`);
    if (!res.ok) throw new Error('Failed to fetch search run details');
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<InAppNotification[]> {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to mark notification read');
  }
};
