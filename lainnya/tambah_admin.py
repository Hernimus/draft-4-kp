import sqlite3
import bcrypt

NAMA_DATABASE = "perpustakaan.db"

def tambah_admin(username, password):
    conn = sqlite3.connect(NAMA_DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    # Delete existing user if exists
    cursor.execute('DELETE FROM admin WHERE username = ?', (username,))
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cursor.execute(
        'INSERT INTO admin (username, password) VALUES (?, ?)',
        (username, hashed_password)
    )
    conn.commit()
    print(f"Admin user '{username}' berhasil ditambahkan atau diperbarui.")
    conn.close()

if __name__ == "__main__":
    # Ganti username dan password sesuai kebutuhan
    tambah_admin("admin", "password")
