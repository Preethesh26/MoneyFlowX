const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listSIPs, createSIP, recordContribution, deleteSIP } = require('../controllers/sipController');

router.get('/', auth, listSIPs);
router.post('/', auth, createSIP);
router.post('/:id/contribution', auth, recordContribution);
router.delete('/:id', auth, deleteSIP);

module.exports = router;
