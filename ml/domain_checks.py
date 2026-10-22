"""
Domain-level checks that sit on top of the ML model:
  - domain age, looked up live through RDAP
  - brand impersonation / typosquatting against a list of well-known brands
"""
import re
import time
from datetime import datetime, timezone

import requests
import tldextract

# brand name -> official domains (the first one is shown to the user)
BRANDS = {
    "paypal": ["paypal.com"],
    "google": ["google.com", "google.co.in"],
    "mongodb": ["mongodb.com"],
    "facebook": ["facebook.com"],
    "instagram": ["instagram.com"],
    "whatsapp": ["whatsapp.com"],
    "amazon": ["amazon.com", "amazon.in", "amazon.co.uk"],
    "apple": ["apple.com"],
    "microsoft": ["microsoft.com"],
    "netflix": ["netflix.com"],
    "linkedin": ["linkedin.com"],
    "twitter": ["twitter.com"],
    "github": ["github.com"],
    "dropbox": ["dropbox.com"],
    "ebay": ["ebay.com"],
    "yahoo": ["yahoo.com"],
    "paytm": ["paytm.com"],
    "flipkart": ["flipkart.com"],
    "hdfcbank": ["hdfcbank.com"],
    "icicibank": ["icicibank.com"],
     "adobe": ["adobe.com"],
    "outlook": ["outlook.com"],
    "onedrive": ["onedrive.live.com"],
    "telegram": ["telegram.org"],
    "spotify": ["spotify.com"],
    "discord": ["discord.com"],
    "zoom": ["zoom.us"],
    "roblox": ["roblox.com"],
    "steam": ["steampowered.com"],
    "samsung": ["samsung.com"],
    "nintendo": ["nintendo.com"],
    "booking": ["booking.com"],
    "airbnb": ["airbnb.com"],
    "dhl": ["dhl.com"],
    "fedex": ["fedex.com"],
    "ups": ["ups.com"],
    "visa": ["visa.com"],
    "mastercard": ["mastercard.com"],
    "americanexpress": ["americanexpress.com"],
    "coinbase": ["coinbase.com"],
    "binance": ["binance.com"],
     "sbi": ["sbi.co.in"],
    "axisbank": ["axisbank.com"],
    "kotak": ["kotak.com"],
    "bankofbaroda": ["bankofbaroda.in"],
    "pnb": ["pnbindia.in"],
    "canarabank": ["canarabank.com"],
    "irctc": ["irctc.co.in"],
    "uidai": ["uidai.gov.in"],
    "incometax": ["incometax.gov.in"],


}
OFFICIAL_DOMAINS = {d for domains in BRANDS.values() for d in domains}

# characters attackers swap in to imitate letters (1 can pass for l or i)
_SUBSTITUTIONS = [
    {"0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s"},
    {"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s"},
]


def _normalized_variants(text):
    variants = set()
    for table in _SUBSTITUTIONS:
        swapped = text.translate(str.maketrans(table))
        variants.add(swapped)
        variants.add(swapped.replace("rn", "m").replace("vv", "w"))
    return variants


def _edit_distance(a, b):
    """Number of single-character edits needed to turn a into b."""
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        curr = [i]
        for j, cb in enumerate(b, 1):
            curr.append(min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = curr
    return prev[-1]


def _registered_domain(url):
    ext = tldextract.extract(url)
    if not ext.domain or not ext.suffix:
        return None  # IP address or malformed host
    return f"{ext.domain}.{ext.suffix}".lower()


def is_official_domain(url):
    return _registered_domain(url) in OFFICIAL_DOMAINS


def check_brand_impersonation(url):
    """Returns {'label', 'severity'} if the URL imitates a known brand, else None."""
    ext = tldextract.extract(url)
    if not ext.domain or not ext.suffix:
        return None

    registered = f"{ext.domain}.{ext.suffix}".lower()
    if registered in OFFICIAL_DOMAINS:
        return None

    hostname = ".".join(p for p in (ext.subdomain, ext.domain, ext.suffix) if p).lower()
    label = ext.domain.lower()
    compact = label.replace("-", "")
    sub_labels = [s for s in ext.subdomain.lower().split(".") if s]

    # every word-like piece of the hostname we want to compare against brands
    pieces = set(label.split("-"))
    for s in sub_labels:
        pieces.add(s)
        pieces.add(s.replace("-", ""))
        pieces.update(s.split("-"))
    pieces.discard("")
    disguise_candidates = pieces | {compact}

    # brands that own this label on another TLD (google.de, amazon.de) are skipped
    brands = {b: d for b, d in BRANDS.items() if label != b}

    # 1. the brand's real address buried inside a longer hostname
    for domains in brands.values():
        for d in domains:
            if re.search(rf"(^|\.){re.escape(d)}(\.|$)", hostname):
                return {"label": f"Mimics {d} using a different domain", "severity": "high"}

    # 2. a disguised spelling of the brand name
    for brand, domains in brands.items():
        official = domains[0]
        if compact == brand and label != brand:  # pay-pal.com
            return {"label": f"Looks like a misspelling of {official}", "severity": "high"}
        for cand in disguise_candidates:
            if cand == brand:
                continue
            if brand in _normalized_variants(cand):
                return {"label": f"Looks like a misspelling of {official}", "severity": "high"}
            if len(brand) >= 6:
                limit = 1 if len(brand) < 8 else 2
                if _edit_distance(cand, brand) <= limit:
                    return {"label": f"Looks like a misspelling of {official}", "severity": "high"}

    # 3. the exact brand name used on an unrelated domain
    for brand, domains in brands.items():
        if brand in pieces:
            return {
                "label": f"Uses the name '{brand}' but is not {domains[0]}",
                "severity": "medium",
            }

    return None


# ---------------- domain age via RDAP ----------------

_age_cache = {}  # registered domain -> (expires_at, age_in_days or None)
_CACHE_OK_SECONDS = 24 * 3600
_CACHE_FAIL_SECONDS = 600


def _lookup_age_days(domain):
    try:
        resp = requests.get(
            f"https://rdap.org/domain/{domain}",
            timeout=4,
            headers={"Accept": "application/rdap+json"},
        )
        if resp.status_code != 200:
            return None
        for event in resp.json().get("events", []):
            if event.get("eventAction") == "registration":
                registered_at = datetime.fromisoformat(event["eventDate"].replace("Z", "+00:00"))
                if registered_at.tzinfo is None:
                    registered_at = registered_at.replace(tzinfo=timezone.utc)
                return max((datetime.now(timezone.utc) - registered_at).days, 0)
    except Exception:
        return None
    return None


def get_domain_age_days(url):
    """Age of the domain in days, or None if it can't be determined."""
    domain = _registered_domain(url)
    if not domain:
        return None

    try:
        domain = domain.encode("idna").decode("ascii")
    except UnicodeError:
        return None
    if not re.fullmatch(r"[a-z0-9.-]+", domain):
        return None  # never put odd characters into the lookup address

    cached = _age_cache.get(domain)
    if cached and cached[0] > time.time():
        return cached[1]

    age = _lookup_age_days(domain)
    if len(_age_cache) > 5000:
        _age_cache.clear()
    ttl = _CACHE_OK_SECONDS if age is not None else _CACHE_FAIL_SECONDS
    _age_cache[domain] = (time.time() + ttl, age)
    return age