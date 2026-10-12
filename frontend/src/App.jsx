import { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
const [error, setError] = useState("");
const [message, setMessage] = useState("");
const [scanResult, setScanResult] = useState(null);

  const handleScan = () => {
  setError("");
  setMessage("");
setScanResult(null);
  if (!url.trim()) {
    setError("Please enter a URL.");
    return;
  }

  try {
    new URL(url);
    setMessage("URL format is valid. Demo result shown below.");
setScanResult({
  url: url.trim(),
  verdict: "DEMO",
  riskScore: null
});
  } catch {
    setError("Please enter a valid URL.");
  }
};

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">PHISHGUARD</div>

        <div className="nav-links">
          <button>Scan</button>
          <button>History</button>
        </div>
      </nav>

      <main className="scan-container">
        <div className="scan-card">
          <div className="shield">🛡️</div>

          <h1>Phishing URL Detector</h1>

          <p className="subtitle">
            Check a URL before you trust it.
          </p>

          <div className="input-section">
            <label htmlFor="url">Enter a URL</label>

            <input
              id="url"
              className={error ? "invalid-input" : message ? "valid-input" : ""}
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            {error && <p className="error-message">{error}</p>}

{message && <p className="success-message">{message}</p>}


            <button className="scan-button" onClick={handleScan}>
              Scan URL
            </button>
           
{scanResult && (
  <section className="result-panel">
    <p className="result-label">SCAN RESULT</p>

    <h2>URL Analysis Report</h2>

    <p className="result-url">{scanResult.url}</p>

    <div className="risk-card">
      <div>
        <p className="detail-label">RISK SCORE</p>
        <h3 className="risk-score">-- <span>/ 100</span></h3>
        <div className="risk-meter">
  <div className="risk-meter-track">
    <div className="risk-meter-fill" />
  </div>
  <p>Waiting for analysis data</p>
</div>
      </div>

      <div className="risk-badge">
        AWAITING ANALYSIS
      </div>
    </div>

    <div className="result-status">
      Analysis pending — no verdict available
    </div>

    <div className="detection-section">
      <h3>Detection Details</h3>

      
<div className="detection-row">
  <span>Domain reputation</span>
  <span className="pending-value">
    <span className="status-dot pending-dot" />
    Pending
  </span>
</div>
</div>
<div className="detection-row">
  <span>Suspicious URL patterns</span>
  <span className="pending-value">
    <span className="status-dot pending-dot" />
    Pending
  </span>
</div>

<div className="detection-row">
  <span>Phishing model prediction</span>
  <span className="pending-value">
    <span className="status-dot pending-dot" />
    Pending
  </span>
</div>


    <p className="result-note">
      This is a demonstration interface. The risk score and
      detection checks will be populated when the real analysis
      backend is connected.
    </p>
    
<button
  className="scan-again-button"
  onClick={() => {
    setUrl("");
    setError("");
    setMessage("");
    setScanResult(null);
  }}
>
  ← Scan Another URL
</button>

  </section>
)}

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;