import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Filter, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  XCircle,
  Calendar
} from 'lucide-react';
import { SearchRun, WorkerTask } from '../types/jobpilot';
import { api } from '../services/api';

export const SearchHistoryView: React.FC = () => {
  const [runs, setRuns] = useState<SearchRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRunDetails, setSelectedRunDetails] = useState<{ runId: string; tasks: WorkerTask[] } | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  // Filters
  const [triggerFilter, setTriggerFilter] = useState<'all' | 'scheduled' | 'manual'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'running' | 'failed'>('all');

  useEffect(() => {
    loadSearchRuns();
  }, []);

  const loadSearchRuns = async () => {
    try {
      setLoading(true);
      const data = await api.getSearchRuns();
      setRuns(data);
    } catch (err) {
      console.error('Failed to load search runs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSearchRuns();
    setRefreshing(false);
  };

  const handleToggleExpandRun = async (runId: string) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null);
      setSelectedRunDetails(null);
      return;
    }

    setExpandedRunId(runId);
    try {
      const details = await api.getSearchRun(runId);
      setSelectedRunDetails({ runId, tasks: details.tasks });
    } catch (err) {
      console.error('Failed to load tasks for run:', err);
    }
  };

  const filteredRuns = runs.filter(run => {
    if (triggerFilter !== 'all' && run.trigger !== triggerFilter) return false;
    if (statusFilter !== 'all' && run.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: SearchRun['status']) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'running':
      case 'queued':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30"><Clock className="w-3 h-3 animate-spin" /> In Progress</span>;
      case 'partially_completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30"><AlertTriangle className="w-3 h-3" /> Partial</span>;
      case 'failed':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30"><XCircle className="w-3 h-3" /> Failed</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Search Run Audit History</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Complete audit trail of automated Cloud Task workers and manual search runs.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="glass-panel hover:bg-white/10 text-white px-4 py-2.5 text-xs font-semibold border-white/20 flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 text-slate-300">
            <Filter className="w-4 h-4 text-blue-400" />
            <span>Filter Runs:</span>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            {(['all', 'scheduled', 'manual'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTriggerFilter(t)}
                className={`px-3 py-1 rounded-md capitalize transition text-xs font-semibold ${
                  triggerFilter === t ? 'btn-gradient-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            {(['all', 'completed', 'running', 'failed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md capitalize transition text-xs font-semibold ${
                  statusFilter === s ? 'btn-gradient-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-300 font-medium">
          Showing {filteredRuns.length} of {runs.length} search runs
        </span>
      </div>

      {/* Runs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="glass-panel p-8 text-center space-y-3">
          <Search className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Search Runs Recorded</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Execute a job search or enable scheduled runs to generate audit history records.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRuns.map((run) => {
            const isExpanded = expandedRunId === run.runId;

            return (
              <div 
                key={run.runId}
                className="glass-card overflow-hidden border-white/10"
              >
                <div 
                  onClick={() => handleToggleExpandRun(run.runId)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md ${
                        run.trigger === 'scheduled' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/10 text-slate-300'
                      }`}>
                        {run.trigger === 'scheduled' ? 'Scheduled Run' : 'Manual Search'}
                      </span>

                      <span className="text-xs font-bold text-white font-mono">{run.runId}</span>
                      {getStatusBadge(run.status)}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(run.createdAt).toLocaleString()}
                      </span>
                      {run.completedAt && (
                        <span>
                          Duration: {Math.max(1, Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000))}s
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Discovered</span>
                      <span className="text-sm font-bold text-white">{run.jobsDiscovered}</span>
                    </div>

                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Dups Filtered</span>
                      <span className="text-sm font-bold text-amber-400">{run.duplicatesRejected}</span>
                    </div>

                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Jobs Saved</span>
                      <span className="text-sm font-bold text-emerald-400">{run.jobsSaved}</span>
                    </div>

                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Drafts Prepped</span>
                      <span className="text-sm font-bold text-blue-400">{run.applicationsPrepared}</span>
                    </div>

                    <div className="flex items-center justify-center text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-black/20 p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      Worker Task Breakdown ({run.tasksCreated} Tasks)
                    </h4>

                    {selectedRunDetails?.tasks && selectedRunDetails.tasks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedRunDetails.tasks.map((task) => (
                          <div 
                            key={task.taskId}
                            className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white capitalize">{task.source}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {task.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-300">
                              <span>Discovered: {task.jobsDiscovered}</span>
                              <span>Saved: {task.jobsSaved}</span>
                              <span>Dups: {task.duplicatesRejected}</span>
                            </div>

                            {task.lastError && (
                              <div className="p-2 bg-rose-500/20 border border-rose-500/30 rounded text-rose-300 text-[11px]">
                                Error: {task.lastError}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Loading worker task breakdown...</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
