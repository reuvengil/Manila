const Computer = require('./models/computer');
const spawn = require('threads').spawn;
const deletUsers = require('./deleteUsers');
var webPinger = undefined;
var io;
module.exports = function (http) {
    io = require('socket.io')(http);
    socketListener(io)
    return io;
}
function isEmptyOrSpaces(str) {
    return str === null || String(str).match(/^ *$/) !== null;
}

async function reloadWebPinger() {
    if (webPinger) {
        webPinger.kill();
        webPinger = undefined;
    }
    webPinger = spawn('pinger.js')
        .send({ computers: (await Computer.find()) })
        .on('error', err => console.error(`Pinger error:${err}`))
        .on('message', async ({ comp }) => {
            var computer = await Computer.findById(comp._id);
            computer.status = comp.status;
            if (!isEmptyOrSpaces(comp.model)) computer.model = comp.model;
            if (!isEmptyOrSpaces(comp.monitor_model)) computer.monitor_model = comp.monitor_model;
            if (!isEmptyOrSpaces(comp.os)) computer.os = comp.os;
            if (!isEmptyOrSpaces(comp.serialNumber)) computer.serialNumber = comp.serialNumber;
            if (!isEmptyOrSpaces(comp.free_space)) computer.free_space = comp.free_space;
            await computer.save();
            io.sockets.emit('updateComputer', computer);
        })
        .on('exit', () => console.log('Pinger has been terminated'));
}

function socketListener() {
    var numOfClient = 0;
    io.on('connection', async (socket) => {
        numOfClient++;
        console.log(`user #${numOfClient} connected successfully!`);
        if (numOfClient === 1) {
            await reloadWebPinger();
        }
        socket.on('disconnect', async () => {
            console.log(`user #${numOfClient} disconncted!`);
            numOfClient--;
            if (numOfClient === 0 && webPinger) {
                setTimeout(async () => {
                    if (numOfClient === 0) {
                        if (webPinger) {
                            webPinger.kill();
                            webPinger = undefined;
                        }
                    }
                }, 20000);
            }
        });
        // class listener
        socket.on('createClass', _class => {
            io.sockets.emit('createClass', _class);
        });
        socket.on('updateClass', _class => {
            io.sockets.emit('updateClass', _class);
        });
        socket.on('deleteClass', async class_id => {
            io.sockets.emit('deleteClass', class_id);
            await reloadWebPinger();
        });

        // computer listener
        socket.on('createComputer', async computer => {
            io.sockets.emit('createComputer', computer);
            await reloadWebPinger();
        });
        socket.on('updateComputer', async computer => {
            io.sockets.emit('updateComputer', computer);
            await reloadWebPinger();
        });
        socket.on('deleteComputer', async computer_id => {
            io.sockets.emit('deleteComputer', computer_id);
            await reloadWebPinger();
        });
        // delete users profiles
        socket.on('deleteUsersProfiles', async computer_id => {
            var computer = await Computer.findById(computer_id);
            deletUsers(computer, out => {
                socket.emit('deleteUsersProfiles', out);
            })
        })
    })
}