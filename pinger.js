const ping = require('ping');
const ComputerInfo = require('./computerInfo');
module.exports = (input, done) => {
    console.log('Pinger Started...');
    while (!interator(input.computers, done).next().done);
};

function isEmptyOrSpaces(str) {
    return str === null || String(str).match(/^ *$/) !== null;
}
function interator(array, output) {
    return {
        next: function () {
            if (array.length) {
                var computer = array.shift();
                setInterval(async () => {
                    var status = (await ping.promise.probe(computer.ip)).alive ? 'online' : 'offline';
                    if (computer.status !== status) {
                        computer.status = status;
                        if (status === 'online') {
                            // update computer properties

                            try {
                                // model
                                if (isEmptyOrSpaces(computer.model)) {
                                    computer.model = await ComputerInfo.model(computer.ip)
                                }
                            } catch (err) {
                                console.log(`${computer.name}: Access is denied (model).`);
                            }

                            try {
                                // monitor_model
                                if (isEmptyOrSpaces(computer.monitor_model)) {
                                    computer.monitor_model = await ComputerInfo.monitor(computer.ip)
                                }
                            } catch (err) {
                                console.log(`${computer.name}: Access is denied (monitor_model).`);
                            }

                            try {
                                // os
                                if (isEmptyOrSpaces(computer.os)) {
                                    computer.os = await ComputerInfo.os(computer.ip)
                                }
                            } catch (err) {
                                console.log(`${computer.name}: Access is denied (os).`);
                            }

                            try {
                                // serialNumber
                                if (isEmptyOrSpaces(computer.serialNumber)) {
                                    computer.os = await ComputerInfo.serialNumber(computer.ip)
                                }
                            } catch (err) {
                                console.log(`${computer.name}: Access is denied (serialNumber).`);
                            }

                            try {
                                // free_space
                                if (isEmptyOrSpaces(computer.free_space)) {
                                    computer.os = await ComputerInfo.free_space(computer.ip);
                                }
                            } catch (err) {
                                console.log(`${computer.name}: Access is denied (free space).`);
                            }

                        }
                        output({ comp: computer });
                    }
                }, 10 * 1000);
                return { done: false };
            } else {
                return { done: true };
            }
        }
    }
}