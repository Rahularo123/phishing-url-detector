from flask import Flask, request, jsonify
import pandas as pd
import joblib
from features import extract_features
from domain_checks import get_domain_age_days, check_brand_impersonation, is_official_domain

app = Flask(__name__)


import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, 'phishing_model.joblib'))
model_columns = joblib.load(os.path.join(BASE_DIR, 'model_columns.joblib'))


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

SEVERITY_ORDER = {"high": 0, "medium": 1, "low": 2}


def plural(n, word):
    return f"{n} {word}" if n == 1 else f"{n} {word}s"


def apply_domain_checks(url, risk_score, flags):
    """Second layer on top of the model: brand impersonation + domain age."""
    if is_official_domain(url):
        return risk_score, flags

    brand_flag = check_brand_impersonation(url)
    if brand_flag:
        flags.append(brand_flag)
        floor = 85 if brand_flag["severity"] == "high" else 60
        risk_score = max(risk_score, floor)

    age_days = get_domain_age_days(url)
    if age_days is not None:
        if age_days < 30:
            label = "Domain registered today" if age_days == 0 else f"Domain registered {plural(age_days, 'day')} ago"
            flags.append({"label": label, "severity": "high"})
            risk_score = min(risk_score + 20, 100)
        elif age_days < 180:
            flags.append({"label": "Domain registered less than 6 months ago", "severity": "medium"})
            risk_score = min(risk_score + 10, 100)

    flags.sort(key=lambda f: SEVERITY_ORDER[f["severity"]])
    return risk_score, flags


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
        flags = generate_flags(feats)

        risk_score, flags = apply_domain_checks(url, risk_score, flags)

        if risk_score < 40:
            verdict = "Safe"
        elif risk_score < 70:
            verdict = "Suspicious"
        else:
            verdict = "Phishing"

        return jsonify({
            "riskScore": risk_score,
            "verdict": verdict,
            "flags": flags
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002)