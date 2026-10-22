import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Loader2,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard({ onNavigateToScanner }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/dashboard/stats');
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 size={32} className="spin-icon" />
        <p>Loading threat analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner">
        <AlertTriangle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const total = stats?.totalScans || 0;
  const safePct = total ? Math.round((stats.safeCount / total) * 100) : 0;
  const suspPct = total ? Math.round((stats.suspiciousCount / total) * 100) : 0;
  const phishPct = total ? Math.round((stats.phishingCount / total) * 100) : 0;

  return (
    <div className="dashboard-container">
      <div className="section-header">
        <div className="header-title">
          <LayoutDashboard size={26} />
          <h2>Threat Intelligence Overview</h2>
        </div>
        <p className="header-subtitle">
          Real-time aggregate telemetry of all scans analyzed by your detection engine.
        </p>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Links Analyzed</span>
            <span className="stat-value">{total}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon safe">
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Safe Domains</span>
            <span className="stat-value safe-text">{stats?.safeCount || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon suspicious">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Suspicious Links</span>
            <span className="stat-value susp-text">{stats?.suspiciousCount || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon phishing">
            <ShieldAlert size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Phishing Intercepted</span>
            <span className="stat-value phish-text">{stats?.phishingCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Threat Distribution Visualizer */}
      <div className="distribution-card">
        <div className="distribution-header">
          <h3>Threat Category Distribution</h3>
          <span className="total-badge">{total} Cumulative Scans</span>
        </div>

        {total === 0 ? (
          <div className="empty-state mini">
            <p>No scans recorded yet. Scan a URL to view threat distribution analytics.</p>
            <button className="action-btn" onClick={onNavigateToScanner}>
              Run First Analysis
            </button>
          </div>
        ) : (
          <>
            <div className="distribution-bar">
              <div
                className="bar-segment safe"
                style={{ width: `${safePct}%` }}
                title={`Safe: ${safePct}%`}
              />
              <div
                className="bar-segment suspicious"
                style={{ width: `${suspPct}%` }}
                title={`Suspicious: ${suspPct}%`}
              />
              <div
                className="bar-segment phishing"
                style={{ width: `${phishPct}%` }}
                title={`Phishing: ${phishPct}%`}
              />
            </div>

            <div className="distribution-legend">
              <div className="legend-item">
                <span className="legend-dot safe" />
                <span>Safe Domains: <strong>{safePct}%</strong> ({stats.safeCount})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot suspicious" />
                <span>Suspicious: <strong>{suspPct}%</strong> ({stats.suspiciousCount})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot phishing" />
                <span>Phishing Threats: <strong>{phishPct}%</strong> ({stats.phishingCount})</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}