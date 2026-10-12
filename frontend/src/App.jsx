
import { useState } from "react";
import "./App.css";

const createMockResult = (url) => ({
  id: "demo-scan-001",
  url,
  riskScore: 87,
  verdict: "Phishing",
  flags: [
    { label: "No HTTPS", severity: "high" },
    { label: "Recently registered domain", severity: "high" },
    { label: "Similar to a known brand", severity: "high" },
    { label: "Suspicious URL patterns", severity: "medium" },
  ],
  scannedAt: new Date().toISOString(),
});

function App() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [scanResult, setScanResult] = useState(null);

  const handleScan = () => {
    setError("");
    setMessage("");
    setScanResult(null);

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please enter a URL.");
      return;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (
        !["http:", "https:"].includes(parsedUrl.protocol) ||
        !parsedUrl.hostname.includes(".")
      ) {
        throw new Error("Invalid URL");
      }

      setMessage("URL format is valid. Showing simulated results.");

      // DEMO ONLY: Replace this mock with POST /api/scan
      // when the backend is ready. This is not a real verdict.
      setScanResult(createMockResult(parsedUrl.href));
    } catch {
      setError("Please enter a valid HTTP or HTTPS URL.");
    }
  };

  const handleScanAgain = () => {
    setUrl("");
    setError("");
    setMessage("");
    setScanResult(null);
  };

  const getVerdictClass = (verdict) =>
    verdict.toLowerCase();

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">PHISHGUARD</div>

        <div className="nav-links">
          <button type="button">Scan</button>
          <button type="button" disabled>
            History
          </button>
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
              type="text"
              inputMode="url"
              className={
                error
                  ? "invalid-input"
                  : message
                    ? "valid-input"
                    : ""
              }
              placeholder="https://example.com"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setError("");
                setMessage("");
                setScanResult(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleScan();
              }}
            />

            {error && (
              <p className="error-message">{error}</p>
            )}

            {message && (
              <p className="success-message">{message}</p>
            )}

            <button
              type="button"
              className="scan-button"
              onClick={handleScan}
            >
              Scan URL
            </button>

            {scanResult && (
              <section className="result-panel">
                <p className="result-label">SCAN RESULT</p>

                <h2>URL Analysis Report</h2>

                <p className="result-url">{scanResult.url}</p>

                <div className="demo-notice">
                  DEMO MODE — NOT A REAL SECURITY SCAN
                </div>

                <div className="risk-card">
                  <div className="risk-score-area">
                    <p className="detail-label">RISK SCORE</p>

                    <h3 className="risk-score">
                      {scanResult.riskScore}
                      <span> / 100</span>
                    </h3>

                    <div
                      className="risk-meter"
                      role="progressbar"
                      aria-label="Simulated risk score"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={scanResult.riskScore}
                    >
                      <div className="risk-meter-track">
                        <div
                          className={`risk-meter-fill ${getVerdictClass(
                            scanResult.verdict
                          )}`}
                          style={{
                            width: `${scanResult.riskScore}%`,
                          }}
                        />
                      </div>
                      <p>Simulated score for demonstration</p>
                    </div>
                  </div>

                  <div
                    className={`risk-badge ${getVerdictClass(
                      scanResult.verdict
                    )}`}
                  >
                    {scanResult.verdict.toUpperCase()}
                  </div>
                </div>

                <div
                  className={`result-status ${getVerdictClass(
                    scanResult.verdict
                  )}`}
                >
                  Simulated verdict: {scanResult.verdict}
                </div>

                <div className="detection-section">
                  <h3>Detection Details</h3>

                  {scanResult.flags.length === 0 ? (
                    <p className="result-note">
                      No simulated warning flags.
                    </p>
                  ) : (
                    scanResult.flags.map((flag, index) => (
                      <div
                        className="detection-row"
                        key={`${flag.label}-${index}`}
                      >
                        <span>{flag.label}</span>

                        <span
                          className={`severity-badge ${flag.severity}`}
                        >
                          <span className="status-dot" />
                          {flag.severity}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <p className="result-note">
                  All scores, verdicts, and flags shown here are
                  mock data. They do not describe the actual
                  safety of the submitted URL. Real analysis
                  requires the backend API.
                </p>

                <p className="scan-timestamp">
                  Demo timestamp:{" "}
                  {new Date(scanResult.scannedAt).toLocaleString()}
                </p>

                <button
                  type="button"
                  className="scan-again-button"
                  onClick={handleScanAgain}
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
