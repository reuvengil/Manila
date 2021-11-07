const commands = require('./commands');
const { exec } = require('child_process');
// model: ip => `wmic /node:${ip} computersystem get model`,
// serialNumber: ip => `wmic /node:${ip} bios get serialnumber`,
// monitor: ip => `powershell ./computerInfo/monitorName.ps1 ${ip}`,
// os: ip => `wmic /node:${ip} os get caption`,
// free_space: ip => `powershell get-wmiobject win32_logicaldisk -ComputerName ${ip}`

async function execute_command(cmd) {
    return new Promise((res, rej) =>
        exec(cmd, (err, stdout, stderr) => err ? rej(err) : res({ stdout, stderr }))
    );
}

module.exports = {
    model: async (ip) => {
        var res = await execute_command(commands.model(ip));
        return res.stdout.split('\n')[1].replace(/[^ -~]+/g, '');
    },
    monitor: async (ip) => {
        var res = await execute_command(commands.monitor(ip));
        return res.stdout.replace(/[^ -~]+/g, '');
    },
    os: async (ip) => {
        var res = await execute_command(commands.os(ip));
        return res.stdout.split('\n')[1].replace(/[^ -~]+/g, '');
    },
    serialNumber: async (ip) => {
        var res = await execute_command(commands.serialNumber(ip));
        return res.stdout.split('\n')[1].replace(/[^ -~]+/g, '');
    },
    free_space: async (ip) => {
        var res = await execute_command(commands.free_space(ip));
        var bytes = res.stdout.split("FreeSpace    : ")[1].split('\r\nSize')[0];
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Bytes';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }
}


