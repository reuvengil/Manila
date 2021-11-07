module.exports = {
    model: ip => `wmic /node:${ip} computersystem get model`,
    serialNumber: ip => `wmic /node:${ip} bios get serialnumber`,
    monitor: ip => `powershell ./computerInfo/monitorName.ps1 ${ip}`,
    os: ip => `wmic /node:${ip} os get caption`,
    free_space: ip => `powershell get-wmiobject win32_logicaldisk -ComputerName ${ip}`
}