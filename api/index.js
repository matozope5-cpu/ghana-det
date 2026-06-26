// api/index.js
const express = require('express');
const { kv } = require('@vercel/kv'); // install with: npm i @vercel/kv

const app = express();
app.use(express.json());

// Admin endpoint – store link in KV
app.post('/admin/set-link', async (req, res) => {
    const { userId, veriffUrl } = req.body;
    if (!userId || !veriffUrl) {
        return res.status(400).json({ error: 'userId and veriffUrl are required' });
    }
    await kv.set(`veriff:${userId}`, veriffUrl);
    res.json({ success: true, message: `Link assigned to ${userId}` });
});

// User endpoint – fetch link from KV
app.get('/get-link/:userId', async (req, res) => {
    const { userId } = req.params;
    const link = await kv.get(`veriff:${userId}`);
    if (!link) {
        return res.status(404).json({ error: 'No link found for this user' });
    }
    res.json({ veriffUrl: link });
});

// Serve static files from 'public'
app.use(express.static('public'));

module.exports = app;