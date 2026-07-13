const Lock = require("../models/lockModel");
async function getLockStatus(req,res){
    const {deviceId} = req.params;
    console.log("request for lock status received");
    try{
        let device = await Lock.findOne({deviceId});
        if(!device){
            device = await Lock.create({deviceId, status: "LOCKED"});

        }
        return res.json({
            success: true,
            deviceId: device.deviceId,
            status: device.status,
            lastUpdated: device.updatedAt

        });
    }catch(error){
        return res.status(500).json({success: false, error: error.message});
    }
}

async function updateLockStatus(req,res){
    const {deviceId, status} = req.body;
    const io = req.app.get("io");
    if(!["LOCKED","UNLOCKED"].includes(status)){
        return res.status(400).json({success: false, message: "Invalid status state value"});
    }
    try {
        const device = await Lock.findOneAndUpdate(
            { deviceId },
            { status, lastUpdated: new Date() },
            { new: true, upsert: true }
        );

       
        if (io) {
            io.emit("LOCK_STATUS_CHANGED", { deviceId: device.deviceId, status: device.status });
        }

        return res.json({ success: true, message: `Lock state updated to ${status}`, status: device.status });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { getLockStatus, updateLockStatus };
