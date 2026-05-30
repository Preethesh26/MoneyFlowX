const SIP = require('../models/SIP');
const Bank = require('../models/Bank');

exports.listSIPs = async (req, res, next) => {
  try {
    const sips = await SIP.find({ user: req.user.id })
      .populate('bank', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json(sips);
  } catch (err) { next(err); }
};

exports.createSIP = async (req, res, next) => {
  try {
    const { fundName, monthlyAmount, sipDay, startDate, bankId } = req.body;
    if (!fundName || !monthlyAmount || !sipDay || !startDate || !bankId) {
      return res.status(400).json({ message: 'All SIP fields are required' });
    }
    const bank = await Bank.findOne({ _id: bankId, user: req.user.id });
    if (!bank) return res.status(404).json({ message: 'Bank not found' });

    const sip = await SIP.create({
      user: req.user.id,
      bank: bankId,
      fundName, monthlyAmount, sipDay, startDate,
    });
    return res.status(201).json(sip);
  } catch (err) { next(err); }
};

exports.recordContribution = async (req, res, next) => {
  try {
    const sip = await SIP.findOne({ _id: req.params.id, user: req.user.id });
    if (!sip) return res.status(404).json({ message: 'SIP not found' });

    const amount = req.body.amount || sip.monthlyAmount;
    sip.contributions.push({ amount, date: new Date() });
    await sip.save();
    await Bank.findByIdAndUpdate(sip.bank, { $inc: { balance: -amount } });

    return res.status(200).json(sip);
  } catch (err) { next(err); }
};

exports.deleteSIP = async (req, res, next) => {
  try {
    const sip = await SIP.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!sip) return res.status(404).json({ message: 'SIP not found' });
    return res.status(200).json({ message: 'SIP deleted' });
  } catch (err) { next(err); }
};
