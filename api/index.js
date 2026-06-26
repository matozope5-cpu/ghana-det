const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// In-memory store (for demo; use Vercel KV for persistence)
const store = {};

// --- API ROUTES (must come before static) ---

// Admin: Set/update a link
app.post('/admin/set-link', (req, res) => {
    const { userId, veriffUrl } = req.body;
    if (!userId || !veriffUrl) {
        return res.status(400).json({ error: 'userId and veriffUrl are required' });
    }
    store[userId] = veriffUrl;
    console.log(`✅ Link set for ${userId}: ${veriffUrl}`);
    res.json({ success: true, message: `Link assigned to ${userId}` });
});

// User: Get their link
app.get('/get-link/:userId', (req, res) => {
    const { userId } = req.params;
    const link = store[userId];
    if (!link) {
        return res.status(404).json({ error: 'No link found for this user' });
    }
    res.json({ veriffUrl: link });
});

// --- STATIC FILES (after API routes) ---
app.use(express.static('public'));

// --- Fallback: Redirect root to client page ---
app.get('/', (req, res) => {
    res.redirect('/client.html');
});

// --- Export for Vercel ---
module.exports = app;