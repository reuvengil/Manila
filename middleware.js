const config = require('./config');
const express = require('express');

const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { User } = require('./models/user');

// cookie => {cookiename:cookievalue}
const getCookieByReq = function (req) {
    if (!req.headers.cookie) return null;
    return req.headers.cookie && req.headers.cookie.split(";")
        .map(function (cookieString) {
            return cookieString.trim().split("=");
        }).reduce(function (acc, curr) {
            acc[curr[0]] = curr[1];
            return acc;
        }, {});
}

const getToken = (req, res, next) => {
    const cookie = getCookieByReq(req);
    if (require('lodash.isempty')(cookie)) {
        req.auth = false;
        req.message = 'No token provided.'
        return next();
    }
    jwt.verify(cookie.token, config.PrivateKey, async function (err, decoded_user) {
        if (err) {
            req.auth = false;
            req.message = 'No token provided.'
            return next();
        }
        const user = await User.findById(decoded_user._id, { password: false, __v: false });
        req.auth = true;
        req.user = user;
        return next();
    });
}

module.exports = function (app) {
    app.use(cors());
    app.use(bodyParser.json());
    app.use(getToken)
    // images css scripts
    app.use(express.static('public'));

    // redirect default route to pages
    app.get('/', (req, res) => res.redirect('/pages'));

    // if user not connected in pages route redirect to signin page
    app.use('/pages', (req, res, next) =>
        req.auth ? next() : res.sendFile(path.join(__dirname, 'pages', 'signin.html')),
        express.static(path.join(__dirname, 'pages')));
    return app;
}