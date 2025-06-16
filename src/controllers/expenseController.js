const Expense = require('../models/Expense');
const calculateSettlement = require('../utils/settlementCalculator');

// Add Expense
exports.addExpense = async (req, res) => {
    try {
        const { amount, description, paid_by, participants } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be positive' });
        }
        if (!description || description.trim() === '') {
            return res.status(400).json({ success: false, message: 'Description is required' });
        }
        if (!paid_by || paid_by.trim() === '') {
            return res.status(400).json({ success: false, message: 'Paid_by is required' });
        }
        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ success: false, message: 'Participants must be a non-empty array' });
        }

        const expense = await Expense.create(req.body);
        res.status(201).json({ success: true, data: expense, message: 'Expense added successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get All Expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.status(200).json({ success: true, data: expenses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update Expense
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findByIdAndUpdate(id, req.body, { new: true });

        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

        res.status(200).json({ success: true, data: expense, message: 'Expense updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findByIdAndDelete(id);

        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Settlements
exports.getSettlements = async (req, res) => {
    try {
        const expenses = await Expense.find();
        const settlements = calculateSettlement(expenses);
        res.status(200).json({ success: true, data: settlements, message: 'Settlements calculated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get All People
exports.getPeople = async (req, res) => {
    try {
        const expenses = await Expense.find();
        const peopleSet = new Set();

        expenses.forEach(exp => {
            peopleSet.add(exp.paid_by);
            exp.participants.forEach(p => peopleSet.add(p));
        });

        res.status(200).json({ success: true, data: Array.from(peopleSet), message: 'People fetched successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Balances
exports.getBalances = async (req, res) => {
    try {
        const expenses = await Expense.find();
        const balances = {};

        expenses.forEach(exp => {
            const splitAmount = exp.amount / exp.participants.length;

            exp.participants.forEach(person => {
                balances[person] = (balances[person] || 0) - splitAmount;
            });

            balances[exp.paid_by] = (balances[exp.paid_by] || 0) + exp.amount;
        });

        res.status(200).json({ success: true, data: balances, message: 'Balances calculated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
