import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header, Footer } from './HeaderFooter';
import { ComparePanel } from '../compare/ComparePanel';
import { ErrorBoundary } from '../common/ErrorBoundary';

export function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
      <Header />
      <main className={`flex-1 w-full ${isLanding ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12'}`}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <ComparePanel />
      <Footer />
    </div>
  );
}
