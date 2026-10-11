import React, { useEffect, useState } from 'react';
import { api } from './api/client';
import { ShieldCheck, Activity, Award, UserCheck, Layers, RefreshCw } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getHealth();
      setHealth(res.data);
    } catch (err) {
      setError(err.message || 'Unable to connect to EventRank API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <main className="container">
      {/* App Header */}
      <header className="app-header">
        <div>
          <span className="brand-badge">
            <Layers size={14} /> Multi-College Platform
          </span>
          <h1 className="app-title">EventRank</h1>
          <p className="app-subtitle">
            Discover events worth attending across participating colleges. Know why they’re worth it.
          </p>
        </div>

        <div>
          {loading ? (
            <span className="status-pill degraded">
              <span className="status-dot"></span> Checking API...
            </span>
          ) : error ? (
            <span className="status-pill degraded" title={error}>
              <span className="status-dot"></span> API Offline
            </span>
          ) : (
            <span className={`status-pill ${health?.status === 'ok' ? 'online' : 'degraded'}`}>
              <span className="status-dot"></span> API: {health?.status?.toUpperCase()} (DB: {health?.database?.status})
            </span>
          )}
        </div>
      </header>

      {/* Core Principle: Two Separate Scores */}
      <section aria-labelledby="core-scores-heading">
        <h2 id="core-scores-heading" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Dual-Score Decision Engine
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          EventRank never merges community quality and personal relevance into a single universal score.
        </p>

        <div className="scores-grid">
          {/* Event Quality Card */}
          <article className="score-card quality">
            <div className="score-header">
              <span className="score-type-label">Event Quality</span>
              <Award size={20} color="var(--quality-hue)" />
            </div>
            <div className="score-value">88<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/100</span></div>
            <p className="score-description">
              Community & historical evidence. Bayesian-smoothed review consensus combined with verified organizer track record.
            </p>
          </article>

          {/* Fit for You Card */}
          <article className="score-card fit">
            <div className="score-header">
              <span className="score-type-label">Fit for You</span>
              <UserCheck size={20} color="var(--fit-hue)" />
            </div>
            <div className="score-value">94<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/100</span></div>
            <p className="score-description">
              Personalized match for your profile, major, academic year, preferred event types, and schedule.
            </p>
          </article>
        </div>
      </section>

      {/* System Status & Invariants */}
      <section className="glass-card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--primary-500)" /> Phase 0 Initialization Status
          </h2>
          <button className="btn btn-secondary" onClick={fetchHealth} disabled={loading} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8125rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Connection
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Service</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{health?.service || 'eventrank-api'}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Version</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{health?.version || '0.1.0'}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Database State</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{health?.database?.status || 'awaiting connection'}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Environment</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>development</div>
          </div>
        </div>

        {/* Product Invariants Box */}
        <div className="invariants-box">
          <h3>
            <ShieldCheck size={18} color="var(--primary-500)" /> Non-Negotiable Architecture Invariants
          </h3>
          <ul className="invariants-list">
            <li>Multi-college scope: cross-college event discovery with institution-scoped organizer & admin boundaries.</li>
            <li>Dual scores strictly separated: Event Quality and Fit for You are independent 0–100 metrics.</li>
            <li>Verification integrity: verified attendance is required for official reviews; students cannot self-verify.</li>
            <li>Privacy-safe peer signals: aggregates default to same-college peers with minimum group-size thresholds.</li>
            <li>Score explainability: clear reason codes and honest insufficient-evidence states instead of invented ratings.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
