const Computer = require('../models/computer');
const _Class = require('../models/class');
const wol = require('wakeonlan');
const { exec } = require('child_process');
const router = require('express').Router();
const arp = require('node-arp');

// get single computer

router.get('/one/:computerId', async function (req, res) {
    if (req.auth) {
        try {
            var _computer = await Computer.findById(req.params.computerId);
            res.json(_computer);
        } catch (error) {
            res.json({ msg: error.message });
        }
    } else {
        res.json({ msg: req.message });
    }
});

// list
router.get("/list/:classId", async function (req, res) {
    if (req.auth) {
        try {
            let computers;
            var _class = await _Class.find();
            if (req.params.classId === '0') {
                computers = await Computer.find();
                computers = computers.map(computer => {
                    var className = _class.filter(cls => `${cls._id}` === `${computer.classId}`)[0].name;
                    computer.owner = `${className} - ${computer.owner}`;
                    return computer;
                })
            } else {
                computers = await Computer.find({ classId: req.params.classId });
            }
            res.json({ success: true, computers });
        } catch (error) {
            res.json({ msg: error.message });
        }
    } else {
        res.json({ msg: req.message });
    }

});

// create
router.post('/new', async function (req, res) {
    if (req.auth) {
        try {
            var computer = await Computer.create(req.body);
            res.json({ success: true, computer });
        } catch (error) {
            res.json({ success: false, msg: error.message });
        }
    } else {
        res.json({ msg: req.message });
    }
});
// update
router.post("/update/:computerId", async function (req, res) {
    if (req.auth) {
        try {
            var old = await Computer.findById(req.params.computerId);
            old.name = req.body.name;
            old.ip = req.body.ip;
            old.classId = req.body.classId;
            old.mac = req.body.mac;
            old.owner = req.body.owner;
            old.subnetMask = req.body.subnetMask;
            old.model = req.body.model;
            if (req.body.status)
                old.status = req.body.status;
            if (req.body.os)
                old.os = req.body.os;
            if (req.body.serialNumber)
                old.serialNumber = req.body.serialNumber;
            if (req.body.free_space)
                old.free_space = req.body.free_space;
            var computer = await old.save();
            res.json({ success: true, computer });
        } catch (error) {
            res.json({ success: false, msg: error.message });
        }
    } else {
        res.json({ msg: req.message });
    }
});

// delete
router.delete('/:computerId', async function (req, res) {
    if (req.auth) {
        Computer.deleteOne({ _id: req.params.computerId }, err => {
            res.json({ success: !err });
        });
    } else {
        res.json({ msg: req.message });
    }
});

// wake on lan
router.get('/wol/:computerId', async function (req, res) {
    if (req.auth) {
        try {
            var computer = await Computer.findById(req.params.computerId);
            await wol(computer.mac);
            res.json({ msg: '...בקשת הדלקת המחשב בוצעה בהצלחה מחכה לתגובת המחשב' });
        } catch (err) {
            res.json({ msg: 'משהו השתבש' });
        }
    }
    else {
        res.json({ msg: req.message });
    }
});

// shutdown
router.get('/shutdown/:computerId', async function (req, res) {
    var computer = await Computer.findById(req.params.computerId);
    var cmd = `shutdown -r -m \\\\${computer.ip} -t 0`;
    try {
        await new Promise((resolve, reject) =>
            exec(cmd, (err, stdout, stderr) => err ? reject(err) : resolve({ stdout, stderr }))
        );
        res.json({ success: true });
    } catch (err) {
        console.log(`${computer.name}: Access is denied (shutdown).`);
        res.json({ success: false })
    }
});

router.post('/getMac', async function (req, res) {
    if (req.auth) {
        try {
            var macAdd = await new Promise((resolve, reject) => arp.getMAC(req.body.ip, (err, mac) => err ? reject(err) : resolve(mac)));
            res.json({ msg: macAdd });
        } catch (err) {
            res.json({ msg: 'משהו השתבש' });
        }
    }
    else {
        res.json({ msg: req.message });
    }
});

module.exports = router;