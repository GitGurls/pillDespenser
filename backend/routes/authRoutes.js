const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// NOTE: Actual register/login/logout happens on the frontend using the
// Firebase Auth JS SDK (see public/js/auth.js). The backend doesn't need
// its own register/login routes — it only verifies the ID token the
// frontend sends with each request. This route just confirms who you are.

router.get('/me', verifyToken, (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email });
});

module.exports = router;
