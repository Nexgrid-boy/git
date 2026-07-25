import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Bell, 
  Zap, 
  Save, 
  Check, 
  Layers
} from 'lucide-react';
import { AutomationSettings } from '../types/jobpilot';
import { api } from '../services/api';

interface AutomationSettingsViewProps {
  onSettingsSaved?: () => void;
}

export const AutomationSettingsView: React.FC<AutomationSettingsViewProps> = ({ onSettingsSaved }) => {
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getAutomationSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Failed to load automation settings:', err);
      setMessage({ type: 'error', text: 'Failed to load automation settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setMessage(null);
      const res = await api.updateAutomationSettings(settings);
      setSettings(res.settings);
      setMessage({ type: 'success', text: 'Automation settings saved successfully!' });
      if (onSettingsSaved) onSettingsSaved();
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleManualTestTrigger = async () => {
    try {
      setTriggering(true);
      setMessage(null);
      const res = await api.searchJobs({
        searchTerms: 'Scheduled Test Search',
        location: 'Remote',
        isScheduled: true
      });
      setMessage({ 
        type: 'success', 
        text: `Manual trigger started search run #${res.searchRun?.id || 'run'}. Discovered ${res.newJobsAdded} new jobs!` 
      });
      loadSettings();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to trigger manual test search.' });
    } finally {
      setTriggering(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Automation Control Centre</h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
              settings.enabled 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                : 'bg-white/10 text-slate-400 border-white/10'
            }`}>
              {settings.enabled ? '✓ Automation Active' : 'Paused'}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Configure automated job-search frequency, match thresholds, permitted sources, and application draft rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualTestTrigger}
            disabled={triggering}
            className="glass-panel hover:bg-white/10 text-white px-4 py-2.5 text-xs font-semibold border-white/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 text-amber-400 ${triggering ? 'animate-spin' : ''}`} />
            <span>{triggering ? 'Running...' : 'Run Search Now'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gradient-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium ${
          message.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Master Toggle & Schedule */}
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Automated Job Discovery</h2>
                  <p className="text-xs text-slate-300">Cloud Scheduler and Cloud Tasks worker queue execution.</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.enabled} 
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Frequency Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Search Frequency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[6, 12, 24].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setSettings({ ...settings, frequencyHours: hours as 6 | 12 | 24 })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                      settings.frequencyHours === hours
                        ? 'btn-gradient-primary text-white border-transparent'
                        : 'glass-panel text-slate-300 hover:text-white border-white/10'
                    }`}
                  >
                    <span className="text-sm font-bold text-white">{hours} Hours</span>
                    <span className="text-[10px] text-slate-300 mt-0.5">
                      {hours === 6 ? 'Recommended' : hours === 12 ? 'Bi-daily' : 'Daily'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                User Timezone
              </label>
              <div className="flex items-center gap-2 glass-input px-3 py-2 text-xs">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="text"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="bg-transparent text-white focus:outline-none w-full"
                  placeholder="e.g. Africa/Lagos or UTC"
                />
              </div>
            </div>
          </div>

          {/* Permitted Connectors */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Permitted Vacancy Sources</h2>
                <p className="text-xs text-slate-300">Select which connectors workers execute during scheduled runs.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'googleSearch', label: 'Google Search API', desc: 'Grounding search across web job pages' },
                { key: 'greenhouse', label: 'Greenhouse Public API', desc: 'Direct board API queries for startups' },
                { key: 'lever', label: 'Lever Postings API', desc: 'Direct posting queries for scaleups' },
                { key: 'companyCareerPages', label: 'Company Career Pages', desc: 'Direct enterprise ATS page extraction' },
              ].map((src) => {
                const isChecked = settings.sources[src.key as keyof typeof settings.sources];
                return (
                  <label 
                    key={src.key}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      isChecked 
                        ? 'bg-blue-600/15 border-blue-500/40' 
                        : 'glass-panel border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setSettings({
                        ...settings,
                        sources: {
                          ...settings.sources,
                          [src.key]: e.target.checked
                        }
                      })}
                      className="mt-0.5 rounded bg-white/10 border-white/20 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{src.label}</span>
                      <span className="text-[11px] text-slate-300 block leading-tight mt-0.5">{src.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Quality Thresholds */}
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Quality Controls & Draft Rules</h2>
                <p className="text-xs text-slate-300">Set matching sensitivity and automatic material preparation rules.</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Minimum Match Score</span>
                <span className="text-sm font-extrabold text-cyan-400">{settings.minimumMatchScore}%</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="90" 
                step="5"
                value={settings.minimumMatchScore} 
                onChange={(e) => setSettings({ ...settings, minimumMatchScore: parseInt(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-xs text-slate-400">
                Jobs matching under {settings.minimumMatchScore}% will be omitted from saving.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">Automatic Application Drafts</h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Prepare tailored cover letters for roles scoring 80%+ match.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.automaticallyPrepareApplications} 
                    onChange={(e) => setSettings({ ...settings, automaticallyPrepareApplications: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-white/10 text-xs text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Safeguard:</strong> Drafts remain in "Awaiting Approval" queue until reviewed.
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Bell className="w-4 h-4 text-blue-400" />
                <span>Notification Preferences</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.notifyWhenComplete}
                    onChange={(e) => setSettings({ ...settings, notifyWhenComplete: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-blue-600"
                  />
                  <span>Notify on new matching vacancies found</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.notifyWhenNoJobsFound}
                    onChange={(e) => setSettings({ ...settings, notifyWhenNoJobsFound: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-blue-600"
                  />
                  <span>Notify even if no new jobs were found</span>
                </label>
              </div>
            </div>

          </div>

        </div>

        {/* Status Summary */}
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Automation Status</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px]">LAST EXECUTED RUN</span>
                <span className="text-sm font-semibold text-white">
                  {settings.lastRunAt ? new Date(settings.lastRunAt).toLocaleString() : 'Never'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px]">NEXT SCHEDULED RUN</span>
                <span className="text-sm font-bold text-emerald-400">
                  {settings.nextRunAt ? new Date(settings.nextRunAt).toLocaleString() : (settings.enabled ? 'Within 6 hours' : 'Paused')}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px]">CRON FREQUENCY</span>
                <span className="text-sm font-semibold text-cyan-400">
                  Every {settings.frequencyHours} Hours
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>GCP Security Guarantee</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>OIDC tokens generated dynamically for Cloud Tasks.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero automatic submission without explicit user approval.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
