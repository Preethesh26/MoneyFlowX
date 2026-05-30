const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');

router.get('/', auth, listGoals);
router.post('/', auth, createGoal);
router.put('/:id', auth, updateGoal);
router.delete('/:id', auth, deleteGoal);

module.exports = router;
