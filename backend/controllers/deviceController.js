const { db } = require('../config/firebase');
const deviceRef = db.collection('devices');
const historyRef = db.collection('history');

// Each user's device doc is keyed by their own uid for simplicity.
// The ESP32 (or the dummy simulator) reads/writes the same document to stay in sync.

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
// Writes a "dispense" command that the ESP32/simulator picks up on its next poll.
// Also creates a "pending" history record, and tells the device which record
// to mark as "taken" once it's done — so Reports can show real taken/missed counts.
async function dispenseMedicine(req, res) {
  try {
    const { medicineName, quantity } = req.body;

    const historyDoc = await historyRef.add({
      userId: req.user.uid,
      medicineName: medicineName || 'Unknown',
      quantity: quantity || 1,
      dispenseTime: new Date().toISOString(),
      status: 'pending',
    });

    await deviceRef.doc(req.user.uid).set(
      {
        pendingCommand: 'dispense',
        pendingHistoryId: historyDoc.id,
        commandIssuedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    res.json({ message: 'Dispense command sent', historyId: historyDoc.id });
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