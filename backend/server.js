const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.log('MongoDB connection error:', err));



const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
});
const User = mongoose.model('User', userSchema);

const scanSchema = new mongoose.Schema({
  userId: String,
  url: String,
  riskScore: Number,
  verdict: String,
  flags: [{ label: String, severity: String }],
  scannedAt: { type: Date, default: Date.now },
});
const Scan = mongoose.model('Scan', scanSchema);



function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // expected: "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // attach it so later routes can use it
    next(); // move on to the actual route handler
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}



app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ id: user._id, name: user.name, email: user.email });
});



app.post('/api/scan', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Please enter a valid URL' });
    }

   
    const flaskResponse = await axios.post(`${process.env.FLASK_URL}/predict`, { url });
    const { riskScore, verdict, flags } = flaskResponse.data;

   
    const scan = new Scan({
      userId: req.userId,
      url,
      riskScore,
      verdict,
      flags,
    });
    await scan.save();

    res.json({
      id: scan._id,
      url: scan.url,
      riskScore: scan.riskScore,
      verdict: scan.verdict,
      flags: scan.flags,
      scannedAt: scan.scannedAt,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});


app.get('/api/history', requireAuth, async (req, res) => {
  const scans = await Scan.find({ userId: req.userId })
    .sort({ scannedAt: -1 })
    .select('url riskScore verdict scannedAt'); // no flags, matches contract

  res.json(scans.map((s) => ({
    id: s._id,
    url: s.url,
    riskScore: s.riskScore,
    verdict: s.verdict,
    scannedAt: s.scannedAt,
  })));
});

app.get('/api/history/:id', requireAuth, async (req, res) => {
  const scan = await Scan.findOne({ _id: req.params.id, userId: req.userId });
  if (!scan) return res.status(404).json({ error: 'Scan not found' });

  res.json({
    id: scan._id,
    url: scan.url,
    riskScore: scan.riskScore,
    verdict: scan.verdict,
    flags: scan.flags,
    scannedAt: scan.scannedAt,
  });
});

app.delete('/api/history/:id', requireAuth, async (req, res) => {
  await Scan.deleteOne({ _id: req.params.id, userId: req.userId });
  res.json({ message: 'Scan record deleted' });
});


app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
  const scans = await Scan.find({ userId: req.userId });

  res.json({
    totalScans: scans.length,
    safeCount: scans.filter((s) => s.verdict === 'Safe').length,
    suspiciousCount: scans.filter((s) => s.verdict === 'Suspicious').length,
    phishingCount: scans.filter((s) => s.verdict === 'Phishing').length,
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});