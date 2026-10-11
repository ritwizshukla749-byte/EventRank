import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header, Footer } from './HeaderFooter';
import { ComparePanel } from '../compare/ComparePanel';
import { ErrorBoundary } from '../common/ErrorBoundary';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <ComparePanel />
      <Footer />
    </div>
  );
}
