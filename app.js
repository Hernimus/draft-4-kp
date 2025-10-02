const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Serve React app static files
app.use(express.static(path.join(__dirname, 'client', 'build')));

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

// Middleware to protect admin routes
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// Example protected admin route
app.get('/api/admin', requireAuth, (req, res) => {
  res.json({ message: `Welcome admin ${req.session.user.username}` });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Catch-all handler: send back React's index.html file for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
