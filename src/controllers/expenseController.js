const Expense = require('../models/Expense');
const Person = require('../models/Person');
const calculateSettlement = require('../utils/settlementCalculator');

// Add Expense
exports.addExpense = async (req, res) => {
    try {
        const { amount, description, paid_by, participants } = req.body;

        if (!amount || amount <= 0 || !description || !paid_by || !participants || participants.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid input data' });
        }

        const newExpense = new Expense({ amount, description, paid_by, participants });
        await newExpense.save();

        // Auto-add people to Person collection (if not exists)
        for (const name of participants) {
            const exists = await Person.findOne({ name });
            if (!exists) {
                const newPerson = new Person({ name });
                await newPerson.save();
            }
        }

        res.status(201).json({ success: true, data: newExpense, message: 'Expense added successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all Expenses
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
        const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedExpense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        res.json({ success: true, data: updatedExpense, message: 'Expense updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
        if (!deletedExpense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all People
exports.getPeople = async (req, res) => {
    const people = await Person.find().select('name -_id');
    res.json({ success: true, data: people.map(p => p.name) });
};

// Get balances
exports.getBalances = async (req, res) => {
    const expenses = await Expense.find();
    const balances = calculateSettlement(expenses);
    res.json({ success: true, data: balances });
};

// Get settlements summary
exports.getSettlements = async (req, res) => {
    const expenses = await Expense.find();
    const balances = calculateSettlement(expenses);
    let debtors = [], creditors = [];
    Object.keys(balances).forEach(person => {
        if (balances[person] < 0) debtors.push({ person, amount: -balances[person] });
        else if (balances[person] > 0) creditors.push({ person, amount: balances[person] });
    });

    const settlements = [];
    debtors.forEach(debtor => {
        creditors.forEach(creditor => {
            if (debtor.amount === 0) return;
            let minAmount = Math.min(debtor.amount, creditor.amount);
            if (minAmount > 0) {
                settlements.push({
                    from: debtor.person,
                    to: creditor.person,
                    amount: minAmount.toFixed(2)
                });
                debtor.amount -= minAmount;
                creditor.amount -= minAmount;
            }
        });
    });

    res.json({ success: true, data: settlements });
};
