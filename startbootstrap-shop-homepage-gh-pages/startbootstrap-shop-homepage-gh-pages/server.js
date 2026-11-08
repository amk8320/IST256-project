// server.js - Penn State Shoe Central backend
// Setup (once, from the project root):  npm install
// Run (from the project root):          npm start
// Then open:                            http://localhost:3000/addproduct.html
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());                     // lets the HTML pages call this server
app.use(express.json());             // parses JSON request bodies
app.use(express.static(__dirname));  // serves the HTML/CSS/JS pages from this folder

// ---------- Simple file-based storage helpers ----------
const BILLING_FILE = path.join(__dirname, 'billing.json');
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

function loadFile(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        return [];   // file missing or empty on first run
    }
}

function saveFile(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const billingRecords = loadFile(BILLING_FILE);
const submissions = loadFile(SUBMISSIONS_FILE);

// =====================================================
//  BILLING
// =====================================================

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
    saveFile(BILLING_FILE, billingRecords);

    console.log('Billing received:', record.id, '-', customer.fullName,
        '- total $' + order.total, '- card ending', payment.cardLast4);

    res.status(201).json({ success: true, id: record.id, message: 'Billing details received.' });
});

// GET /api/billing - list saved records (good for testing in the browser)
app.get('/api/billing', (req, res) => {
    res.json(billingRecords);
});

// =====================================================
//  PRODUCT SUBMISSIONS (submission + approval workflow)
// =====================================================

const VALID_TYPES = ['Running', 'Casual', 'Basketball', 'Boots', 'Dress', 'Other'];
const VALID_UNITS = ['Pair', 'Each', 'Pack', 'Box'];
const VALID_STATUSES = ['pending', 'approved', 'rejected'];

// Server-side validation - mirrors the checks on the submission page
function validateSubmission(body) {
    const errors = [];
    const size = Number(body.shoeSize);
    const price = Number(body.price);

    if (!/^SHOE\d{3}$/.test(body.productId || '')) errors.push('Product ID must look like SHOE123.');
    if (!body.productName || body.productName.trim().length < 3) errors.push('Product name must be at least 3 characters.');
    if (!VALID_TYPES.includes(body.shoeType)) errors.push('Invalid shoe type.');
    if (!(size >= 4 && size <= 18)) errors.push('Shoe size must be between 4 and 18.');
    if (!(price > 0 && price <= 1000)) errors.push('Price must be between $0.01 and $1000.');
    if (!VALID_UNITS.includes(body.unit)) errors.push('Invalid unit of measure.');
    if (!body.submittedBy || body.submittedBy.trim().length < 2) errors.push('Submitted by is required.');
    if (submissions.some(s => s.productId === body.productId && s.status !== 'rejected')) {
        errors.push('That product ID has already been submitted.');
    }
    return errors;
}

// POST /api/submissions - create a new submission (starts as "pending")
app.post('/api/submissions', (req, res) => {
    const body = req.body || {};
    const errors = validateSubmission(body);

    if (errors.length > 0) {
        console.log('Rejected submission:', errors.join(' '));
        return res.status(400).json({ success: false, message: errors.join(' '), errors });
    }

    const item = {
        id: 'SUB-' + Date.now(),
        productId: body.productId.trim(),
        productName: body.productName.trim(),
        shoeType: body.shoeType,
        shoeSize: Number(body.shoeSize),
        price: Number(body.price),
        unit: body.unit,
        weight: (body.weight || '').trim(),
        description: (body.description || '').trim(),
        submittedBy: body.submittedBy.trim(),
        status: 'pending',
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewerNote: ''
    };

    submissions.push(item);
    saveFile(SUBMISSIONS_FILE, submissions);
    console.log('New submission:', item.id, '-', item.productName, 'by', item.submittedBy);

    res.status(201).json({ success: true, id: item.id, submission: item });
});

// GET /api/submissions            - list all submissions
// GET /api/submissions?status=pending - list only one status
app.get('/api/submissions', (req, res) => {
    const { status } = req.query;
    const list = status ? submissions.filter(s => s.status === status) : submissions;
    res.json(list);
});

// GET /api/submissions/:id - one submission
app.get('/api/submissions/:id', (req, res) => {
    const item = submissions.find(s => s.id === req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Submission not found.' });
    res.json(item);
});

// PATCH /api/submissions/:id - approve or reject: { "status": "approved", "reviewerNote": "..." }
app.patch('/api/submissions/:id', (req, res) => {
    const item = submissions.find(s => s.id === req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const { status, reviewerNote } = req.body || {};
    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be pending, approved, or rejected.' });
    }

    item.status = status;
    item.reviewerNote = (reviewerNote || '').trim();
    item.reviewedAt = new Date().toISOString();
    saveFile(SUBMISSIONS_FILE, submissions);
    console.log('Submission', item.id, 'marked', status);

    res.json({ success: true, submission: item });
});

const RETURNS_FILE = path.join(__dirname, 'returns-data.json');
const returnRecords = loadFile(RETURNS_FILE);

app.post('/api/returns', (req, res) => {
    const { customer, items } = req.body || {};

    if (!customer || !customer.fullName || !customer.orderId ||
        !Array.isArray(items) || items.length === 0) {
        console.log('Rejected return request: missing fields');
        return res.status(400).json({ success: false, message: 'Missing required return fields.' });
    }

    const record = {
        id: 'RETURN-' + Date.now(),
        receivedAt: new Date().toISOString(),
        ...req.body
    };
    returnRecords.push(record);
    saveFile(RETURNS_FILE, returnRecords);

    console.log('Return received:', record.id, '-', customer.fullName,
        '- items returned:', items.length);

    res.status(201).json({ success: true, id: record.id, message: 'Return details received.' });
});

app.get('/api/returns', (req, res) => {
    res.json(returnRecords);
});

// Start the server

app.listen(PORT, () => {
    console.log('Server running at http://localhost:' + PORT);
    console.log('Submission page: http://localhost:' + PORT + '/addproduct.html');
});