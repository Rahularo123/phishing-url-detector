import pandas as pd


df = pd.read_csv('data/PhiUSIIL_Phishing_URL_Dataset.csv')


print("Shape (rows, columns):", df.shape)
print("\nColumn names:")
print(df.columns.tolist())

print("\nFirst 5 rows:")
print(df.head())

print("\nLabel column value counts:")
print(df['label'].value_counts())

print("\nMissing values per column (top 10):")
print(df.isnull().sum().sort_values(ascending=False).head(10))