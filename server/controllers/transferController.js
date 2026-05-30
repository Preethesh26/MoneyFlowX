const Transfer = require('../models/Transfer');
const Bank = require('../models/Bank');

exports.listTransfers = async (req, res, next) => {
  try {
    const transfers = await Transfer.find({ user: req.user.id })
      .populate('fromBank', 'name')
      .populate('toBank', 'name')
      .sort({ date: -1 });
    return res.status(200).json(transfers);
  } catch (err) { next(err); }
};

exports.createTransfer = async (req, res, next) => {
  try {
    const { fromBankId, toBankId, amount, notes, date } = req.body;
    if (!fromBankId || !toBankId || !amount) {
      return res.status(400).json({ message: 'fromBankId, toBankId, and amount are required' });
    }
    if (fromBankId === toBankId) {
      return res.status(400).json({ message: 'Source and destination banks must be different' });
    }

    const fromBank = await Bank.findOne({ _id: fromBankId, user: req.user.id });
    if (!fromBank) return res.status(404).json({ message: 'Source bank not found' });
    if (fromBank.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance in source bank' });
    }

    const toBank = await Bank.findOne({ _id: toBankId, user: req.user.id });
    if (!toBank) return res.status(404).json({ message: 'Destination bank not found' });

    const transfer = await Transfer.create({
      user: req.user.id,
      fromBank: fromBankId,
      toBank: toBankId,
      amount,
      notes,
      date: date || new Date(),
    });

    await Bank.findByIdAndUpdate(fromBankId, { $inc: { balance: -amount } });
    await Bank.findByIdAndUpdate(toBankId, { $inc: { balance: amount } });

    const populated = await transfer.populate([
      { path: 'fromBank', select: 'name' },
      { path: 'toBank', select: 'name' },
    ]);
    return res.status(201).json(populated);
  } catch (err) { next(err); }
};

exports.deleteTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findOne({ _id: req.params.id, user: req.user.id });
    if (!transfer) return res.status(404).json({ message: 'Transfer not found' });

    // Reverse balance changes
    await Bank.findByIdAndUpdate(transfer.fromBank, { $inc: { balance: transfer.amount } });
    await Bank.findByIdAndUpdate(transfer.toBank, { $inc: { balance: -transfer.amount } });
    await transfer.deleteOne();

    return res.status(200).json({ message: 'Transfer deleted' });
  } catch (err) { next(err); }
};
