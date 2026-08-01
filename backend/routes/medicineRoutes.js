const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');

router.use(verifyToken);
router.get('/', getMedicines);
router.post('/', addMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;
