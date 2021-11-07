const mongoose = require('mongoose');
const computerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ip: { type: String, required: true },
    classId: { type: String, required: true },
    mac: { type: String, required: true },
    owner: { type: String, required: true },
    subnetMask: { type: String, required: true },
    status: { type: String, default: 'offline' },
    model: { type: String, default: '' },
    monitor_model: { type: String, default: '' },
    os: { type: String, default: '' },
    serialNumber: { type: String, default: '' },
    free_space: { type: String, default: '' },
});
module.exports = mongoose.model('computer', computerSchema)