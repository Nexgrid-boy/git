import React, { useState } from 'react';
import { UserProfile } from '../types/jobpilot';
import { UserCheck, Save, Plus, Trash2, CheckCircle2, Shield } from 'lucide-react';

interface OnboardingViewProps {
  profile: UserProfile;
  onSaveProfile: (updated: Partial<UserProfile>) => Promise<void>;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Skills input state
  const [newSkill, setNewSkill] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await onSaveProfile(formData);
      setSuccessMsg('Profile and job search preferences saved!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addPreferredTitle = () => {
    if (newTitle.trim() && !formData.preferredJobTitles.includes(newTitle.trim())) {
      setFormData({ ...formData, preferredJobTitles: [...formData.preferredJobTitles, newTitle.trim()] });
      setNewTitle('');
    }
  };

  const removePreferredTitle = (t: string) => {
    setFormData({ ...formData, preferredJobTitles: formData.preferredJobTitles.filter(item => item !== t) });
  };

  const addExclusion = () => {
    if (newExclusion.trim() && !formData.excludedRolesAndIndustries.includes(newExclusion.trim())) {
      setFormData({ ...formData, excludedRolesAndIndustries: [...formData.excludedRolesAndIndustries, newExclusion.trim()] });
      setNewExclusion('');
    }
  };

  const removeExclusion = (ex: string) => {
    setFormData({ ...formData, excludedRolesAndIndustries: formData.excludedRolesAndIndustries.filter(item => item !== ex) });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Verified Candidate Profile</h1>
            <p className="text-xs text-slate-300 mt-0.5">Application materials and match scores reference these verified records.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-gradient-primary text-white font-bold text-xs px-5 py-2.5 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Personal Info */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">1. Personal & Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full glass-input px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full glass-input px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full glass-input px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Country of Residence</label>
              <input
                type="text"
                value={formData.countryOfResidence}
                onChange={e => setFormData({ ...formData, countryOfResidence: e.target.value })}
                className="w-full glass-input px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">2. Target Job Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Remote Preference</label>
              <select
                value={formData.remotePreference}
                onChange={e => setFormData({ ...formData, remotePreference: e.target.value as any })}
                className="w-full glass-input px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
                <option value="unspecified">Flexible / Any</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={e => setFormData({ ...formData, employmentType: e.target.value as any })}
                className="w-full glass-input px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Minimum Annual Salary (USD)</label>
              <input
                type="number"
                value={formData.minimumAcceptableSalary}
                onChange={e => setFormData({ ...formData, minimumAcceptableSalary: Number(e.target.value) })}
                className="w-full glass-input px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Work Authorisation Details</label>
              <input
                type="text"
                value={formData.workAuthorisationInfo}
                onChange={e => setFormData({ ...formData, workAuthorisationInfo: e.target.value })}
                placeholder="e.g., Authorized to work without sponsorship"
                className="w-full glass-input px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Preferred Job Titles</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="flex-1 glass-input px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addPreferredTitle}
                className="glass-panel hover:bg-white/10 text-white px-3 py-2 text-xs font-bold border-white/20 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferredJobTitles.map((title, idx) => (
                <span key={idx} className="bg-blue-600/20 text-blue-300 border border-blue-500/40 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                  <span>{title}</span>
                  <button type="button" onClick={() => removePreferredTitle(title)} className="hover:text-white"><Trash2 className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Excluded Roles & Industries</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newExclusion}
                onChange={e => setNewExclusion(e.target.value)}
                placeholder="e.g. Gambling, Unpaid Internships"
                className="flex-1 glass-input px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addExclusion}
                className="glass-panel hover:bg-white/10 text-white px-3 py-2 text-xs font-bold border-white/20 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.excludedRolesAndIndustries.map((ex, idx) => (
                <span key={idx} className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
                  <span>{ex}</span>
                  <button type="button" onClick={() => removeExclusion(ex)} className="hover:text-white"><Trash2 className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Skills */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">3. Verified Core Skills</h2>
          <p className="text-xs text-slate-300">Only verified skills listed here will be referenced in cover letters.</p>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              placeholder="Add a verified skill (e.g. TypeScript, React, GCP)"
              className="flex-1 glass-input px-3 py-2 text-xs text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={addSkill}
              className="btn-gradient-primary text-white px-4 py-2 text-xs font-bold transition"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, idx) => (
              <span key={idx} className="bg-white/5 border border-white/10 text-slate-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium">
                <span>{skill}</span>
                <button type="button" onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-white"><Trash2 className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Employment History */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>4. Verified Employment History</span>
            </h2>
          </div>

          <div className="space-y-3">
            {formData.verifiedEmploymentHistory.map((emp, idx) => (
              <div key={emp.id || idx} className="glass-panel p-4 space-y-2 border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-white">{emp.title} <span className="text-slate-300 font-normal">at {emp.company}</span></h3>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{emp.startDate} – {emp.endDate}</p>
                <div className="mt-2 space-y-1">
                  {emp.achievements.map((ach, aIdx) => (
                    <p key={aIdx} className="text-xs text-slate-300">• {ach}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
};
