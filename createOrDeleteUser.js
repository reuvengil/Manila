const config = require("./config");
const { User, validate } = require('./models/user');
const jwt = require('jsonwebtoken');
const readlineSync = require('readline-sync');
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
mongoose.connect(config.DatabaseUrl, config.MongoOptions);
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once("open", async () => {
    console.log('create or delete user:');
    console.log('1 -> create');
    console.log('2 -> delete');
    const select = readlineSync.question('0-> exit.\n');
    switch (select) {
        case '1':
            const name = readlineSync.question('username (5-50): ');
            const password = readlineSync.question('password (5-50): ', { hideEchoBack: true });
            const confirm = readlineSync.question('confirm (5-50): ', { hideEchoBack: true });
            if (password !== confirm) {
                console.error('password and confirm are not the same!');
                process.exit(0);
                return;
            }
            const { error } = validate({ name, password });
            if (error) {
                console.log(error.details[0].message);
                process.exit(0);
                return;
            }
            let user = await User.findOne({ name: name });
            if (user) {
                console.error("this user already exists! ")
                process.exit(0);
                return;
            }
            user = new User({ name, password });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            await user.save();
            console.log("user saved");
            process.exit(0);
            return;
        case '2':
            const _user = await User.findOne({ name: readlineSync.question('username: ') });
            if (_user) {
                await _user.remove();
                console.log("username deleted.");
            }
            else {
                console.log("username not exist!");
                process.exit(0);
            }
            return;
        case '0':
            process.exit(0);
            break;
    }
});
