const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getStatus, dispenseMedicine, syncDevice } = require('../controllers/deviceController');

router.use(verifyToken);
router.get('/status', getStatus);
router.post('/dispense', dispenseMedicine);
router.post('/sync', syncDevice);

module.exports = router;
