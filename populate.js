const mongoose = require('mongoose');
const Expense = require('./models/expense');
const Person = require('./models/person');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    console.log("MongoDB Connected - Populating Data...");

    await Expense.deleteMany({});
    await Person.deleteMany({});

    const people = ['Shantanu', 'Sanket', 'Om'];
    await Person.insertMany(people.map(name => ({ name })));

    const expenses = [
        { amount: 600, description: 'Dinner', paid_by: 'Shantanu', participants: people },
        { amount: 450, description: 'Groceries', paid_by: 'Sanket', participants: people },
        { amount: 300, description: 'Petrol', paid_by: 'Om', participants: people },
        { amount: 500, description: 'Movie Tickets', paid_by: 'Shantanu', participants: people },
        { amount: 280, description: 'Pizza', paid_by: 'Sanket', participants: people }
    ];

    await Expense.insertMany(expenses);

    console.log("Data Populated Successfully!");
    mongoose.disconnect();
})
.catch(err => console.error(err));
