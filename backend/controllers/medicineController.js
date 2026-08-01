const { db } = require('../config/firebase');
const medicinesRef = db.collection('medicines');

// GET /api/medicines
async function getMedicines(req, res) {
  try {
    const snapshot = await medicinesRef.where('userId', '==', req.user.uid).get();
    const medicines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/medicines
async function addMedicine(req, res) {
  try {
    const { medicineName, dosage, quantity, notes } = req.body;
    if (!medicineName || !dosage) {
      return res.status(400).json({ error: 'medicineName and dosage are required' });
    }
    const newDoc = await medicinesRef.add({
      userId: req.user.uid,
      medicineName,
      dosage,
      quantity: quantity || 0,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: newDoc.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/medicines/:id
async function updateMedicine(req, res) {
  try {
    const docRef = medicinesRef.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    await docRef.update(req.body);
    res.json({ message: 'Medicine updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/medicines/:id
async function deleteMedicine(req, res) {
  try {
    const docRef = medicinesRef.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists || doc.data().userId !== req.user.uid) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    await docRef.delete();
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getMedicines, addMedicine, updateMedicine, deleteMedicine };
