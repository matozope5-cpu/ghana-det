const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// In-memory store (for demo; consider Vercel KV for persistence)
const store = {};

// Admin secret – must match the one used by your bot
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'changeme';

// ---------- ADMIN ROUTE ----------
app.post('/admin/set-link', (req, res) => {
    const { userId, veriffUrl, token } = req.body;

    // 🔒 Check token
    if (token !== ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized: invalid token' });
    }

    if (!userId || !veriffUrl) {
        return res.status(400).json({ error: 'userId and veriffUrl are required' });
    }

    store[userId] = veriffUrl;
    console.log(`✅ Link set for ${userId}: ${veriffUrl}`);
    res.json({ success: true, message: `Link assigned to ${userId}` });
});

// ---------- USER ROUTE ----------
app.get('/get-link/:userId', (req, res) => {
    const { userId } = req.params;
    const link = store[userId];
    if (!link) {
        return res.status(404).json({ error: 'No link found for this user' });
    }
    res.json({ veriffUrl: link });
});

// ---------- STATIC FILES ----------
app.use(express.static('public'));

// Fallback: redirect root to client page
app.get('/', (req, res) => {
    res.redirect('/client.html');
});

// ---------- EXPORT FOR VERCEL ----------
module.exports = app;