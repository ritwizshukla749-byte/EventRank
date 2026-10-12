import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import {
  Sparkles,
  ArrowRight,
  Play,
  X,
  LogIn,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Sliders,
  Award,
  Star,
  GraduationCap,
  Zap,
  Users,
  Lock,
} from 'lucide-react';

export function LandingPage() {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      setIsSignInOpen(false);
      navigate('/discover');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);
    setError(null);
    try {
      await login({ email: demoEmail, password: demoPassword });
      setIsSignInOpen(false);
      navigate('/discover');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full text-slate-900 overflow-hidden">
      {/* ===================================================================
          HERO SECTION — INSPIRED BY CLEAN PANORAMIC REFERENCE
          Vivid, completely sharp campus image with centered serif typography
          =================================================================== */}
      <section className="relative min-h-[88vh] lg:min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        {/* Crystal-Clear, Razor-Sharp Background Image (NO BLUR) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/campus-hero.png"
            alt="Collegiate campus architecture at golden sunset"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle soft center contrast fade to ensure text readability without obscuring sunset or Gothic tower */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.1)_45%,transparent_75%)] pointer-events-none" />
        </div>

        {/* Centered Hero Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Headline matching requested serif + italic accent design */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)] leading-[1.12]">
            <span className="sr-only">Discover Campus Events — </span>
            One connected view of
            <br />
            <span className="italic font-normal text-amber-400 drop-shadow-[0_4px_24px_rgba(251,146,60,0.45)]">
              every campus event.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-100 font-normal leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            EventRank connects students, organizers, and verified reviews in one intelligent platform — making every event decision trustworthy from announcement to attendance.
          </p>

          {/* Centered Pill Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/discover')}
                className="px-8 py-3.5 rounded-full bg-[#f8fafc] hover:bg-white text-slate-900 font-semibold text-sm sm:text-base shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Your Feed</span>
                <ArrowRight className="w-4 h-4 text-slate-900" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSignInOpen(true)}
                className="px-8 py-3.5 rounded-full bg-[#f8fafc] hover:bg-white text-slate-900 font-semibold text-sm sm:text-base shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-slate-900" />
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="px-7 py-3.5 rounded-full bg-black/85 hover:bg-black text-white font-medium text-sm sm:text-base border border-white/20 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2.5 backdrop-blur-sm cursor-pointer"
            >
              <span>See Live Feed</span>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400 ml-0.5" />
              </div>
            </button>
          </div>

          {/* Quick Demo Login Badges for Instant Frictionless Testing */}
          {!isAuthenticated && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] mr-1">
                Instant Demo Access:
              </span>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex.rivera@cascade.edu', 'Password123!')}
                className="px-3 py-1 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-slate-200 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
              >
                Alex Rivera <span className="text-indigo-400 font-mono text-[10px]">(Student)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('acm@cascade.edu', 'Password123!')}
                className="px-3 py-1 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-slate-200 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
              >
                Cascade ACM <span className="text-amber-400 font-mono text-[10px]">(Organizer)</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================
          SIGN-IN MODAL (Directed to feed after signing in)
          =================================================================== */}
      {isSignInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-2xl text-left">
            <button
              type="button"
              onClick={() => setIsSignInOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Sign In to Your Feed</h2>
                <p className="text-xs text-slate-500">Enter credentials to open your campus event feed</p>
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Campus Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@cascade.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-700 font-medium">Password</label>
                  <span className="text-[11px] text-slate-500 font-mono">Password123!</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm"
              >
                Sign In & Enter Feed
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                1-Click Demo Profiles:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickDemoLogin('alex.rivera@cascade.edu', 'Password123!')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-semibold text-slate-900">Alex Rivera</div>
                  <div className="text-[11px] text-indigo-600 font-medium">Student Profile</div>
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickDemoLogin('acm@cascade.edu', 'Password123!')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-200 text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-semibold text-slate-900">Cascade ACM</div>
                  <div className="text-[11px] text-amber-700 font-medium">Organizer Profile</div>
                </button>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                onClick={() => setIsSignInOpen(false)}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create student account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          CAMPUS ECOSYSTEM & TRUST TICKER
          =================================================================== */}
      <section className="border-y border-slate-200 bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Participating Institutions:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-8 font-medium text-slate-700">
            <span className="hover:text-slate-900 transition-colors">Cascade Polytechnic</span>
            <span className="text-slate-300">•</span>
            <span className="hover:text-slate-900 transition-colors">Northbridge University</span>
            <span className="text-slate-300">•</span>
            <span className="hover:text-slate-900 transition-colors">St. Jude College of Art & Design</span>
            <span className="text-slate-300">•</span>
            <span className="hover:text-slate-900 transition-colors">Apex Institute of Technology</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono">Live Cross-Campus Sync</span>
          </div>
        </div>
      </section>

      {/* ===================================================================
          CORE VALUE: DUAL SCORE PHILOSOPHY
          =================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            The EventRank Standard
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Why One Universal Score Fails Students
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            A robotics hackathon can have immaculate organization, yet be totally irrelevant to a fine arts major.
            EventRank never conflates <em>overall quality</em> with <em>personal alignment</em>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Event Quality Score */}
          <div className="p-8 rounded-3xl border border-emerald-200 bg-white shadow-xs hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  Objective Invariant
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Event Quality Score</h3>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-xl">
                8.7<span className="text-xs text-emerald-600">/10</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Calculated using Bayesian shrinkage of verified attendee reviews, organizer track records, and historical edition performance. Popularity alone never inflates this score.
            </p>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Organizer Historical Reputation
                </span>
                <span className="text-emerald-700 font-mono font-semibold">92% High</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Attendee Dimension Reviews
                </span>
                <span className="text-emerald-700 font-mono font-semibold">8.9 / 10.0</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <Star className="w-4 h-4 text-emerald-600" />
                  Zero-Hype Bayesian Correction
                </span>
                <span className="text-emerald-700 font-mono font-semibold">Active (Prior k=5)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Fit for You */}
          <div className="p-8 rounded-3xl border border-purple-200 bg-white shadow-xs hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 font-mono">
                  Personal Invariant
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Fit for You Score</h3>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-mono font-bold text-xl">
                9.4<span className="text-xs text-purple-600">/10</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Personalized specifically to your profile: academic department, technical skills, target experience level, career interests, and departmental peer attendance cohorts.
            </p>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  Department & Major Alignment
                </span>
                <span className="text-purple-700 font-mono font-semibold">95% Match</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <Zap className="w-4 h-4 text-purple-600" />
                  Skill & Prerequisite Overlap
                </span>
                <span className="text-purple-700 font-mono font-semibold">Python, AI, React</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <Users className="w-4 h-4 text-purple-600" />
                  Department Peer Interest Cohort
                </span>
                <span className="text-purple-700 font-mono font-semibold">18 Classmates Attending</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          HOW IT WORKS / TRUST ARCHITECTURE
          =================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              End-to-End Integrity at Every Step
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Engineered with strict multi-college security, privacy boundaries, and verified participation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold font-mono">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Cross-Campus Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse hackathons, technical symposiums, and cultural festivals hosted by both your college and authorized partner campuses.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold font-mono">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Verified Attendance Check-In</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check in physically or via organizer tokens. Unverified attendees cannot post reviews, eliminating fake ratings and spam.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold font-mono">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Privacy-Safe Peer Signals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                See aggregated peer counts from your college and department without exposing personal attendee lists or compromising privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          BOTTOM CALL TO ACTION BANNER
          =================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 shadow-sm text-center space-y-6 relative overflow-hidden">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-100 text-indigo-700 mb-2">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Ready to Discover Events That Actually Matter?
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Sign in with your campus credentials to personalize your feed, compare upcoming editions side-by-side, and claim your registration.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              onClick={() => navigate('/discover')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 shadow-sm"
            >
              <span>Explore Live Event Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium shadow-xs transition-all cursor-pointer"
            >
              Sign In with Campus ID
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
