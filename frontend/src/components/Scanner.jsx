import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const SAMPLE_URLS = [
  { label: 'Legitimate Site', url: 'https://www.google.com', expected: 'safe' },
  { label: 'Typosquatting Attack', url: 'http://paypa1-secure-login.com', expected: 'phishing' },
  { label: 'Suspicious IP Address', url: 'http://192.168.1.1/banking/login', expected: 'suspicious' },
];

export default function Scanner({ onOpenAuth }) {
  const { isAuthenticated } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async (targetUrl = url) => {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      setError('Please enter a URL to scan');
      return;
    }

    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await apiRequest('/api/scan', {
        method: 'POST',
        body: { url: cleanUrl },
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Scanning failed. Please make sure the backend and ML services are running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleUrl) => {
    setUrl(sampleUrl);
    handleScan(sampleUrl);
  };

  const getVerdictTheme = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'safe':
        return {
          color: '#10b981',
          bg: '#ecfdf5',
          border: '#a7f3d0',
          badgeText: 'VERIFIED SAFE',
          icon: ShieldCheck,
          description: 'This URL shows no detectable signs of malicious intent or impersonation.',
        };
      case 'suspicious':
        return {
          color: '#f59e0b',
          bg: '#fffbeb',
          border: '#fde68a',
          badgeText: 'SUSPICIOUS LINK',
          icon: AlertTriangle,
          description: 'This URL has suspicious structural patterns or questionable indicators. Proceed with caution.',
        };
      case 'phishing':
      default:
        return {
          color: '#ef4444',
          bg: '#fef2f2',
          border: '#fecaca',
          badgeText: 'PHISHING DETECTED',
          icon: ShieldAlert,
          description: 'High confidence phishing threat detected. This URL poses a severe risk of data or credential theft.',
        };
    }
  };

  const theme = result ? getVerdictTheme(result.verdict) : null;
  const VerdictIcon = theme?.icon || Shield;

  return (
    <div className="scanner-container">
      {/* Hero Header */}
      <div className="scanner-hero">
        <div className="hero-shield">
          <Shield size={44} />
        </div>
        <h1>Real-Time Phishing Threat Detector</h1>
        <p className="hero-subtitle">
          Multi-layer URL analysis powered by Machine Learning, Homoglyph Detection & Live Domain Intelligence.
        </p>
      </div>

      {/* Main Scan Input Card */}
      <div className="scan-input-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="scan-form"
        >
          <div className="url-input-wrapper">
            <Lock size={20} className="url-icon" />
            <input
              type="text"
              placeholder="Paste any link to inspect (e.g. https://example.com)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="url-input"
            />
            {url && (
              <button
                type="button"
                className="clear-input-btn"
                onClick={() => setUrl('')}
                disabled={loading}
              >
                ✕
              </button>
            )}
          </div>

          <button type="submit" className="scan-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="spin-icon" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Inspect URL</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Link Shortcuts */}
        <div className="sample-links-bar">
          <span className="sample-links-label">Quick Demo URLs:</span>
          <div className="sample-buttons">
            {SAMPLE_URLS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className={`sample-pill ${sample.expected}`}
                onClick={() => handleSampleClick(sample.url)}
                disabled={loading}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="scan-error-alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!isAuthenticated && (
          <div className="auth-reminder-banner">
            <span>💡 Please sign in to scan links and save them to your scan history.</span>
            <button type="button" onClick={onOpenAuth} className="link-action-btn">
              Sign In now
            </button>
          </div>
        )}
      </div>

      {/* Scan Results Panel */}
      {result && (
        <div className="results-panel">
          {/* Top Result Banner */}
          <div
            className="verdict-banner"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
            }}
          >
            <div className="verdict-header">
              <div className="verdict-badge" style={{ backgroundColor: theme.color }}>
                <VerdictIcon size={20} />
                <span>{theme.badgeText}</span>
              </div>
              <span className="scanned-timestamp">
                Scanned {new Date(result.scannedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="verdict-target-url">
              <code>{result.url}</code>
            </div>

            <p className="verdict-summary" style={{ color: theme.color }}>
              {theme.description}
            </p>
          </div>

          {/* Risk Score Gauge & Stats Grid */}
          <div className="results-grid">
            {/* Risk Gauge Card */}
            <div className="result-metric-card">
              <h3>Calculated Threat Score</h3>
              <div className="score-meter-box">
                <div
                  className="score-circle"
                  style={{
                    borderColor: theme.color,
                    boxShadow: `0 0 25px ${theme.border}`,
                  }}
                >
                  <span className="score-number" style={{ color: theme.color }}>
                    {result.riskScore}
                  </span>
                  <span className="score-denominator">/ 100</span>
                </div>
              </div>
              <p className="score-caption">
                {result.riskScore < 40
                  ? 'Low threat probability'
                  : result.riskScore < 70
                  ? 'Elevated risk parameters'
                  : 'Critical threat signature'}
              </p>
            </div>

            {/* Explainable Threat Flags Card */}
            <div className="result-flags-card">
              <h3>Explainability & Risk Breakdown ({result.flags?.length || 0})</h3>
              {(!result.flags || result.flags.length === 0) ? (
                <div className="clean-flags-state">
                  <CheckCircle2 size={32} color="#10b981" />
                  <p>No malicious indicators or anomalies were detected for this URL.</p>
                </div>
              ) : (
                <ul className="flags-list">
                  {result.flags.map((flag, idx) => (
                    <li key={idx} className={`flag-item severity-${flag.severity || 'medium'}`}>
                      <div className="flag-dot" />
                      <div className="flag-content">
                        <span className="flag-label">{flag.label}</span>
                        <span className="flag-severity-tag">
                          {flag.severity?.toUpperCase()} SEVERITY
                        </span>
                      </div>
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