const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    week1: [String],
    week2: [String],
    week3: [String],
    week4: [String],
    week5: [String],
    week6: [String],
    week7: [String],
    week8: [String],
    week9: [String],
    week10: [String],
    week11: [String],
    week12: [String],
    week13: [String],
    week14: [String],
    week15: [String],
    week16: [String],
    week17: [String],
    wildcard: [String],
    division: [String],
    conference: [String],
    superbowl: [String],
});
let User = mongoose.model('User', userSchema);
module.exports = User;