const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(session({
  secret: 'your-secret-key', // Change this to a secure key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Remove serving React build for development mode to separate React and Node.js

// Serve React app static files
// app.use(express.static(path.join(__dirname, 'client', 'build')));

// Connect to SQLite database
const db = new sqlite3.Database('perpustakaan.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// API Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM admin WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (!row) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    bcrypt.compare(password, row.password, (err, result) => {
      if (result) {
        req.session.user = { username: row.username };
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false });
    } else {
      res.json({ success: true });
    }
  });
});

app.get('/api/admin', (req, res) => {
  if (req.session.user) {
    res.json({ message: 'Welcome to admin area', user: req.session.user });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Route: Home page - list all books or search results
app.get('/', (req, res) => {
  const searchQuery = req.query.q;
  let sql = 'SELECT * FROM buku';
  let params = [];

  if (searchQuery) {
    sql += ` WHERE judul_buku LIKE ? OR pengarang LIKE ? OR penerbit LIKE ?`;
    const likeQuery = '%' + searchQuery + '%';
    params = [likeQuery, likeQuery, likeQuery];
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error querying database:', err.message);
      res.status(500).send('Database error');
    } else {
      res.render('index', { books: rows, searchQuery: searchQuery || '' });
    }
  });
});

// API route: Admin login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  db.get('SELECT * FROM admin WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!row) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // Compare password with bcrypt
    const bcrypt = require('bcryptjs');
    if (bcrypt.compareSync(password, row.password)) {
      req.session.user = { id: row.id, username: row.username };
      return res.json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  });
});

// API route: Admin logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

// API route: Check session
app.get('/api/check_session', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// API route: Get katalog with pagination, search, filter
app.get('/api/katalog', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM buku';
  let params = [];
  let whereClauses = [];

  if (req.query.q) {
    whereClauses.push('(judul_buku LIKE ? OR pengarang LIKE ? OR isbn LIKE ?)');
    const like = '%' + req.query.q + '%';
    params.push(like, like, like);
  }

  if (req.query.rak) {
    whereClauses.push('rak_buku = ?');
    params.push(req.query.rak);
  }

  if (whereClauses.length) {
    sql += ' WHERE ' + whereClauses.join(' AND ');
  }

  if (req.query.sort) {
    sql += ' ORDER BY ' + req.query.sort + ' ' + (req.query.order === 'desc' ? 'DESC' : 'ASC');
  }

  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let countSql = 'SELECT COUNT(*) as total FROM buku';
    if (whereClauses.length) {
      countSql += ' WHERE ' + whereClauses.join(' AND ');
    }

    db.get(countSql, params.slice(0, -2), (err, countRow) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const totalPages = Math.ceil(countRow.total / limit);
      res.json({ data: rows, total_pages: totalPages });
    });
  });
});

// API route: Get unique rak
app.get('/api/rak', (req, res) => {
  db.all('SELECT DISTINCT rak_buku as value, rak_buku as label FROM buku WHERE rak_buku IS NOT NULL AND rak_buku != "" ORDER BY rak_buku', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Middleware to protect admin routes
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// Admin API routes for CRUD
app.post('/admin/api/buku', requireAuth, (req, res) => {
  const { judul_buku, pengarang, penerbit, tempat_terbit, tahun, isbn, jilid, edisi, cetakan, jumlah_halaman, rak_buku, jumlah_buku, tinggi_buku, nomor_panggil, inisial, perolehan, harga, keterangan, no_induk } = req.body;
  db.run(`INSERT INTO buku (judul_buku, pengarang, penerbit, tempat_terbit, tahun, isbn, jilid, edisi, cetakan, jumlah_halaman, rak_buku, jumlah_buku, tinggi_buku, nomor_panggil, inisial, perolehan, harga, keterangan, no_induk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [judul_buku, pengarang, penerbit, tempat_terbit, tahun, isbn, jilid, edisi, cetakan, jumlah_halaman, rak_buku, jumlah_buku, tinggi_buku, nomor_panggil, inisial, perolehan, harga, keterangan, no_induk], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

app.put('/admin/api/buku/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  db.run(`UPDATE buku SET ${setClause} WHERE id = ?`, [...values, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/admin/api/buku/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM buku WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
});

// Example protected admin route
app.get('/api/admin', requireAuth, (req, res) => {
  res.json({ message: `Welcome admin ${req.session.user.username}` });
});

/*
// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Catch-all handler: send back React's index.html file for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});
*/

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
