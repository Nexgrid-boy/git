import React, { useState } from 'react';
import { ApplicationRecord, ApplicationStatus } from '../types/jobpilot';
import { api } from '../services/api';
import { 
  ListTodo, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Edit3, 
  Save, 
  Filter
} from 'lucide-react';

interface ApplicationTrackerViewProps {
  applications: ApplicationRecord[];
  onRefresh: () => void;
}

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  applications,
  onRefresh
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editFollowUp, setEditFollowUp] = useState('');
  const [editStatus, setEditStatus] = useState<ApplicationStatus>('submitted');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const statusOptions: { value: ApplicationStatus; label: string; badgeClass: string }[] = [
    { value: 'draft', label: 'Draft', badgeClass: 'bg-white/10 text-slate-300 border-white/10' },
    { value: 'awaiting_approval', label: 'Awaiting Approval', badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    { value: 'approved', label: 'Approved', badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
    { value: 'submitted', label: 'Submitted', badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
    { value: 'assessment', label: 'Assessment', badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
    { value: 'interview', label: 'Interview', badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    { value: 'offer', label: 'Offer', badgeClass: 'bg-green-500/20 text-green-200 border-green-500/40' },
    { value: 'rejected', label: 'Rejected', badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
    { value: 'withdrawn', label: 'Withdrawn', badgeClass: 'bg-white/5 text-slate-400 border-white/10' }
  ];

  const handleStartEdit = (app: ApplicationRecord) => {
    setEditingId(app.id);
    setEditNotes(app.notes || '');
    setEditFollowUp(app.followUpDate || '');
    setEditStatus(app.status);
  };

  const handleSaveStatus = async (appId: string) => {
    try {
      await api.updateApplicationStatus(appId, editStatus, editNotes, editFollowUp);
      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error('Update status failed:', err);
    }
  };

  const filteredApps = applications.filter(a => filterStatus === 'all' || a.status === filterStatus);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Application Tracker</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Monitor stages, follow-up deadlines, assessments, and interview progress.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-blue-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="glass-input text-xs text-white px-3 py-2 focus:outline-none w-full md:w-48 cursor-pointer"
          >
            <option value="all">All Stages</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stage Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
        {statusOptions.slice(1, 6).map(opt => {
          const count = applications.filter(a => a.status === opt.value).length;
          return (
            <div key={opt.value} className="glass-panel p-3.5 text-center">
              <span className="text-slate-300 text-[10px] font-bold block uppercase tracking-wider">{opt.label}</span>
              <span className="text-xl font-extrabold text-white mt-1 block">{count}</span>
            </div>
          );
        })}
      </div>

      {/* List */}
      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/10 font-bold text-xs text-white uppercase tracking-wider">
          Applications List ({filteredApps.length})
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-slate-300 text-xs">
            No application records match this filter stage.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredApps.map(appRecord => {
              const isEditingThis = editingId === appRecord.id;
              const currentBadge = statusOptions.find(s => s.value === appRecord.status)?.badgeClass || 'bg-white/10 text-slate-300';

              return (
                <div key={appRecord.id} className="p-5 space-y-3 hover:bg-white/5 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-white">{appRecord.jobTitle}</h3>
                      <p className="text-xs text-slate-300">{appRecord.companyName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${currentBadge}`}>
                        {appRecord.status.replace('_', ' ')}
                      </span>

                      <button
                        onClick={() => isEditingThis ? handleSaveStatus(appRecord.id) : handleStartEdit(appRecord)}
                        className="glass-panel hover:bg-white/10 text-white px-3 py-1.5 text-xs font-semibold border-white/20 flex items-center gap-1.5 transition"
                      >
                        {isEditingThis ? <Save className="w-3.5 h-3.5 text-emerald-400" /> : <Edit3 className="w-3.5 h-3.5 text-blue-400" />}
                        <span>{isEditingThis ? 'Save' : 'Update'}</span>
                      </button>
                    </div>
                  </div>

                  {isEditingThis ? (
                    <div className="glass-panel p-4 space-y-3 text-xs border-white/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 mb-1 font-bold">Pipeline Stage</label>
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value as ApplicationStatus)}
                            className="w-full glass-input p-2 text-white focus:outline-none"
                          >
                            {statusOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 mb-1 font-bold">Follow-Up Date</label>
                          <input
                            type="date"
                            value={editFollowUp}
                            onChange={e => setEditFollowUp(e.target.value)}
                            className="w-full glass-input p-2 text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-bold">Notes & Activity Log</label>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={e => setEditNotes(e.target.value)}
                          placeholder="Interview schedule, interviewer names, technical assessment notes..."
                          className="w-full glass-input p-2 text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 pt-1">
                      <div className="flex flex-wrap items-center gap-4">
                        {appRecord.appliedAt && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span>Applied: {new Date(appRecord.appliedAt).toLocaleDateString()}</span>
                          </span>
                        )}

                        {appRecord.followUpDate && (
                          <span className="flex items-center gap-1 text-amber-300 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>Follow-Up: {appRecord.followUpDate}</span>
                          </span>
                        )}
                      </div>

                      <a
                        href={appRecord.officialApplicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"
                      >
                        <span>Official Vacancy Page</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {!isEditingThis && appRecord.notes && (
                    <p className="text-xs text-slate-200 bg-white/5 p-3 rounded-xl border border-white/10 italic">
                      "{appRecord.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
