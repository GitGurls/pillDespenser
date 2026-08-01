const { db } = require('../config/firebase');
const deviceRef = db.collection('devices');
const historyRef = db.collection('history');

// Each user's device doc is keyed by their own uid for simplicity.
// The ESP32 reads/writes the same document to stay in sync.

// GET /api/device/status
async function getStatus(req, res) {
  try {
    const doc = await deviceRef.doc(req.user.uid).get();
    if (!doc.exists) {
      return res.json({ status: 'offline', pillCount: 0, lastSeen: null });
    }
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/device/dispense
// Writes a "dispense" command that the ESP32 picks up on its next poll.
async function dispenseMedicine(req, res) {
  try {
    const { medicineName, quantity } = req.body;
    await deviceRef.doc(req.user.uid).set(
      { pendingCommand: 'dispense', commandIssuedAt: new Date().toISOString() },
      { merge: true }
    );
    await historyRef.add({
      userId: req.user.uid,
      medicineName: medicineName || 'Unknown',
      quantity: quantity || 1,
      dispenseTime: new Date().toISOString(),
      status: 'pending',
    });
    res.json({ message: 'Dispense command sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/device/sync
// Manual "refresh" — just re-reads the latest device doc.
async function syncDevice(req, res) {
  try {
    const doc = await deviceRef.doc(req.user.uid).get();
    res.json(doc.exists ? doc.data() : { status: 'offline' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getStatus, dispenseMedicine, syncDevice };
