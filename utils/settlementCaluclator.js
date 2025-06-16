module.exports = (expenses) => {
    const balances = {};

    expenses.forEach(exp => {
        const splitAmount = exp.amount / exp.participants.length;

        exp.participants.forEach(person => {
            balances[person] = (balances[person] || 0) - splitAmount;
        });

        balances[exp.paid_by] = (balances[exp.paid_by] || 0) + exp.amount;
    });

    return balances;
};