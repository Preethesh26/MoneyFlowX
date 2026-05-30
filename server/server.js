require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'https://money-flow-x.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json());

// Remove duplicate banks route


// Static route for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'MoneyFlowX API' });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/banks', require('./routes/banks'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/emi', require('./routes/emi'));
app.use('/api/sip', require('./routes/sip'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/analytics', require('./routes/analytics'));

// Error handler — must be last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
