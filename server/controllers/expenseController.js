const Expense = require('../models/Expense');
const Bank = require('../models/Bank');

exports.listExpenses = async (req, res, next) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.month) {
      const [year, month] = req.query.month.split('-');
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      filter.date = { $gte: start, $lt: end };
    }
    const expenses = await Expense.find(filter)
      .populate('bank', 'name purpose')
      .sort({ date: -1 });
    return res.status(200).json(expenses);
  } catch (err) { next(err); }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { type, category, bankId, amount, paymentMethod, notes, date } = req.body;
    if (!type || !category || !bankId || !amount || !paymentMethod) {
      return res.status(400).json({ message: 'type, category, bankId, amount, paymentMethod are required' });
    }
    const bank = await Bank.findOne({ _id: bankId, user: req.user.id });
    if (!bank) return res.status(404).json({ message: 'Bank not found' });

    const expense = await Expense.create({
      user: req.user.id,
      bank: bankId,
      type,
      category,
      amount,
      paymentMethod,
      notes,
      receiptImage: req.file ? req.file.path : undefined,
      date: date || new Date(),
    });

    // Deduct from bank balance atomically
    await Bank.findByIdAndUpdate(bankId, { $inc: { balance: -amount } });

    const populated = await expense.populate('bank', 'name purpose');
    return res.status(201).json(populated);
  } catch (err) { next(err); }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Restore bank balance
    await Bank.findByIdAndUpdate(expense.bank, { $inc: { balance: expense.amount } });
    await expense.deleteOne();

    return res.status(200).json({ message: 'Expense deleted' });
  } catch (err) { next(err); }
};
