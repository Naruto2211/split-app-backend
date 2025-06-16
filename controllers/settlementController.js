const Expense = require('../models/Expense');
const Person = require('../models/Person');
const calculateSettlement = require('../utils/settlementCalculator');

// Get all people
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