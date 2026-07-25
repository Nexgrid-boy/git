/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { JobSearchView } from './components/JobSearchView';
import { AutomationSettingsView } from './components/AutomationSettingsView';
import { SearchHistoryView } from './components/SearchHistoryView';
import { OnboardingView } from './components/OnboardingView';
import { CvManagerView } from './components/CvManagerView';
import { ApplicationPrepView } from './components/ApplicationPrepView';
import { ApplicationTrackerView } from './components/ApplicationTrackerView';
import { JobDetailsModal } from './components/JobDetailsModal';

import { api } from './services/api';
import { 
  UserProfile, 
  StructuredJob, 
  JobMatchResult, 
  ApplicationRecord, 
  ApplicationDraft, 
  CVDocument,
  DashboardMetrics 
} from './types/jobpilot';

import { DEMO_USER_PROFILE, DEMO_JOBS, DEMO_MATCHES, DEMO_APPLICATIONS, DEMO_MASTER_CV } from './data/demoData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userEmail, setUserEmail] = useState<string | null>('alex.morgan.demo@example.com');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Core Data States
  const [profile, setProfile] = useState<UserProfile>(DEMO_USER_PROFILE);
  const [jobs, setJobs] = useState<(StructuredJob & { match: JobMatchResult })[]>([]);
  const [applications, setApplications] = useState<(ApplicationRecord & { draft?: ApplicationDraft; job?: StructuredJob })[]>([]);
  const [documents, setDocuments] = useState<CVDocument[]>([DEMO_MASTER_CV]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Selected Job for Modal
  const [selectedJob, setSelectedJob] = useState<(StructuredJob & { match?: JobMatchResult }) | null>(null);
  const [preparingApp, setPreparingApp] = useState(false);

  // Initial Data Load
  const loadData = async () => {
    try {
      const [fetchedProfile, fetchedJobs, fetchedApps, fetchedDocs, fetchedMetrics] = await Promise.all([
        api.getProfile().catch(() => DEMO_USER_PROFILE),
        api.getJobs().catch(() => DEMO_JOBS.map(j => ({ ...j, match: DEMO_MATCHES[j.externalId] }))),
        api.getApplications().catch(() => DEMO_APPLICATIONS),
        api.getDocuments().catch(() => [DEMO_MASTER_CV]),
        api.getDashboardMetrics().catch(() => null)
      ]);

      setProfile(fetchedProfile);
      setJobs(fetchedJobs as any);
      setApplications(fetchedApps as any);
      setDocuments(fetchedDocs);
      setMetrics(fetchedMetrics);
    } catch (err) {
      console.warn('Backend load fallback:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (updated: Partial<UserProfile>) => {
    const result = await api.updateProfile(updated);
    setProfile(result.profile);
    loadData();
  };

  const handlePrepareApplication = async (jobId: string) => {
    setPreparingApp(true);
    try {
      await api.prepareApplication(jobId);
      await loadData();
      setSelectedJob(null);
      setActiveTab('app-prep');
    } catch (err) {
      console.error('Failed to prepare application:', err);
    } finally {
      setPreparingApp(false);
    }
  };

  const awaitingCount = applications.filter(a => a.status === 'awaiting_approval').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-20">
      
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        awaitingApprovalCount={awaitingCount}
        userEmail={userEmail}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={() => setUserEmail(null)}
      />

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            jobs={jobs}
            onNavigate={setActiveTab}
            onSelectJob={job => setSelectedJob(job)}
          />
        )}

        {activeTab === 'search' && (
          <JobSearchView
            jobs={jobs}
            onSelectJob={job => setSelectedJob(job)}
            onRefreshJobs={loadData}
          />
        )}

        {activeTab === 'automation' && (
          <AutomationSettingsView
            onSettingsSaved={loadData}
          />
        )}

        {activeTab === 'history' && (
          <SearchHistoryView />
        )}

        {activeTab === 'cv-manager' && (
          <CvManagerView
            documents={documents}
            onRefreshDocuments={loadData}
          />
        )}

        {activeTab === 'onboarding' && (
          <OnboardingView
            profile={profile}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {activeTab === 'app-prep' && (
          <ApplicationPrepView
            applications={applications}
            cvDocuments={documents}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'tracker' && (
          <ApplicationTrackerView
            applications={applications}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onPrepareApplication={handlePrepareApplication}
        preparing={preparingApp}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={email => {
          setUserEmail(email);
          loadData();
        }}
      />
    </div>
  );
}
