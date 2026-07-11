const enrollmentState = require("../services/enrollmentState");
const User = require("../models/userModel")
const accessLog = require("../models/accesslogModel");


async function startEnrollment(req, res) {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: "userId is required to start an enrollment session" });
    }

    try {
        // This puts the userId into the server's memory
        enrollmentState.setSession(userId);
        setTimeout(()=>{
            const currentSession = enrollmentState.getSession();
            if(currentSession === userId){
                console.log("enrollment session timedout");

                const io = req.app.get("io");
                io.emit("ENROLLMENT_TIMEOUT",{message: "Enrollment window expired."});
            }
        },60000);
        return res.json({ 
            success: true, 
            message: `Enrollment session successfully started for user: ${userId}. Ready for fingerprint payload.` 
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

async function enroll(req,res){
    const{fingerprint} = req.body;
    const userId = enrollmentState.getSession();
    const io = req.app.get("io");

    if(!userId){
        return res.status(400).json({success: false, message:"No acitve enrollment session found"});

    }
    try{
        await User.findByIdAndUpdate(userId,{
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
        const user = await User.findOne({fingerprint,isActive: true});
        if(user){
            await accessLog.create({
                userId: User._id,
                authType: "fingerprint",
                status: "GRANTED",
                scannedDataString: fingerprint
            });
            io.emit("NEW_ACCESS_LOG",{name: User.name, status: "GRANTED", timestamp: new Date()});
            return res.json({accessGranted: true, action: "OPEN_DOOR", username: User.name});

        } else{
            await accessLog.create({
                userId: null,
                authType: "fingerprint",
                status: "DENIED",
                scannedDataString: fingerprint
            });
            io.emit("NEW_ACCESS_LOG",{name: "Unknown user", status:"DENIED", timestamp: new Date()});
            return res.status(401).json({accessGranted: false, action: "LOCKED"});
        }
    }catch(error){
        return res.status(500).json({success: false, error: error.message});
    }
}



module.exports={
    enroll,
    verification,
    startEnrollment
    
}