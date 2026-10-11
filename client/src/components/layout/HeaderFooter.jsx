import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { Sparkles, Layers, User, LogOut, Calendar, PlusCircle } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCompare();

  const isOrganizer = user?.collegeRole === 'organizer' || user?.collegeRole === 'college_admin' || user?.globalRole === 'platform_admin';

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#0a0d14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">Event<span className="text-indigo-400">Rank</span></span>
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400 border border-white/5">
              Multi-College
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-4 text-xs font-medium">
          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            Discover
          </NavLink>

          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare</span>
            {count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-600 text-white font-bold">
                {count}
              </span>
            )}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/registrations"
                className={({ isActive }) =>
                  `hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>My Events</span>
              </NavLink>

              {isOrganizer && (
                <NavLink
                  to="/organizer"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive ? 'text-indigo-300 bg-indigo-500/10' : 'text-slate-300 hover:text-indigo-300 hover:bg-white/5'
                    }`
                  }
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Organizer</span>
                </NavLink>
              )}

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
              </NavLink>

              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all font-medium"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#07090e] text-slate-400 py-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">EventRank</span>
          <span>— Multi-College Event Discovery & Decision Support</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Strict separation of Event Quality (Bayesian) & Fit for You (Personalized).
        </div>
      </div>
    </footer>
  );
}
