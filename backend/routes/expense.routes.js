import express from 'express';
import {
    createExpense,
    deleteExpense,
    getAllExpenses,
    updateExpense
} from '../controllers/expense.controller.js';

import userMiddleware from '../middleware/user.middleware.js';

const router = express.Router();

router.get('/all', userMiddleware, getAllExpenses);
router.post('/add',userMiddleware, createExpense);
router.put('/update/:id',userMiddleware, updateExpense);
router.delete('/delete/:id',userMiddleware, deleteExpense);

export default router;
