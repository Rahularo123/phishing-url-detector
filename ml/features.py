import re
from urllib.parse import urlparse
import tldextract

def extract_features(url):
    """
    Takes a raw URL string and returns a dictionary of numeric/boolean
    features derived purely from the URL itself -- no live page fetch.
    """
    features = {}

    parsed = urlparse(url)
    ext = tldextract.extract(url)

    
    features['url_length'] = len(url)
    features['num_dots'] = url.count('.')
    features['num_hyphens'] = url.count('-')
    features['num_at'] = url.count('@')
    features['num_subdomains'] = len(ext.subdomain.split('.')) if ext.subdomain else 0

    
    features['has_https'] = 1 if parsed.scheme == 'https' else 0

  
    ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
    features['has_ip'] = 1 if re.match(ip_pattern, parsed.netloc.split(':')[0]) else 0

    
    suspicious_words = ['login', 'verify', 'secure', 'account', 'update',
                         'confirm', 'banking', 'signin', 'password']
    url_lower = url.lower()
    features['suspicious_word_count'] = sum(1 for word in suspicious_words if word in url_lower)

  
    after_scheme = url.split('://', 1)[-1]
    features['num_digits'] = sum(c.isdigit() for c in url)
    features['num_special_chars'] = len(re.findall(r'[%$&+,:;=?@#|<>^*()\[\]{}]', after_scheme))

    # --- TLD ---
    features['tld'] = ext.suffix

    return features


if __name__ == '__main__':
    
    test_urls = [
        'https://www.google.com',
        'http://192.168.1.1/login/verify-account',
        'http://paypa1-secure-login.com/update-account-info',
    ]
    for u in test_urls:
        print(u)
        print(extract_features(u))
        print()