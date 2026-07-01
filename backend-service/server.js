const express = require('express');
const cors = require('cors');
const multer = require('multer');
const officeCrypto = require('officecrypto-tool');

const app = express();
app.use(cors()); // Allow cross-origin requests from the web app
app.use(express.json());

// Use memory storage for multer so we don't write intermediate files to disk
const upload = multer({ storage: multer.memoryStorage() });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Egypro@123',   // ← replace with your real MySQL root password
  database: 'egypro_inventory'
});

// ---- ASSETS ----
app.get('/api/assets', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM assets');
  res.json(rows);
});
app.post('/api/assets', async (req, res) => {
  const [r] = await pool.query('INSERT INTO assets SET ?', req.body);
  res.json({ id: r.insertId, ...req.body });
});
app.put('/api/assets/:id', async (req, res) => {
  await pool.query('UPDATE assets SET ? WHERE id=?', [req.body, req.params.id]);
  res.json({ success: true });
});
app.delete('/api/assets/:id', async (req, res) => {
  await pool.query('DELETE FROM assets WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// ---- CCTVS ----
app.get('/api/cctvs', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM cctvs');
  res.json(rows);
});
app.post('/api/cctvs', async (req, res) => {
  const [r] = await pool.query('INSERT INTO cctvs SET ?', req.body);
  res.json({ id: r.insertId, ...req.body });
});
app.put('/api/cctvs/:id', async (req, res) => {
  await pool.query('UPDATE cctvs SET ? WHERE id=?', [req.body, req.params.id]);
  res.json({ success: true });
});
app.delete('/api/cctvs/:id', async (req, res) => {
  await pool.query('DELETE FROM cctvs WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// ---- DOOR ACCESS CARDS ----
app.get('/api/door-cards', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM door_access_cards');
  res.json(rows);
});
app.post('/api/door-cards', async (req, res) => {
  const [r] = await pool.query('INSERT INTO door_access_cards SET ?', req.body);
  res.json({ id: r.insertId, ...req.body });
});
app.put('/api/door-cards/:id', async (req, res) => {
  await pool.query('UPDATE door_access_cards SET ? WHERE id=?', [req.body, req.params.id]);
  res.json({ success: true });
});
app.delete('/api/door-cards/:id', async (req, res) => {
  await pool.query('DELETE FROM door_access_cards WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

app.post('/decrypt-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const password = req.body.password;
    if (!password) {
      return res.status(400).json({ error: 'Password is required to decrypt the file.' });
    }

    const inputBuffer = req.file.buffer;

    // officecrypto-tool handles the decryption
    console.log(`[${new Date().toISOString()}] Attempting to decrypt ${req.file.originalname} with provided password...`);
    
    const decryptedBuffer = await officeCrypto.decrypt(inputBuffer, { password: password });
    
    // Send the decrypted buffer back to the client
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="decrypted_${req.file.originalname}"`
    });
    res.send(decryptedBuffer);
    console.log(`[${new Date().toISOString()}] Successfully decrypted and sent ${req.file.originalname}`);

  } catch (err) {
    console.error(`[${new Date().toISOString()}] Decryption failed:`, err.message);
    const msg = err.message || String(err);
    if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('hash')) {
      return res.status(401).json({ error: 'Incorrect password for this Excel file.' });
    }
    return res.status(500).json({ error: 'Decryption failed: ' + msg });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Decryption Backend Server running on http://localhost:${PORT}`);
  console.log(`Ready to decrypt files on /decrypt-excel`);
});
