const { db } = require('../config/firebase');
const scheduleRef = db.collection('schedules');

// GET /api/schedules
async function getSchedules(req, res) {
  try {
    const snapshot = await scheduleRef.where('userId', '==', req.user.uid).get();
    const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/schedules
async function addSchedule(req, res) {
  try {
    const { medicineId, time, repeatDays, startDate, endDate } = req.body;
    if (!medicineId || !time) {
      return res.status(400).json({ error: 'medicineId and time are required' });
    }
    const newDoc = await scheduleRef.add({
      userId: req.user.uid,
      medicineId,
      time,
      repeatDays: repeatDays || [],
      startDate: startDate || null,
      endDate: endDate || null,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: newDoc.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/schedules/:id
async function updateSchedule(req, res) {
  try {
    const docRef = scheduleRef.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    await docRef.update(req.body);
    res.json({ message: 'Schedule updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/schedules/:id
async function deleteSchedule(req, res) {
  try {
    const docRef = scheduleRef.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    await docRef.delete();
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getSchedules, addSchedule, updateSchedule, deleteSchedule };
