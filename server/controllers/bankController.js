const Bank = require('../models/Bank');
const Expense = require('../models/Expense');
const Transfer = require('../models/Transfer');
const EMI = require('../models/EMI');
const SIP = require('../models/SIP');

exports.listBanks = async (req, res, next) => {
  try {
    const banks = await Bank.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(banks);
  } catch (err) { next(err); }
};

exports.createBank = async (req, res, next) => {
  try {
    const { name, purpose, balance } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
    if (!purpose) return res.status(400).json({ message: 'Purpose is required' });
    const bank = await Bank.create({ user: req.user.id, name, purpose, balance: balance || 0 });
    return res.status(201).json(bank);
  } catch (err) { next(err); }
};

exports.updateBank = async (req, res, next) => {
  try {
    const bank = await Bank.findOne({ _id: req.params.id, user: req.user.id });
    if (!bank) return res.status(404).json({ message: 'Bank not found' });
    const { name, purpose, balance } = req.body;
    if (name !== undefined) bank.name = name;
    if (purpose !== undefined) bank.purpose = purpose;
    if (balance !== undefined) bank.balance = balance;
    await bank.save();
    return res.status(200).json(bank);
  } catch (err) { next(err); }
};

exports.deleteBank = async (req, res, next) => {
  try {
    const bank = await Bank.findOne({ _id: req.params.id, user: req.user.id });
    if (!bank) return res.status(404).json({ message: 'Bank not found' });
    const [expenseCount, transferCount, emiCount, sipCount] = await Promise.all([
      Expense.countDocuments({ bank: req.params.id }),
      Transfer.countDocuments({ $or: [{ fromBank: req.params.id }, { toBank: req.params.id }] }),
      EMI.countDocuments({ bank: req.params.id }),
      SIP.countDocuments({ bank: req.params.id }),
    ]);
    if (expenseCount > 0 || transferCount > 0 || emiCount > 0 || sipCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete bank with associated records',
        counts: { expenses: expenseCount, transfers: transferCount, emis: emiCount, sips: sipCount },
      });
    }
    await bank.deleteOne();
    return res.status(200).json({ message: 'Bank deleted' });
  } catch (err) { next(err); }
};
