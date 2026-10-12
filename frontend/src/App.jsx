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

    <h2>Demonstration Result</h2>

    <p className="result-url">{scanResult.url}</p>

    <div className="result-status">
      Awaiting real phishing analysis
    </div>

    <p className="result-note">
      This is a demonstration interface. No security verdict
      has been generated for this URL.
    </p>
  </section>
)}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;