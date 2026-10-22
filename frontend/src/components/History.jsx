import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  History as HistoryIcon,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Calendar,
  X,
  Search,
} from 'lucide-react';

export default function History({ onNavigateToScanner }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/api/history');
      setScans(data);
    } catch (err) {
      setError(err.message || 'Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;

    try {
      await apiRequest(`/api/history/${id}`, { method: 'DELETE' });
      setScans((prev) => prev.filter((s) => s.id !== id));
      if (selectedScan?.id === id) setSelectedScan(null);
    } catch (err) {
      alert(err.message || 'Could not delete scan record');
    }
  };

  const handleRowClick = async (scan) => {
    try {
      setDetailLoading(true);
      const fullScan = await apiRequest(`/api/history/${scan.id}`);
      setSelectedScan(fullScan);
    } catch {
      setSelectedScan(scan); // Fallback to basic row data
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredScans = scans.filter((s) =>
    s.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeStyle = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'safe':
        return { color: '#10b981', bg: '#ecfdf5', icon: ShieldCheck };
      case 'suspicious':
        return { color: '#f59e0b', bg: '#fffbeb', icon: AlertTriangle };
      case 'phishing':
      default:
        return { color: '#ef4444', bg: '#fef2f2', icon: ShieldAlert };
    }
  };

  return (
    <div className="history-container">
      <div className="section-header">
        <div className="header-title">
          <HistoryIcon size={26} />
          <h2>Security Audit & Scan History</h2>
        </div>
        <p className="header-subtitle">
          All links analyzed during your active sessions, stored in MongoDB Atlas.
        </p>
      </div>

      {/* Search Bar */}
      <div className="history-search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Filter scans by URL or domain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 size={32} className="spin-icon" />
          <p>Retrieving scan history from database...</p>
        </div>
      ) : error ? (
        <div className="error-banner">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="empty-state">
          <HistoryIcon size={48} className="empty-icon" />
          <h3>No Scans Found</h3>
          <p>
            {searchTerm
              ? 'No historical scans match your search query.'
              : 'You have not scanned any URLs yet.'}
          </p>
          <button className="action-btn" onClick={onNavigateToScanner}>
            Scan Your First Link
          </button>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Target URL</th>
                <th>Verdict</th>
                <th>Threat Score</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((scan) => {
                const badge = getBadgeStyle(scan.verdict);
                const Icon = badge.icon;
                return (
                  <tr
                    key={scan.id}
                    onClick={() => handleRowClick(scan)}
                    className="history-row"
                  >
                    <td className="url-cell" title={scan.url}>
                      <span className="url-text">{scan.url}</span>
                    </td>
                    <td>
                      <span
                        className="verdict-pill"
                        style={{ color: badge.color, backgroundColor: badge.bg }}
                      >
                        <Icon size={14} />
                        {scan.verdict}
                      </span>
                    </td>
                    <td>
                      <span className="risk-number" style={{ color: badge.color }}>
                        {scan.riskScore} / 100
                      </span>
                    </td>
                    <td className="time-cell">
                      <Calendar size={14} />
                      {new Date(scan.scannedAt).toLocaleDateString()} at{' '}
                      {new Date(scan.scannedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <button
                        className="delete-icon-btn"
                        onClick={(e) => handleDelete(scan.id, e)}
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed Scan Inspection Modal */}
      {selectedScan && (
        <div className="modal-overlay" onClick={() => setSelectedScan(null)}>
          <div className="modal-card detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Historical Scan Breakdown</h2>
              <button className="close-btn" onClick={() => setSelectedScan(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="detail-url-box">
              <label>Target URL:</label>
              <code>{selectedScan.url}</code>
            </div>

            <div className="detail-meta-grid">
              <div className="detail-stat">
                <span>Verdict</span>
                <strong>{selectedScan.verdict}</strong>
              </div>
              <div className="detail-stat">
                <span>Risk Score</span>
                <strong>{selectedScan.riskScore} / 100</strong>
              </div>
              <div className="detail-stat">
                <span>Scanned At</span>
                <strong>{new Date(selectedScan.scannedAt).toLocaleString()}</strong>
              </div>
            </div>

            <div className="detail-flags-section">
              <h4>Triggered Indicators & Explainability:</h4>
              {detailLoading ? (
                <div className="loading-state">
                  <Loader2 size={20} className="spin-icon" />
                  <span>Loading indicators...</span>
                </div>
              ) : !selectedScan.flags || selectedScan.flags.length === 0 ? (
                <p className="no-flags">No threat indicators triggered. URL passed all heuristics.</p>
              ) : (
                <ul className="detail-flags-list">
                  {selectedScan.flags.map((f, i) => (
                    <li key={i} className={`flag-badge severity-${f.severity}`}>
                      <span>{f.label}</span>
                      <small>{f.severity?.toUpperCase()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}