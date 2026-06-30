const express = require('express');
const cors = require('cors');
const multer = require('multer');
const officeCrypto = require('officecrypto-tool');

const app = express();
app.use(cors()); // Allow cross-origin requests from the web app
app.use(express.json());

// Use memory storage for multer so we don't write intermediate files to disk
const upload = multer({ storage: multer.memoryStorage() });

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
