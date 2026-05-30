const mongoose = require('mongoose');

const emiSchema = new mongoose.Schema({
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
  loanName: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  emiAmount: {
    type: Number,
    required: true,
  },
  dueDay: {
    type: Number,
    required: true,
    min: 1,
    max: 31,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isFullyPaid: {
    type: Boolean,
    default: false,
  },
  payments: [
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

module.exports = mongoose.model('EMI', emiSchema);
