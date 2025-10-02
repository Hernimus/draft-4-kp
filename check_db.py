import sqlite3

conn = sqlite3.connect('perpustakaan.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables in database:", tables)

if 'buku' in [table[0] for table in tables]:
    cursor.execute("SELECT COUNT(*) FROM buku")
    count = cursor.fetchone()[0]
    print(f"Number of books in buku table: {count}")
else:
    print("buku table does not exist")

conn.close()
