import React from 'react';
import { 
  DashboardMetrics, 
  StructuredJob, 
  JobMatchResult,
  ApplicationRecord
} from '../types/jobpilot';
import { 
  Briefcase, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  Video, 
  XCircle, 
  Search, 
  FileText, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  MapPin,
  DollarSign,
  Calendar
} from 'lucide-react';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  jobs: (StructuredJob & { match: JobMatchResult })[];
  onNavigate: (tab: string) => void;
  onSelectJob: (job: StructuredJob) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  jobs,
  onNavigate,
  onSelectJob
}) => {
  const topRecommended = jobs
    .filter(j => j.match && j.match.totalScore >= 70)
    .sort((a, b) => (b.match?.totalScore || 0) - (a.match?.totalScore || 0))
    .slice(0, 4);

  const statsCards = [
    { 
      label: 'New Vacancies Discovered', 
      value: metrics?.newJobsCount ?? jobs.length, 
      icon: Briefcase, 
      trend: '+18% this week',
      glow: 'shadow-blue-500/10 text-blue-400 bg-blue-500/15 border-blue-500/30' 
    },
    { 
      label: 'Strong Match Vacancies', 
      value: metrics?.recommendedJobsCount ?? jobs.filter(j => j.match?.totalScore >= 80).length, 
      icon: Sparkles, 
      trend: '85%+ match score',
      glow: 'shadow-cyan-500/10 text-cyan-400 bg-cyan-500/15 border-cyan-500/30' 
    },
    { 
      label: 'Awaiting Human Approval', 
      value: metrics?.awaitingApprovalCount ?? 2, 
      icon: Clock, 
      trend: 'Ready for review',
      glow: 'shadow-amber-500/10 text-amber-400 bg-amber-500/15 border-amber-500/30' 
    },
    { 
      label: 'Applications Submitted', 
      value: metrics?.submittedCount ?? 4, 
      icon: CheckCircle, 
      trend: 'User authorized',
      glow: 'shadow-emerald-500/10 text-emerald-400 bg-emerald-500/15 border-emerald-500/30' 
    },
    { 
      label: 'Interviews Scheduled', 
      value: metrics?.interviewsCount ?? 1, 
      icon: Video, 
      trend: '1 active stage',
      glow: 'shadow-purple-500/10 text-purple-400 bg-purple-500/15 border-purple-500/30' 
    },
    { 
      label: 'Job Offers Received', 
      value: 0, 
      icon: Zap, 
      trend: 'In negotiation',
      glow: 'shadow-indigo-500/10 text-indigo-400 bg-indigo-500/15 border-indigo-500/30' 
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15';
    if (score >= 65) return 'text-blue-400 border-blue-500/40 bg-blue-500/15';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/15';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/15';
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Welcome Glass Banner */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Human-in-the-Loop Safeguard Active</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="gradient-text">Alex</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              JobPilot AI is scanning verified job sources every 6 hours, matching qualified roles against your master profile, and generating application packages for your explicit review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('search')}
              className="btn-gradient-primary flex items-center gap-2 px-5 py-3 text-sm font-semibold"
            >
              <Search className="w-4 h-4" />
              <span>Search for Jobs</span>
            </button>

            <button
              onClick={() => onNavigate('app-prep')}
              className="glass-panel hover:bg-white/10 text-white flex items-center gap-2 px-5 py-3 text-sm font-semibold border-white/20"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Review Applications ({metrics?.awaitingApprovalCount ?? 2})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${stat.glow}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  {stat.trend}
                </span>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs font-medium text-slate-300 mt-1 leading-snug">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Job Search Progress Panel */}
      <div className="glass-panel p-6 border-blue-500/20 bg-gradient-to-r from-blue-950/20 via-slate-900/60 to-purple-950/20 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Clock className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Scheduled Search Orchestration</h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Active Schedule
                </span>
              </div>
              <p className="text-xs text-slate-300">Automated run frequency: Every 6 hours via Google Cloud Tasks & Scheduler</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px]">LAST SEARCH</span>
              <span className="font-semibold text-white">Today at 12:00 UTC</span>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div>
              <span className="text-slate-400 block text-[10px]">NEXT SEARCH</span>
              <span className="font-semibold text-blue-400">Today at 18:00 UTC</span>
            </div>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Active Connector Status: Scanning 4 Sources
              </span>
              <span className="text-cyan-400">100% Operational</span>
            </div>

            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div className="btn-gradient-primary h-full rounded-full w-full animate-pulse-glow" />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-start md:justify-end">
            {['Google Search API', 'Greenhouse Board', 'Lever ATS', 'Career Portals'].map((src, i) => (
              <span key={i} className="text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-lg">
                ✓ {src}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Main Section: Recommended Jobs & Weekly Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Jobs Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Recommended Jobs for You</span>
            </h3>

            <button 
              onClick={() => onNavigate('search')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              <span>Explore All Jobs ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topRecommended.map((job) => {
              const score = job.match?.totalScore || 70;
              return (
                <div 
                  key={job.externalId} 
                  onClick={() => onSelectJob(job)}
                  className="glass-card p-5 space-y-4 cursor-pointer relative group border-white/10 hover:border-blue-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-md">
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition leading-snug">
                          {job.title}
                        </h4>
                        <p className="text-xs text-slate-300 font-medium">{job.company}</p>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
                      {score}% Match
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {job.salaryRange || 'Competitive'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.requiredSkills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-md">
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{job.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{job.workType || 'Full-time'}</span>
                    <span className="text-blue-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      View details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Activity & Performance */}
        <div className="space-y-6">
          
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Weekly Metrics</span>
              </h3>
              <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">Last 7 days</span>
            </div>

            <div className="space-y-3">
              {metrics?.weeklyStats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{stat.day}</span>
                    <span className="text-slate-400">{stat.searched} jobs found • {stat.applications} prepped</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (stat.searched / 25) * 100)}%` }} />
                    <div className="bg-amber-400 h-full" style={{ width: `${Math.min(100, (stat.applications / 10) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 bg-gradient-to-br from-emerald-950/30 to-slate-900 border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Strict AI Ethics & Safety</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              JobPilot AI will never submit job applications automatically without your explicit approval, nor fabricate qualifications on your CV.
            </p>

            <button 
              onClick={() => onNavigate('onboarding')}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              Verify master career profile <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
