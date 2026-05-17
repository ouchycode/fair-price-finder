import pandas as pd

df = pd.read_csv('../data/raw/fastwork/fastwork_raw.csv')
print('Sebelum:', len(df))
df = df.drop_duplicates(subset=['url_listing'])
print('Sesudah:', len(df))
df.to_csv('../data/raw/fastwork/fastwork_raw.csv', index=False, encoding='utf-8-sig')
print('Done!')