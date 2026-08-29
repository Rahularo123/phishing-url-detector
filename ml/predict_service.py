from flask import Flask, request, jsonify
import pandas as pd
import joblib
from features import extract_features

app = Flask(__name__)


model = joblib.load('phishing_model.joblib')
model_columns = joblib.load('model_columns.joblib')


TOP_TLDS = [c.replace('tld_', '', 1) for c in model_columns
            if c.startswith('tld_') and c != 'tld_other']


def prepare_input(url):
    """Extracts features from a URL and arranges them into the exact
    column shape/order the trained model expects."""
    feats = extract_features(url)
    tld = feats.pop('tld')
    tld = tld if tld in TOP_TLDS else 'other'

    
    row = {col: 0 for col in model_columns}
    for key, value in feats.items():
        if key in row:
            row[key] = value

    tld_col = f'tld_{tld}'
    row[tld_col if tld_col in row else 'tld_other'] = 1

    df_row = pd.DataFrame([row], columns=model_columns)
    return df_row, feats


def generate_flags(feats):
    """Simple, explainable rule-based flags built directly from the
    extracted features -- this is our 'explainability' layer."""
    flags = []
    if feats['has_https'] == 0:
        flags.append({"label": "No HTTPS", "severity": "high"})
    if feats['has_ip'] == 1:
        flags.append({"label": "Uses an IP address instead of a domain name", "severity": "high"})
    if feats['suspicious_word_count'] >= 2:
        flags.append({"label": "Multiple suspicious keywords in URL", "severity": "medium"})
    if feats['num_subdomains'] >= 3:
        flags.append({"label": "Unusually high number of subdomains", "severity": "medium"})
    if feats['num_special_chars'] >= 3:
        flags.append({"label": "High number of special characters", "severity": "low"})
    return flags


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url = data.get('url') if data else None

    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        df_row, feats = prepare_input(url)

       
        probability = model.predict_proba(df_row)[0][1]
        risk_score = round(probability * 100)

        if risk_score < 40:
            verdict = "Safe"
        elif risk_score < 70:
            verdict = "Suspicious"
        else:
            verdict = "Phishing"

        flags = generate_flags(feats)

        return jsonify({
            "riskScore": risk_score,
            "verdict": verdict,
            "flags": flags
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5002)