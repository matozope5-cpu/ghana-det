const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve static HTML files

// Path to our simple "database" JSON file
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to read/write data
function readData() {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch {
        // If file doesn't exist, return empty object
        return {};
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ---- Admin Endpoint ----
// POST /admin/set-link
// Body: { userId, veriffUrl }
app.post('/admin/set-link', (req, res) => {
    const { userId, veriffUrl } = req.body;
    if (!userId || !veriffUrl) {
        return res.status(400).json({ error: 'userId and veriffUrl are required' });
    }

    const data = readData();
    data[userId] = veriffUrl;
    writeData(data);

    console.log(`✅ Link set for ${userId}: ${veriffUrl}`);
    res.json({ success: true, message: `Link assigned to ${userId}` });
});

// ---- User Endpoint ----
// GET /get-link/:userId
app.get('/get-link/:userId', (req, res) => {
    const { userId } = req.params;
    const data = readData();
    const link = data[userId];

    if (!link) {
        return res.status(404).json({ error: 'No verification link found for this user' });
    }

    res.json({ veriffUrl: link });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📋 Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`👤 Client demo: http://localhost:${PORT}/client.html`);
});