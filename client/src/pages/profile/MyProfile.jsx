import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Sparkles, CheckCircle2, Shield } from 'lucide-react';

export function MyProfile() {
  const { user, updateProfile } = useAuth();

  const [interests, setInterests] = useState(user?.interests?.join(', ') || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'beginner');
  const [academicYear, setAcademicYear] = useState(user?.academicYear || 1);
  const [department, setDepartment] = useState(user?.department || '');
  const [budget, setBudget] = useState(user?.budgetMax ?? '');
  const [peerVisibilityOptIn, setPeerVisibilityOptIn] = useState(
    user?.privacyPreferences?.showInPeerCounts ?? true
  );

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Calculate profile completeness
  const fields = [interests, skills, experienceLevel, academicYear, department];
  const filledCount = fields.filter(Boolean).length;
  const completeness = Math.round((filledCount / fields.length) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await updateProfile({
        interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        experienceLevel,
        academicYear: Number(academicYear),
        department,
        budgetMax: budget ? Number(budget) : null,
        privacyPreferences: {
          showInPeerCounts: peerVisibilityOptIn,
        },
      });
      setMessage({ type: 'success', text: 'Profile updated! Your Fit for You scores will now reflect these preferences.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Student Profile & Preferences</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure your academic interests and preferences to power the personalized <strong>Fit for You</strong> scoring engine.
        </p>
      </div>

      {/* Completeness Banner */}
      <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-purple-200">
              Personalization Completeness: {completeness}%
            </h4>
            <p className="text-xs text-slate-400">
              The more details you provide, the more accurate your Fit for You scores will be.
            </p>
          </div>
        </div>
        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl border text-xs ${
            message.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300'
              : 'border-rose-500/20 bg-rose-950/20 text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-white/10 bg-[#121826]/70 backdrop-blur-md space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Interests (comma-separated tags)
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="AI, Web3, Design, Robotics, Competitive Coding"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, React, Figma, C++"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Department / Branch</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Computer Science, Electronics..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 bg-[#121826] border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value={1}>Year 1 (Freshman)</option>
              <option value={2}>Year 2 (Sophomore)</option>
              <option value={3}>Year 3 (Junior)</option>
              <option value={4}>Year 4 (Senior)</option>
              <option value={5}>Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2 bg-[#121826] border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Max Budget (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Privacy Setting */}
        <div className="pt-4 border-t border-white/10">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={peerVisibilityOptIn}
              onChange={(e) => setPeerVisibilityOptIn(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="block font-medium text-slate-200">
                Include me in anonymous peer signals
              </span>
              <span className="block text-slate-400 text-[11px] leading-relaxed">
                When checked, your attendance contributes to privacy-masked peer counters (e.g. "X peers from your college attending"). Your individual name is never exposed.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-3">
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
