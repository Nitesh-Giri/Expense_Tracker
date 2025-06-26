import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoute from './routes/user.route.js';
import expenseRoute from './routes/expense.routes.js';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8008;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/expense", expenseRoute);

app.get('/', (req, res) => {
  res.send('Expense Tracker')
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});