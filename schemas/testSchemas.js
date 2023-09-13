const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
    },
    date: {
        type: Date,
        default: Date.now().toString(),
    },
});

module.exports = testSchema;
