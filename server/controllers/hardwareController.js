const enrollmentState = require("../services/enrollmentState");

async function enroll(req,res){
    const{fingerprint} = req.body;
    const userId = enrollmentState.getSession();
    const io = req.server.get("io");

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

module.exports={
    enroll
}