const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSummary, getExpenseAnalytics } = require('../controllers/analyticsController');

router.get('/summary', auth, getSummary);
router.get('/expenses', auth, getExpenseAnalytics);

module.exports = router;
