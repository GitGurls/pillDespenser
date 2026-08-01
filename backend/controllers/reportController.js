const { db } = require('../config/firebase');
const historyRef = db.collection('history');

function startOfRange(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

async function getRange(req, res, days) {
  try {
    // Fetch by userId only (no compound query — avoids needing a
    // Firestore composite index), then filter the date range in JS.
    const snapshot = await historyRef.where('userId', '==', req.user.uid).get();
    const cutoff = startOfRange(days);

    const records = snapshot.docs
      .map((doc) => doc.data())
      .filter((r) => r.dispenseTime >= cutoff);

    const taken = records.filter((r) => r.status === 'taken').length;
    const missed = records.filter((r) => r.status === 'missed').length;

    res.json({ rangeDays: days, total: records.length, taken, missed, records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const getDaily = (req, res) => getRange(req, res, 1);
const getWeekly = (req, res) => getRange(req, res, 7);
const getMonthly = (req, res) => getRange(req, res, 30);

module.exports = { getDaily, getWeekly, getMonthly };