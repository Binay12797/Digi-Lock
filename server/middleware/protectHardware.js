require("dotenv").config();
const protectHardware= (req,res,next)=>{
    const deviceToken= req.headers['x-device-api-key'];
    if(!deviceToken|| deviceToken !== process.env.HARDWARE_SECRET_TOKEN){
        return res.status(403).json({
            success: false,
            message: "Access Denied: Unauthorized physical device"
        });
    }
    next();
};
module.exports = protectHardware;