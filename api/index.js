// api/index.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// The "database" – we'll store data in a temporary file.
// On Vercel, filesystem writes are not persisted across invocations.
// For a small number of clients, you might use a real database (like Vercel KV, MongoDB, etc.)
// but for demo/static assignment, you can store links in environment variables or a JSON file.
// Since Vercel's serverless environment is read-only for the filesystem, 
// we'll use an in-memory object (lost on function restart) – but that's okay for a demo.
// Alternatively, you can use Vercel KV or a simple external storage.

// In-memory storage (will reset on each deploy)
let data = {};

// Helper to read/write from a file in /tmp (writable but ephemeral)
const DATA_FILE = '/tmp/data.json';

function readData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) { /* ignore */ }
    return {};
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Admin endpoint
app.post('/admin/set-link', (req, res) => {
    const { userId, veriffUrl } = req.body;
    if (!userId || !veriffUrl) {
        return res.status(400).json({ error: 'userId and veriffUrl are required' });
    }
    const current = readData();
    current[userId] = veriffUrl;
    writeData(current);
    res.json({ success: true, message: `Link assigned to ${userId}` });
});

// User endpoint
app.get('/get-link/:userId', (req, res) => {
    const { userId } = req.params;
    const current = readData();
    const link = current[userId];
    if (!link) {
        return res.status(404).json({ error: 'No link found' });
    }
    res.json({ veriffUrl: link });
});

// Serve static files (admin.html, client.html) from the 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Export the app for Vercel
module.exports = app;