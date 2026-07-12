const enrollmentState = require("../services/enrollmentState");
const User = require("../models/userModel");
const accessLog = require("../models/accesslogModel");
const { sendToDevice } = require("../services/wokwiSocketService");




async function startEnrollment(req, res) {
    const { sessionId } = req.body;
    //const user = await User.findById(sessionId);

    if (!sessionId) {
        return res.status(400).json({ success: false, message: "sessionId is required to start an enrollment session" });
    }

    try {
        enrollmentState.setSession(sessionId);
        console.log("Starting Enroll");

        const success = sendToDevice({
            command: "START_ENROLL",
            //still left to put name given from the front end
            name : "USER"
        });

        if (!success) {
            return res.status(500).json({
                success: false,
                message: "ESP32 not connected"
            });
        }

        console.log("START_ENROLL sent");

        setTimeout(() => {
            const currentSession = enrollmentState.getSession();
            if (currentSession === sessionId) {
                console.log("enrollment session timedout");

                const io = req.app.get("io");
                io.emit("ENROLLMENT_TIMEOUT", { message: "Enrollment window expired." });
                enrollmentState.clearSession(); // Explicit clean up on timeout
            }
        }, 60000);

        return res.json({ 
            success: true, 
            message: `Enrollment session successfully started for user: ${sessionId}. Ready for fingerprint payload.` 
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

async function scan1(req, res) {
    const sessionId = enrollmentState.getSession();
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            message: "No active enrollment session."
        });
    }
    const success = sendToDevice({
        command: "ENROLL_SCAN1"
    });
    if (!success) {
        return res.status(500).json({
            success: false, // ─── FIXED: typo "fakse" changed to false
            message: "ESP not connected"
        });
    }
    res.json({
        success: true,
        message: "Scan 1 requested"
    });
}

async function scan2(req, res) {
    const sessionId = enrollmentState.getSession();

    if (!sessionId) {
        return res.status(400).json({
            success: false,
            message: "No active enrollment session."
        });
    }
    const success = sendToDevice({
        command: "ENROLL_SCAN2"
    });

    if (!success) {
        return res.status(500).json({
            success: false,
            message: "ESP32 not connected"
        });
    }

    res.json({
        success: true,
        message: "Scan 2 requested"
    });
}

async function enroll(req, res) {
    const { fingerprint } = req.body;
    const userId = enrollmentState.getSession();
    const io = req.app.get("io");

    if (!userId) {
        return res.status(400).json({ success: false, message: "No active enrollment session found" });
    }

    try {
        // =====================================================
        // TEMPORARY: MongoDB integration disabled.
        // Uncomment the code below once the database is connected.
        // ====================================================
        /*
        await User.findByIdAndUpdate(userId, {
            fingerprint,
            isActive: true
        });
        */

        io.emit("BIOMETRIC_LINKED", {
            success: true,
            message: "Registration successful!"
        });

        sendToDevice({
            command: "SET_MODE",
            mode: 0
        });

        enrollmentState.clearSession();

        return res.json({
            success: true,
            message: "Enrollment simulation completed."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


async function verification(req, res) {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({
            success: false,
            message: "UID is required."
        });
    }

    const success = sendToDevice({
        command: "AUTH_CHECK",
        uid
    });

    if (!success) {
        return res.status(500).json({
            success: false,
            message: "ESP32 not connected."
        });
    }

    return res.status(200).json({
        success: true,
        message: "Authentication request sent to ESP."
    });
}
module.exports = {
    enroll,
    verification,
    startEnrollment,
    scan1,
    scan2
};