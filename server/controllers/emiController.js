const EMI = require('../models/EMI');
const Bank = require('../models/Bank');

exports.listEMIs = async (req, res, next) => {
  try {
    const emis = await EMI.find({ user: req.user.id })
      .populate('bank', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json(emis);
  } catch (err) { next(err); }
};

exports.createEMI = async (req, res, next) => {
  try {
    const { loanName, totalAmount, emiAmount, dueDay, startDate, endDate, bankId } = req.body;
    if (!loanName || !totalAmount || !emiAmount || !dueDay || !startDate || !endDate || !bankId) {
      return res.status(400).json({ message: 'All EMI fields are required' });
    }
    const bank = await Bank.findOne({ _id: bankId, user: req.user.id });
    if (!bank) return res.status(404).json({ message: 'Bank not found' });

    const emi = await EMI.create({
      user: req.user.id,
      bank: bankId,
      loanName, totalAmount, emiAmount, dueDay, startDate, endDate,
    });
    return res.status(201).json(emi);
  } catch (err) { next(err); }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const emi = await EMI.findOne({ _id: req.params.id, user: req.user.id });
    if (!emi) return res.status(404).json({ message: 'EMI not found' });

    const paymentAmount = req.body.amount || emi.emiAmount;
    emi.payments.push({ amount: paymentAmount, date: new Date() });

    const totalPaid = emi.payments.reduce((s, p) => s + p.amount, 0);
    if (totalPaid >= emi.totalAmount) emi.isFullyPaid = true;

    await emi.save();
    await Bank.findByIdAndUpdate(emi.bank, { $inc: { balance: -paymentAmount } });

    return res.status(200).json(emi);
  } catch (err) { next(err); }
};

exports.deleteEMI = async (req, res, next) => {
  try {
    const emi = await EMI.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!emi) return res.status(404).json({ message: 'EMI not found' });
    return res.status(200).json({ message: 'EMI deleted' });
  } catch (err) { next(err); }
};
