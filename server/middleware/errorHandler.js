// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(', '),
    });
  }

  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Resource not found' });
  }

  return res.status(500).json({ message: 'Internal server error' });
};
