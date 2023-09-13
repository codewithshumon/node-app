const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
    title: {
        type: String,
        required: true, // Change "require" to "required"
    },
    description: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// instance methods
testSchema.methods = {
    findActive: () => {
        return mongoose.model('Test').find({ status: 'active' });
    },
};

// static methods
testSchema.statics = {
    findByJs: function () {
        // Use a regular function to access "this"
        //if you use arrow function then use"mongoose.model('Test').find()"
        return this.find({ title: /js/i });
    },
};
// quary methods
testSchema.query = {
    byLanguage: function (language) {
        // Use a regular function to access "this"
        //if you use arrow function then use"mongoose.model('Test').find()"
        return this.find({ title: new RegExp(language, 'i') });
    },
};

module.exports = testSchema;
