var config = require('../config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user');
const router = require('express').Router();

router.post("/", async (req, res) => {
    const { error } = validate(req.body)
    if (error) {
        return res.json({ message: 'name or passwords incorrect!' });
    }
    let user = await User.findOne({ name: req.body.name });
    if (!user) {
        return res.json({ message: 'name or passwords incorrect!' });
    }
    const validpassword = await bcrypt.compare(req.body.password, user.password);
    if (!validpassword) {
        return res.json({ message: 'name or passwords incorrect!' });
    }
    const token = jwt.sign({ _id: user._id }, config.PrivateKey);
    res.json({ seccess: true, token: token });
});

function validate(user) {
    return new Joi.object({
        name: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(50).required(),
    }).validate(user);
}
module.exports = router;