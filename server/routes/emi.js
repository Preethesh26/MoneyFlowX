const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listEMIs, createEMI, recordPayment, deleteEMI } = require('../controllers/emiController');

router.get('/', auth, listEMIs);
router.post('/', auth, createEMI);
router.post('/:id/payment', auth, recordPayment);
router.delete('/:id', auth, deleteEMI);

module.exports = router;
