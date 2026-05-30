const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listTransfers, createTransfer, deleteTransfer } = require('../controllers/transferController');

router.get('/', auth, listTransfers);
router.post('/', auth, createTransfer);
router.delete('/:id', auth, deleteTransfer);

module.exports = router;
