const enrollmentState = require("../services/enrollmentState");
const user = require("../models/userModel")
const accessLog = require("../models/accesslogModel");
async function enroll(req,res){
    const{fingerprint} = req.body;
    const userId = enrollmentState.getSession();
    const io = req.app.get("io");

    if(!userId){
        return res.status(400).json({success: false, message:"No acitve enrollment session found"});

    }
    try{
        await user.findByIdAndUpdate(userId,{
            fingerprint: fingerprint,
            isActive: true
        });
        io.emit("BIOMETRIC_LINKED",{success: true, message:"Registration successful!"});
        enrollmentState.clearSession();
        return res.json({success: true, message: "Data successfully synced to db"});

    }catch(error){
        return res.status(500).json({success: false, error: error.message});
    };
    
};

async function verification(req,res){
    const {fingerprint} = req.body;
    const io = req.app.get("io");
    try{
        const User = await user.findOne({fingerprint,isActive: true});
        if(user){
            await accessLog.create({
                userId: user._id,
                authType: "fingerprint",
                status: "GRANTED",
                scannedDataString: fingerprint
            });
            io.emit("NEW_ACCESS_LOG",{name: user.name, status: "GRANTED", timestamp: new Date()});
            return res.json({accessGranted: true, action: "OPEN_DOOR", username: user.name});

        } else{
            await accessLog.create({
                userId: null,
                authType: "fingerprint",
                status: "DENIED",
                scannedDataString: fingerprint
            });
            io.emit("NEW_ACCESS_LOG",{name: "Unknown user", status:"DENIED", timestamp: new Data()});
            return res.status(401).json({accessGranted: false, action: "LOCKED"});
        }
    }catch(error){
        return res.status(500).json({success: false, error: error.message});
    }
}

async function getLogs(req,res){
    try {
           const logs = await accessLog.find()
            .populate("userId", "name email") 
            .sort({ createdAt: -1 }) 
            .limit(50); 

        return res.json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

module.exports={
    enroll,
    verification,
    getLogs
}