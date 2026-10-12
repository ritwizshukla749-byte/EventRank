import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { Sparkles, Layers, User, LogOut, Calendar, PlusCircle, Bookmark } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCompare();

  const isOrganizer = user?.collegeRole === 'organizer' || user?.collegeRole === 'college_admin' || user?.globalRole === 'platform_admin';

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto pointer-events-auto rounded-full border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 px-4 sm:px-6 h-14 flex items-center justify-between transition-all duration-200">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center">
            <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900">
              Event<span className="text-indigo-600">Rank</span>
            </span>
            <span className="hidden md:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
              Multi-College
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full transition-colors ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`
            }
          >
            Discover
          </NavLink>

          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
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
                  `hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>My Events</span>
              </NavLink>

              <NavLink
                to="/saved"
                className={({ isActive }) =>
                  `hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                    isActive
                      ? 'text-amber-600 bg-amber-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved</span>
              </NavLink>

              {isOrganizer && (
                <NavLink
                  to="/organizer"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                      isActive
                        ? 'text-indigo-700 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                    }`
                  }
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Organizer</span>
                </NavLink>
              )}

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden md:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
              </NavLink>

              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 ml-1">
              <Link
                to="/login"
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-full transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all font-medium text-xs"
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
    <footer className="border-t border-slate-200 bg-white text-slate-600 py-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">EventRank</span>
          <span>— Multi-College Event Discovery & Decision Support</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Strict separation of Event Quality (Bayesian) & Fit for You (Personalized).
        </div>
      </div>
    </footer>
  );
}
