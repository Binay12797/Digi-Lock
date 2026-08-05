const User = require("../models/addUserModel");

async function getFingerprint(req, res) {
  try {
    // Include _id, userName, role, enrolled, locks, fingerprintId
    const users = await User.find(
      { fingerprint: { $exists: true, $ne: null } },
      "_id name relation isActive  fingerprint"
    ).lean();
    //console.log("Found Users in DB:", JSON.stringify(users, null, 2));
    //console.log("RAW FULL DOCUMENTS:", JSON.stringify(users, null, 2));
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
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