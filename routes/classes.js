const router = require('express').Router();
const _Class = require('../models/class');
const Computer = require('../models/computer');
const wol = require('wakeonlan');
const { exec } = require('child_process');

// get single class
router.get('/one/:classId', async function (req, res) {
    if (req.auth) {
        try {
            var _class = await _Class.findById(req.params.classId);
            res.json(_class);
        } catch (error) {
            res.json({ msg: error.message });
        }
    } else {
        res.json({ msg: req.message });
    }
});

// list
router.get("/list", async function (req, res) {
    if (req.auth) {
        try {
            const classes = await _Class.find();
            res.json({ success: true, classes });
        } catch (error) {
            res.json({ success: false, msg: error.message });
        }
    } else {
        res.json({ success: false, msg: req.message });
    }
});

// create
router.post('/new', async function (req, res) {
    if (req.auth) {
        try {
            var _class = await _Class.create(req.body);
            res.json({ success: true, _class });
        } catch (error) {
            res.json({ success: false, msg: error.message });
        }
    } else {
        res.json({ msg: req.message });
    }
});
// update
router.post("/update/:classId", async function (req, res) {
    if (req.auth) {
        try {
            var old = await _Class.findById(req.params.classId);
            old.name = req.body.name;
            old.description = req.body.description;
            await old.save();
            res.json({ success: true })
        } catch (error) {
            res.json({ success: false, msg: error.message });
        }
    } else {
        res.json({ msg: req.message });
    }
});
// delete
router.delete('/:classId', async function (req, res) {
    if (req.auth) {
        _Class.deleteOne({ _id: req.params.classId }, err => {
            res.json({ success: !err, msg: err });
        })
        await Computer.deleteMany({ classId: req.params.classId });
    } else {
        res.json({ msg: req.message });
    }
});

// wake on lan
router.get('/wol/:classId', async function (req, res) {
    if (req.auth) {
        try {
            var computers = await Computer.find({ classId: req.params.classId });
            for (let i = 0; i < computers.length; i++) {
                const computer = computers[i];
                await wol(computer.mac);
            }
            res.json({ msg: '...בקשת הדלקת הכיתה בוצעה בהצלחה מחכה לתגובת המחשב' });
        } catch (err) {
            res.json({ msg: 'משהו השתבש' });
        }
    }
    else {
        res.json({ msg: req.message });
    }
});

// shutdown
router.get('/shutdown/:classId', async function (req, res) {
    if (req.auth) {
        var computers = await Computer.find({ classId: req.params.classId });
        for (let i = 0; i < computers.length; i++) {
            const computer = computers[i];
            var cmd = `shutdown -r -m \\\\${computer.ip} -t 0`;
            try {
                await new Promise((resolve, reject) =>
                    exec(cmd, (err, stdout, stderr) => err ? reject(err) : resolve({ stdout, stderr }))
                );
            } catch { }
        }
        res.json({ msg: '...בקשת הדלקת הכיתה בוצעה בהצלחה מחכה לתגובת המחשב' });
    }
    else {
        res.json({ msg: req.message });
    }
});
module.exports = router;