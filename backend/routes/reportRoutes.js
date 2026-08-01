const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getDaily, getWeekly, getMonthly } = require('../controllers/reportController');

router.use(verifyToken);
router.get('/daily', getDaily);
router.get('/weekly', getWeekly);
router.get('/monthly', getMonthly);

module.exports = router;
