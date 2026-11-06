// server.js - Penn State Shoe Central backend
// Setup (once):   npm init -y
//                 npm install express cors
// Run:            node server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());          // lets the HTML pages call this server
app.use(express.json());  // parses JSON request bodies

// In-memory storage
const billingRecords = [];

// POST /api/billing - receive and process billing details
app.post('/api/billing', (req, res) => {
    const { customer, payment, order } = req.body || {};

    // Server-side check (never trust the browser alone)
    if (!customer || !customer.fullName || !customer.address ||
        !payment || !payment.cardLast4 || !payment.expiry ||
        !order || !Array.isArray(order.items) || order.items.length === 0) {
        console.log('Rejected billing request: missing fields');
        return res.status(400).json({ success: false, message: 'Missing required billing fields.' });
    }

    const record = {
        id: 'BILL-' + Date.now(),
        receivedAt: new Date().toISOString(),
        ...req.body
    };
    billingRecords.push(record);
    fs.writeFileSync('billing.json', JSON.stringify(billingRecords, null, 2));

    console.log('Billing received:', record.id, '-', customer.fullName,
        '- total $' + order.total, '- card ending', payment.cardLast4);

    res.status(201).json({ success: true, id: record.id, message: 'Billing details received.' });
});

// GET /api/billing - list saved records (good for testing in the browser)
app.get('/api/billing', (req, res) => {
    res.json(billingRecords);
});

app.listen(PORT, () => {
    console.log('Server running at http://localhost:' + PORT);
});