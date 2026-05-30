const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listNotes, createNote, updateNote, deleteNote } = require('../controllers/noteController');

router.get('/', auth, listNotes);
router.post('/', auth, createNote);
router.put('/:id', auth, updateNote);
router.delete('/:id', auth, deleteNote);

module.exports = router;
