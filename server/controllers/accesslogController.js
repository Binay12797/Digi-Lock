const accessLog = require("../models/accesslogModel");
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

module.exports = {
    getLogs
}