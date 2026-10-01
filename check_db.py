import psycopg2

conn = psycopg2.connect("postgresql://postgres:admin@localhost:5432/postgres")
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
tables = cur.fetchall()
print("Tables:", tables)

for t in tables:
    tname = t[0]
    cur.execute(f'SELECT count(*) FROM "{tname}"')
    cnt = cur.fetchone()[0]
    print(f"Table {tname}: {cnt} rows")

cur.close()
conn.close()
