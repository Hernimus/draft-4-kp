import sqlite3

conn = sqlite3.connect('perpustakaan.db')
cursor = conn.cursor()

# Create table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS buku (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        no_induk TEXT,
        judul_buku TEXT,
        pengarang TEXT,
        penerbit TEXT,
        tempat_terbit TEXT,
        tahun TEXT,
        isbn TEXT,
        jilid TEXT,
        edisi TEXT,
        cetakan TEXT,
        jumlah_halaman TEXT,
        rak_buku TEXT,
        jumlah_buku TEXT,
        tinggi_buku TEXT,
        nomor_panggil TEXT,
        inisial TEXT,
        perolehan TEXT,
        harga TEXT,
        keterangan TEXT
    )
''')

# Insert sample data
sample_books = [
    ('001', 'Sample Book 1', 'Author 1', 'Publisher 1', 'City 1', '2020', '1234567890', '1', '1st', '1', '100', 'A1', '1', '20', '001.1', 'A', 'Purchase', '50000', 'Good condition'),
    ('002', 'Sample Book 2', 'Author 2', 'Publisher 2', 'City 2', '2021', '0987654321', '1', '1st', '1', '150', 'A2', '1', '22', '002.1', 'B', 'Purchase', '60000', 'New'),
    ('003', 'Sample Book 3', 'Author 3', 'Publisher 3', 'City 3', '2019', '1122334455', '1', '1st', '1', '200', 'A3', '1', '25', '003.1', 'C', 'Donation', '0', 'Used'),
]

for book in sample_books:
    cursor.execute('''
        INSERT INTO buku (
            no_induk, judul_buku, pengarang, penerbit, tempat_terbit, tahun, isbn, 
            jilid, edisi, cetakan, jumlah_halaman, rak_buku, jumlah_buku, 
            tinggi_buku, nomor_panggil, inisial, perolehan, harga, keterangan
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', book)

conn.commit()
conn.close()

print("Sample database created with 3 books.")
