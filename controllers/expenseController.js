const Expense = require('../models/Expense');
const Person = require('../models/Person');

// Helper: Add new people if not already in DB
const addPeople = async (people) => {
    for (const name of people) {
        await Person.updateOne({ name }, { name }, { upsert: true });
    }
};

// Add Expense with validation
exports.addExpense = async (req, res) => {
    try {
        const { amount, description, paid_by, participants } = req.body;

        // Validation
        if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
        if (!description || description.trim() === "") return res.status(400).json({ success: false, message: 'Description is required' });
        if (!paid_by || paid_by.trim() === "") return res.status(400).json({ success: false, message: 'Paid_by field is required' });
        if (!participants || !Array.isArray(participants) || participants.length === 0) return res.status(400).json({ success: false, message: 'Participants must be a non-empty array' });

        await addPeople([...participants, paid_by]);

        const expense = await Expense.create({ amount, description, paid_by, participants });
        res.status(201).json({ success: true, data: expense, message: 'Expense added successfully' });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get All Expenses
exports.getExpenses = async (req, res) => {
    const expenses = await Expense.find();
    res.json({ success: true, data: expenses });
};

// Update Expense with existence check
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Expense.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Expense not found for update' });

        res.json({ success: true, data: updated, message: 'Expense updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete Expense with existence check
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Expense.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Expense not found for deletion' });

        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};