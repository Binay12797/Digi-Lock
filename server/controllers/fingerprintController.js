const User = require("../models/addUserModel");

async function getFingerprint(req,res){
    try {
        // 1. Fetch only the fields needed for the output, excluding locks, userName, etc.
        const rawUsers = await User.find(
            { fingerprintId: { $exists: true, $ne: null } },
            "fingerprintId enrolled role -_id"
        ).lean();

        // 2. Map schema keys to your 3 target properties
        const FingerprintData = rawUsers.map(user => ({
            fingerprint: user.fingerprintId,                 
            status: user.enrolled ? "Active" : "Inactive",  
            relation: user.role                            
        }));

        return res.status(200).json({
            success: true,
            count: secureFingerprintData.length,
            data: FingerprintData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch fingerprint directory",
            error: error.message
        });
    }

}


async function deleteFingerprint(req,res){
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Notify React UI
        const io = req.app.get("io");
        if (io) io.emit("USER_DELETED", { id });

        return res.json({ 
            success: true, 
            message: `User ${deletedUser.name} deleted permanently.` 
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    deleteFingerprint,
    getFingerprint
}