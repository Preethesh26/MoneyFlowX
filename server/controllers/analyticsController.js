const mongoose = require('mongoose');
const Bank = require('../models/Bank');
const Expense = require('../models/Expense');
const Transfer = require('../models/Transfer');
const Goal = require('../models/Goal');
const EMI = require('../models/EMI');
const SIP = require('../models/SIP');

exports.getSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [banks, todayDailyExpenses, monthlyOtherExpenses, monthlyTotal, emiCount, sipCount, goalCount] = await Promise.all([
      Bank.find({ user: userId }),
      Expense.aggregate([
        { $match: { user: userId, type: 'Daily', date: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, type: 'Other', date: { $gte: monthStart, $lt: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: monthStart, $lt: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      EMI.countDocuments({ user: userId, isFullyPaid: false }),
      SIP.countDocuments({ user: userId }),
      Goal.countDocuments({ user: userId, isCompleted: false }),
    ]);

    const totalBalance = banks.reduce((s, b) => s + b.balance, 0);
    const totalSavings = banks.filter(b => b.purpose === 'Savings').reduce((s, b) => s + b.balance, 0);

    // Recent 5 transactions (expenses + transfers combined)
    const [recentExpenses, recentTransfers] = await Promise.all([
      Expense.find({ user: userId }).populate('bank', 'name').sort({ date: -1 }).limit(5),
      Transfer.find({ user: userId }).populate('fromBank', 'name').populate('toBank', 'name').sort({ date: -1 }).limit(5),
    ]);

    const recentTransactions = [
      ...recentExpenses.map(e => ({ ...e.toObject(), txnType: 'expense' })),
      ...recentTransfers.map(t => ({ ...t.toObject(), txnType: 'transfer' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return res.status(200).json({
      totalBalance,
      totalSavings,
      todayDailyExpenses: todayDailyExpenses[0]?.total || 0,
      monthlyOtherExpenses: monthlyOtherExpenses[0]?.total || 0,
      monthlyTotal: monthlyTotal[0]?.total || 0,
      recentTransactions,
      counts: { emis: emiCount, sips: sipCount, goals: goalCount },
    });
  } catch (err) { next(err); }
};

exports.getExpenseAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [byCategory, byMonth, byType] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
    ]);

    return res.status(200).json({ byCategory, byMonth, byType });
  } catch (err) { next(err); }
};
