var config = require('./config');

//http server
const express = require('express')
const app = require('./middleware')(express());
var http = require('http').createServer(app);
const io = require('./socket')(http);
const path = require('path');

//Database
const mongoose = require('mongoose');

//Connect To DB
mongoose.connect(config.DatabaseUrl, config.MongoOptions);
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once("open", () => console.log('Connected to Database'));

//Routes
const classRoute = require('./routes/classes');
app.use('/class', classRoute);

const computerRoute = require('./routes/computers');
app.use('/computer', computerRoute);

const authRoute = require('./routes/auth');
app.use('/auth', authRoute);


//start server
var port = config.Port || 3000;
http.listen(port, () => {
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        console.log(`Server Started! listening on ${add}:${port}/`);
    });
});


if (!config.PrivateKey) {
    console.error('FATAL ERROR: PrivateKey is not defined.');
    process.exit(1);
}