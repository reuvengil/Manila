const Joi = require('joi');
const mongoose = require('mongoose');
const User = mongoose.model('user', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024,
    }
}));
function validateUser(user) {
    return new Joi.object({
        name: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(255).required(),
    }).validate(user)
}
module.exports = { User, validate: validateUser };