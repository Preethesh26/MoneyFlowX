const mongoose = require('mongoose');

const sipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
    required: true,
  },
  fundName: {
    type: String,
    required: true,
  },
  monthlyAmount: {
    type: Number,
    required: true,
  },
  sipDay: {
    type: Number,
    required: true,
    min: 1,
    max: 31,
  },
  startDate: {
    type: Date,
    required: true,
  },
  contributions: [
    {
      _id: false,
      amount: Number,
      date: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SIP', sipSchema);
