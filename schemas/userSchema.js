const mongoose = require('mongoose');

// for authenticate with JSON Web Token
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
    },
    //makeing relation with User and Test
    tests: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Test',
        },
    ],
});

module.exports = userSchema;
