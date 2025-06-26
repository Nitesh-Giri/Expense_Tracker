import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: v => v > 0,
      message: 'Amount must be a positive number.'
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Other'],
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }  
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;