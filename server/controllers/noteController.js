const Note = require('../models/Note');

exports.listNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(notes);
  } catch (err) { next(err); }
};

exports.createNote = async (req, res, next) => {
  try {
    const { title, body, reminderDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const note = await Note.create({ user: req.user.id, title, body, reminderDate });
    return res.status(201).json(note);
  } catch (err) { next(err); }
};

exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    const { title, body, reminderDate } = req.body;
    if (title !== undefined) note.title = title;
    if (body !== undefined) note.body = body;
    if (reminderDate !== undefined) note.reminderDate = reminderDate;
    await note.save();
    return res.status(200).json(note);
  } catch (err) { next(err); }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    return res.status(200).json({ message: 'Note deleted' });
  } catch (err) { next(err); }
};
