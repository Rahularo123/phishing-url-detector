import pandas as pd
from features import extract_features


df = pd.read_csv('data/PhiUSIIL_Phishing_URL_Dataset.csv')


# In this dataset: label = 1 means legitimate, label = 0 means phishing.
# We want the opposite convention for our own target: 1 = phishing, 0 = legitimate.

df['target'] = df['label'].apply(lambda x: 1 if x == 0 else 0)

print("Target value counts (1 = phishing, 0 = legitimate):")
print(df['target'].value_counts())


print("\nExtracting features from all URLs")
feature_dicts = df['URL'].apply(extract_features)

features_df = pd.DataFrame(feature_dicts.tolist())

#We'll keep only the most common TLDs

top_tlds = features_df['tld'].value_counts().nlargest(15).index
features_df['tld'] = features_df['tld'].apply(lambda t: t if t in top_tlds else 'other')
features_df = pd.get_dummies(features_df, columns=['tld'], prefix='tld')

final_df = pd.concat([features_df, df['target']], axis=1)

print("\nFinal feature table shape:", final_df.shape)
print("\nColumns:", final_df.columns.tolist())
print("\nFirst 5 rows:")
print(final_df.head())

final_df.to_csv('data/processed_features.csv', index=False)
print("\nSaved to data/processed_features.csv")