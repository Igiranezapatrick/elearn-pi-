require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const BIKA_BASE_URL = process.env.BIKA_BASE_URL;
const BIKA_ANON_KEY = process.env.BIKA_ANON_KEY;

if (!BIKA_ANON_KEY) {
  console.error("❌ ERROR: BIKA_ANON_KEY is missing from .env!");
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Secure Proxy: Forward REST requests with the server's private .env key
app.all('/api/bika/:table', async (req, res) => {
  const { table } = req.params;
  const queryString = new URLSearchParams(req.query).toString();
  const targetUrl = `${BIKA_BASE_URL}/rest/v1/${table}${queryString ? '?' + queryString : ''}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'apikey': BIKA_ANON_KEY, // Injected securely by the server
        'Content-Type': 'application/json'
      }
    };

    if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: "Failed to communicate with Bika Database" });
  }
});

// Fallback to serve the frontend
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback to serve the frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Run standalone server when executed directly (node server.js)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🔒 PI Elearning running on http://localhost:${PORT}`);
  });
}

// Required by Vercel serverless runtime
module.exports = app;