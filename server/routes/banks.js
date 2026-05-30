const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listBanks, createBank, updateBank, deleteBank } = require('../controllers/bankController');

router.get('/', auth, listBanks);
router.post('/', auth, createBank);
router.put('/:id', auth, updateBank);
router.delete('/:id', auth, deleteBank);

module.exports = router;
