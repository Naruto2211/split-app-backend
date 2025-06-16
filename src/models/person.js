const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true }
});

module.exports = mongoose.model('Person', personSchema);