import Expense from "../models/expense.model.js";
import { z } from 'zod';


// Get all expenses for the authenticated user
export const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ creatorId: req.user._id }).sort({ date: -1 });
        res.status(200).json({ message: "Expenses fetched successfully", expenses });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Failed to fetch expenses." });
    }
};

// Add a new expense
export const createExpense = async (req, res) => {
    const expenseSchema = z.object({
        amount: z.number().positive({ message: "Amount must be a positive number." }),
        category: z.enum(['Food', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Other']),
        description: z.string().optional(),
        date: z.string().or(z.date())
    });
    const parsed = expenseSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.issues.map(e => e.message) });
    }
    const { amount, category, description, date } = parsed.data;
    try {
        const newExpense = await Expense.create({
            amount,
            category,
            description,
            date,
            creatorId: req.user._id,
        });
        res.status(201).json({
            message: "Expense created successfully.",
            expense: newExpense
        });
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ message: "Failed to create expense." });
    }
};

// Update an expense
export const updateExpense = async (req, res) => {
    // Input validation using zod
    const expenseSchema = z.object({
        amount: z.number().positive({ message: "Amount must be a positive number." }).optional(),
        category: z.enum(['Food', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Other']).optional(),
        description: z.string().optional(),
        date: z.string().or(z.date()).optional()
    });
    const parsed = expenseSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.issues.map(e => e.message) });
    }
    const { id } = req.params;
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: id, creatorId: req.user._id },
            parsed.data,
            { new: true, runValidators: true }
        );
        if (!expense) {
            return res.status(404).json({ message: "Expense not found or unauthorized." });
        }
        res.json({
            message: "Expense updated successfully.",
            expense
        });
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ message: "Failed to update expense." });
    }
};

// Delete an expense
export const deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        const expense = await Expense.findOneAndDelete({
            _id: id,
            creatorId: req.user._id
        });
        if (!expense) {
            return res.status(404).json({ message: "Expense not found or unauthorized." });
        }
        res.json({
            message: "Expense deleted successfully.",
            expense
        });
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: "Failed to delete expense." });
    }
};