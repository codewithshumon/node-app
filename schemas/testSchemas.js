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

//instance methods
testSchema.methods = {
    findActive: () => {
        return mongoose.model('Test').find({ status: 'active' });
    },
};

//static methods
testSchema.static = {
    findByJs: () => {
        return this.find({ title: /js/i });
    },
};
module.exports = testSchema;
