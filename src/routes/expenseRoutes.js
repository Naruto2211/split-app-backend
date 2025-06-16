const express = require('express');
const router = express.Router();
const {
    addExpense,
    getAllExpenses,
    updateExpense,
    deleteExpense,
    getSettlements,
    getPeople,
    getBalances
} = require('../controllers/expenseController');

// Expense Management Routes
router.post('/expenses', addExpense);
router.get('/expenses', getAllExpenses);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

// Settlement Calculation Route
router.get('/settlements', getSettlements);

// New Routes for Balances & People (Added as per assignment)
router.get('/people', getPeople);
router.get('/balances', getBalances);

module.exports = router;
