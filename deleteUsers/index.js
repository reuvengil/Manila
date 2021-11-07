var spawn = require('spawn-command');
module.exports = function (computer, callback) {
    var cmd = `powershell ${__dirname}\\deleteUsers.ps1 ${computer.name}\n`;
    var child = spawn(cmd);
    child.stdout.on('data', data => callback({ data: data.toString(), id: computer._id }));
    child.stdout.on('close', () => callback({ data: 'done', id: computer._id }));

    child.stdin.write(cmd);
    child.stdin.end()
}