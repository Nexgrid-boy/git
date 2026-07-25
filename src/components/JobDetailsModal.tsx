import React from 'react';
import { StructuredJob, JobMatchResult } from '../types/jobpilot';
import { 
  X, 
  Building2, 
  Globe, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Bookmark
} from 'lucide-react';

interface JobDetailsModalProps {
  job: (StructuredJob & { match?: JobMatchResult }) | null;
  onClose: () => void;
  onPrepareApplication: (jobId: string) => void;
  preparing: boolean;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  onClose,
  onPrepareApplication,
  preparing
}) => {
  if (!job) return null;

  const match = job.match;
  const score = match?.totalScore || 0;

  const getScoreBadge = (val: number) => {
    if (val >= 80) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    if (val >= 65) return 'text-blue-400 bg-blue-500/15 border-blue-500/30';
    if (val >= 50) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md">
      <div className="glass-panel border-white/20 text-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-4 pr-10 border-b border-white/10 pb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-bold">
              {job.sourceName}
            </span>
            <span className="text-slate-300">Discovered {new Date(job.dateDiscovered).toLocaleDateString()}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{job.title}</h2>
              <p className="text-sm font-semibold text-slate-300 flex flex-wrap items-center gap-2 mt-1">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{job.company}</span>
                <span>•</span>
                <Globe className="w-4 h-4 text-slate-400" />
                <span>{job.location} ({job.remoteType})</span>
              </p>
            </div>

            <div className={`shrink-0 px-5 py-2.5 rounded-2xl text-center border ${getScoreBadge(score)}`}>
              <div className="text-3xl font-extrabold tracking-tight">{score}%</div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-90">Match Score</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-300 pt-2">
            {job.salaryMaximum && (
              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>${Math.round(job.salaryMinimum!/1000)}k – ${Math.round(job.salaryMaximum/1000)}k {job.salaryCurrency}</span>
              </span>
            )}
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium capitalize">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>{job.employmentType}</span>
            </span>
            {job.applicationDeadline && (
              <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Deadline: {job.applicationDeadline}</span>
              </span>
            )}
          </div>
        </div>

        {/* Desktop 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6 text-xs text-slate-300 leading-relaxed">
            
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Job Overview</h3>
              <div className="glass-panel p-4 border-white/10 whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Responsibilities</h3>
                <ul className="glass-panel p-4 border-white/10 space-y-2 list-disc list-inside">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, i) => (
                  <span key={i} className="bg-white/5 border border-white/10 text-slate-200 px-3 py-1 rounded-lg font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Sticky Side Panel */}
          <div className="space-y-6">
            
            {/* Scam Warning */}
            {job.possibleScam && (
              <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Flagged Potential Scam Indicator</span>
                </div>
                <ul className="text-[11px] list-disc list-inside space-y-1 text-amber-200/90">
                  {job.scamReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Match Breakdown Card */}
            {match && (
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span>Match Evaluation</span>
                  </h3>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getScoreBadge(score)}`}>
                    {match.recommendation}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {match.explanation}
                </p>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qualifications</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Required Skills</span>
                      <span className="font-bold text-white">{match.breakdown.requiredSkillsScore}/35</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Experience</span>
                      <span className="font-bold text-white">{match.breakdown.experienceScore}/20</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Education</span>
                      <span className="font-bold text-white">{match.breakdown.educationScore}/15</span>
                    </div>
                  </div>
                </div>

                {match.strongMatches.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <h4 className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths
                    </h4>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {match.strongMatches.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => onPrepareApplication(job.externalId)}
                disabled={preparing}
                className="w-full btn-gradient-primary py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{preparing ? 'Preparing Draft...' : 'Prepare Application Draft'}</span>
              </button>

              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full glass-panel hover:bg-white/10 py-3 text-xs font-semibold text-slate-200 border-white/20 flex items-center justify-center gap-2 transition"
              >
                <span>Open Original Vacancy Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
