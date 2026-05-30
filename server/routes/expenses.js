const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { listExpenses, createExpense, deleteExpense } = require('../controllers/expenseController');

router.get('/', auth, listExpenses);
router.post('/', auth, uploadSingle, createExpense);
router.delete('/:id', auth, deleteExpense);

module.exports = router;
