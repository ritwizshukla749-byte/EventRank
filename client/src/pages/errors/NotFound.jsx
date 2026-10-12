import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { SearchX, Home, Compass, Layers, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        {/* 404 Visual */}
        <div className="flex justify-center">
          <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200">
            <SearchX className="w-16 h-16 text-slate-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">404 – Page Not Found</h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            {location.pathname && (
              <span className="block mt-2 text-sm font-mono text-slate-400">
                Path: {location.pathname}
              </span>
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/discover">
              <Button variant="primary" className="gap-2">
                <Compass className="w-4 h-4" />
                <span>Discover Events</span>
              </Button>
            </Link>
            <Link to="/compare">
              <Button variant="secondary" className="gap-2">
                <Layers className="w-4 h-4" />
                <span>Compare Events</span>
              </Button>
            </Link>
          </div>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-3">Popular Sections:</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              Home
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/discover" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              Discover
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/profile" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              My Profile
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/registrations" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              My Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
