const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
} = require('../controllers/scheduleController');

router.use(verifyToken);
router.get('/', getSchedules);
router.post('/', addSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

module.exports = router;
