const Goal = require('../models/Goal');

exports.listGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(goals);
  } catch (err) { next(err); }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, targetDate } = req.body;
    if (!name || !targetAmount) return res.status(400).json({ message: 'name and targetAmount are required' });
    const goal = await Goal.create({ user: req.user.id, name, targetAmount, targetDate, savedAmount: 0 });
    return res.status(201).json(goal);
  } catch (err) { next(err); }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const { name, targetAmount, targetDate, contribution } = req.body;
    if (name !== undefined) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (contribution !== undefined) {
      goal.savedAmount = Math.min(goal.savedAmount + parseFloat(contribution), goal.targetAmount);
    }
    goal.isCompleted = goal.savedAmount >= goal.targetAmount;
    await goal.save();
    return res.status(200).json(goal);
  } catch (err) { next(err); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    return res.status(200).json({ message: 'Goal deleted' });
  } catch (err) { next(err); }
};
