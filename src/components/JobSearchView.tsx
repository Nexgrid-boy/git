import React, { useState } from 'react';
import { StructuredJob, JobMatchResult } from '../types/jobpilot';
import { api } from '../services/api';
import { 
  Search, 
  Globe, 
  DollarSign, 
  Sparkles, 
  AlertTriangle, 
  Link2, 
  Building2, 
  ExternalLink,
  Clock,
  LayoutGrid,
  List,
  MapPin,
  Bookmark,
  CheckCircle2
} from 'lucide-react';

interface JobSearchViewProps {
  jobs: (StructuredJob & { match: JobMatchResult })[];
  onSelectJob: (job: StructuredJob) => void;
  onRefreshJobs: () => void;
}

export const JobSearchView: React.FC<JobSearchViewProps> = ({
  jobs,
  onSelectJob,
  onRefreshJobs
}) => {
  const [searchTerms, setSearchTerms] = useState('Senior Full-Stack Engineer');
  const [location, setLocation] = useState('Remote');
  const [remoteFilter, setRemoteFilter] = useState('all');
  const [minScore, setMinScore] = useState(50);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searching, setSearching] = useState(false);

  // Import URL state
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const handleExecuteSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      await api.searchJobs({
        searchTerms,
        location,
        isScheduled: false
      });
      onRefreshJobs();
    } catch (err) {
      console.error('Job search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportMsg('');
    try {
      const res = await api.importJobUrl(importUrl.trim());
      setImportMsg(res.isDuplicate ? 'Job already exists in your database (Duplicate detected)' : 'Job imported & scored successfully!');
      setImportUrl('');
      onRefreshJobs();
    } catch (err: any) {
      setImportMsg('Failed to import job URL');
    } finally {
      setImporting(false);
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (remoteFilter !== 'all' && j.remoteType !== remoteFilter) return false;
    if (sourceFilter !== 'all' && !j.sourceName.toLowerCase().includes(sourceFilter.toLowerCase())) return false;
    if (j.match && j.match.totalScore < minScore) return false;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15';
    if (score >= 65) return 'text-blue-400 border-blue-500/40 bg-blue-500/15';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/15';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/15';
  };

  return (
    <div className="space-y-8">
      
      {/* Search Header & Import URL */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              <span>Job Vacancy Discovery & AI Matching</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Connects to Greenhouse, Lever, Google Search Grounding, and Public Company Career Portals.
            </p>
          </div>

          <form onSubmit={handleImportUrl} className="flex gap-2 w-full md:w-auto">
            <input
              type="url"
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              placeholder="Import vacancy URL (Greenhouse, Lever, etc.)"
              className="glass-input px-3.5 py-2 text-xs placeholder:text-slate-500 w-full md:w-72"
            />
            <button
              type="submit"
              disabled={importing}
              className="glass-panel hover:bg-white/10 text-white px-4 py-2 text-xs font-semibold border-white/20 flex items-center gap-1.5 shrink-0"
            >
              <Link2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{importing ? 'Importing...' : 'Import URL'}</span>
            </button>
          </form>
        </div>

        {importMsg && (
          <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{importMsg}</span>
          </div>
        )}

        {/* Filter Controls Form */}
        <form onSubmit={handleExecuteSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Role / Keywords</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerms}
                  onChange={e => setSearchTerms(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer, React, Node.js"
                  className="w-full glass-input pl-10 pr-4 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Location / Region</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Remote, Europe, USA"
                  className="w-full glass-input pl-10 pr-4 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={searching}
                className="w-full btn-gradient-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{searching ? 'Discovering Jobs...' : 'Run Connectors'}</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Workplace Type</label>
              <select
                value={remoteFilter}
                onChange={e => setRemoteFilter(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs"
              >
                <option value="all" className="bg-[#0B1628] text-white">All Workplace Types</option>
                <option value="remote" className="bg-[#0B1628] text-white">Remote Only</option>
                <option value="hybrid" className="bg-[#0B1628] text-white">Hybrid</option>
                <option value="onsite" className="bg-[#0B1628] text-white">On-site</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Connector Source</label>
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs"
              >
                <option value="all" className="bg-[#0B1628] text-white">All Sources</option>
                <option value="greenhouse" className="bg-[#0B1628] text-white">Greenhouse API</option>
                <option value="lever" className="bg-[#0B1628] text-white">Lever API</option>
                <option value="google" className="bg-[#0B1628] text-white">Google Grounding</option>
                <option value="career" className="bg-[#0B1628] text-white">Career Pages</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Minimum Match Score:</span>
                <span className="text-cyan-400 font-bold">{minScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer mt-1"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Results Header & Layout Switcher */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-300">
          Showing <span className="text-white font-bold">{filteredJobs.length}</span> vacancies
        </p>

        <div className="flex items-center gap-1 glass-panel p-1 border-white/10">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'list' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Jobs Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => {
            const score = job.match?.totalScore || 0;

            return (
              <div 
                key={job.externalId}
                onClick={() => onSelectJob(job)}
                className="glass-card p-6 cursor-pointer space-y-4 border-white/10 hover:border-blue-500/40 relative group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white group-hover:text-blue-400 transition leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-300 font-medium">{job.company}</p>
                      </div>
                    </div>

                    <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
                      {score}% Match
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location} ({job.remoteType})
                    </span>

                    {job.salaryMaximum && (
                      <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> ${Math.round(job.salaryMinimum!/1000)}k - ${Math.round(job.salaryMaximum/1000)}k
                      </span>
                    )}
                  </div>

                  {job.possibleScam && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>FLAGGED SCAM WARNING</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90">{job.scamReasons[0]}</p>
                    </div>
                  )}

                  {job.match && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {job.match.explanation}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{job.sourceName}</span>
                  <span className="text-blue-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>View details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredJobs.map(job => {
            const score = job.match?.totalScore || 0;
            return (
              <div
                key={job.externalId}
                onClick={() => onSelectJob(job)}
                className="glass-card p-4 cursor-pointer border-white/10 hover:border-blue-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-white font-extrabold shrink-0">
                    {job.company.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white hover:text-blue-400 transition">{job.title}</h3>
                    <p className="text-xs text-slate-300">{job.company} • {job.location} ({job.remoteType})</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
                    {score}% Match
                  </div>
                  <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                    Details <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
