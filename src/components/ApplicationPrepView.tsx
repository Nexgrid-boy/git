import React, { useState } from 'react';
import { ApplicationDraft, ApplicationRecord, CVDocument } from '../types/jobpilot';
import { api } from '../services/api';
import { 
  CheckCircle2, 
  Edit3, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  Sparkles,
  Lock,
  ThumbsUp,
  XCircle,
  FileCheck
} from 'lucide-react';

interface ApplicationPrepViewProps {
  applications: (ApplicationRecord & { draft?: ApplicationDraft })[];
  cvDocuments: CVDocument[];
  onRefresh: () => void;
}

export const ApplicationPrepView: React.FC<ApplicationPrepViewProps> = ({
  applications,
  cvDocuments,
  onRefresh
}) => {
  const awaitingApps = applications.filter(a => a.status === 'awaiting_approval' || a.status === 'approved' || a.status === 'draft');
  const [selectedAppId, setSelectedAppId] = useState<string>(awaitingApps[0]?.id || applications[0]?.id || '');
  
  const currentApp = applications.find(a => a.id === selectedAppId);
  const currentDraft = currentApp?.draft;

  const [isEditing, setIsEditing] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState(currentDraft?.tailoredCoverLetter || '');
  const [approving, setApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState('');

  const handleApprove = async () => {
    if (!currentApp) return;
    setApproving(true);
    setApprovalSuccess('');
    try {
      await api.approveApplication(currentApp.id);
      setApprovalSuccess('Application approved! Saved in Tracker as ready for manual submission.');
      onRefresh();
    } catch (err: any) {
      console.error('Approve failed:', err);
    } finally {
      setApproving(false);
    }
  };

  const wordCount = (currentDraft?.tailoredCoverLetter || '').trim().split(/\s+/).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Application Prep & Approval Studio</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Human-in-the-loop review studio for tailored cover letters, claim verification, and screening answers.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 shrink-0">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Manual Approval Safeguard Active</span>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-300 space-y-3">
          <FileCheck className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Application Drafts Available</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Discover matching vacancies in <strong className="text-white">Job Search</strong> and click "Prepare Application" to build tailored materials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Draft List Sidebar */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Draft Applications ({applications.length})</h2>
            <div className="space-y-3">
              {applications.map(appRecord => {
                const isSelected = appRecord.id === selectedAppId;
                return (
                  <div
                    key={appRecord.id}
                    onClick={() => {
                      setSelectedAppId(appRecord.id);
                      setEditedCoverLetter(appRecord.draft?.tailoredCoverLetter || '');
                      setApprovalSuccess('');
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected 
                        ? 'bg-blue-600/20 border-blue-500/60 shadow-lg shadow-blue-500/10' 
                        : 'glass-panel border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-xs text-white line-clamp-1">{appRecord.jobTitle}</h3>
                        <p className="text-[11px] text-slate-300 mt-0.5">{appRecord.companyName}</p>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                        appRecord.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {appRecord.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspector */}
          {currentApp && currentDraft ? (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Draft Banner */}
              <div className="glass-panel p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-white">{currentApp.jobTitle}</h2>
                    <p className="text-xs text-slate-300 mt-0.5">{currentApp.companyName} • Draft created {new Date(currentDraft.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={currentApp.officialApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-panel hover:bg-white/10 text-white px-3.5 py-2 text-xs font-semibold border-white/20 flex items-center gap-1.5 transition"
                    >
                      <span>Open Vacancy URL</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={handleApprove}
                      disabled={approving || currentApp.status === 'approved'}
                      className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 border transition ${
                        currentApp.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'btn-gradient-primary text-white border-transparent'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{currentApp.status === 'approved' ? 'Approved' : 'Approve Draft'}</span>
                    </button>
                  </div>
                </div>

                {approvalSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{approvalSuccess}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Base CV Document:
                  </span>
                  <span className="text-white font-bold">
                    {cvDocuments.find(d => d.id === currentDraft.cvVersionId)?.title || 'Master Verified CV'}
                  </span>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="glass-panel p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Tailored Cover Letter</span>
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">Recommended length: 250 – 400 words (Current: {wordCount} words)</p>
                  </div>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Done Editing' : 'Edit Letter'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    rows={12}
                    value={editedCoverLetter}
                    onChange={e => setEditedCoverLetter(e.target.value)}
                    className="w-full glass-input p-4 text-xs font-mono text-white leading-relaxed focus:outline-none"
                  />
                ) : (
                  <div className="glass-panel p-5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans border-white/10">
                    {currentDraft.tailoredCoverLetter}
                  </div>
                )}
              </div>

              {/* Non-Fabrication Audit Table */}
              <div className="glass-panel p-6 space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified Claim Mapping (Truthfulness Audit)</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">Every claim in this draft is verified against your master profile.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-300 text-[11px]">
                        <th className="py-2 px-3 font-bold">Generated Claim</th>
                        <th className="py-2 px-3 font-bold">Verified Profile Source</th>
                        <th className="py-2 px-3 font-bold">Confidence</th>
                        <th className="py-2 px-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {currentDraft.claimEvidence.map((ev, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="py-2.5 px-3 text-white font-medium">{ev.generatedClaim}</td>
                          <td className="py-2.5 px-3 text-blue-400 font-mono text-[11px]">{ev.supportingSource}</td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold">{Math.round(ev.confidence * 100)}%</td>
                          <td className="py-2.5 px-3">
                            {ev.requiresUserConfirmation ? (
                              <span className="text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded text-[10px] border border-amber-500/30">Confirmation Needed</span>
                            ) : (
                              <span className="text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">Verified</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Screening Answers */}
              {currentDraft.screeningAnswers.length > 0 && (
                <div className="glass-panel p-6 space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-purple-400" />
                      <span>Screening Question Drafts</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {currentDraft.screeningAnswers.map((sq, idx) => (
                      <div key={idx} className="glass-panel p-4 space-y-2 border-white/10">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-xs text-white">{sq.question}</p>
                          {sq.requiresManualUserAnswer && (
                            <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                              <Lock className="w-3 h-3 text-amber-400" /> Manual Answer Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-200 bg-black/20 p-3 rounded-lg border border-white/10 font-mono">
                          {sq.suggestedAnswer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="lg:col-span-2 glass-panel p-12 text-center text-slate-300">
              Select an application draft from the left to review materials.
            </div>
          )}

        </div>
      )}
    </div>
  );
};
