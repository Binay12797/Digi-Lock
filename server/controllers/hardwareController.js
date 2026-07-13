const enrollmentState = require("../services/enrollmentState");
const User = require("../models/userModel");
const accessLog = require("../models/accesslogModel");
const { sendToDevice } = require("../services/wokwiSocketService");
let enrollmentTimer = null;

async function startEnrollment(req, res) {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== "string") {
        return res.status(400).json({
            success: false,
            message: "A valid sessionId is required."
        });
    }

    // Prevent multiple enrollment sessions
    const activeSession = enrollmentState.getSession();

    if (activeSession) {
        return res.status(409).json({
            success: false,
            message: "Another enrollment session is already in progress."
        });
    }

    try {
        console.log("Starting enrollment...");
        let success = sendToDevice({
            command: "SET_MODE",
            mode: 1
        });
        if (!success) {
            return res.status(503).json({
                success: false,
                message: "ESP32 not connected."
            });
        }
        // Step 2: Start enrollment
        success = sendToDevice({
            command: "START_ENROLL",
            //temp for later
            name: "USER"
        });
        if (!success) {
            return res.status(503).json({
                success: false,
                message: "Failed to start enrollment."
            });
        }
        // Create session ONLY after command was sent successfully
        enrollmentState.setSession(sessionId);

        console.log("START_ENROLL sent.");

        // Clear any previous timer just in case
        if (enrollmentTimer) {
            clearTimeout(enrollmentTimer);
        }

        enrollmentTimer = setTimeout(() => {
            const currentSession = enrollmentState.getSession();

            if (currentSession === sessionId) {
                console.log("Enrollment session timed out.");

                const io = req.app.get("io");

                io.emit("ENROLLMENT_TIMEOUT", {
                    message: "Enrollment window expired."
                });

                enrollmentState.clearSession();
                enrollmentTimer = null;
            }
        }, 60000);

        return res.json({
            success: true,
            message: `Enrollment session started for user: ${sessionId}.`
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
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
            success: false,
            message: "ESP32 not connected."
        });
    }

    return res.json({
        success: true,
        message: "Scan 1 requested."
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
            message: "ESP32 not connected."
        });
    }

    return res.json({
        success: true,
        message: "Scan 2 requested."
    });
}

async function enroll(req, res) {
    const { fingerprint } = req.body;
    const userId = enrollmentState.getSession();
    const io = req.app.get("io");

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "No active enrollment session found."
        });
    }

    try {
        // =====================================================
        // TEMPORARY: MongoDB integration disabled.
        // Uncomment when database integration is complete.
        // =====================================================
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

        const success = sendToDevice({
            command: "SET_MODE",
            mode: 0
        });

        if (!success) {
            console.warn("Failed to send SET_MODE(0) to ESP32.");
        }

        enrollmentState.clearSession();
        if (enrollmentTimer) {
            clearTimeout(enrollmentTimer);
            enrollmentTimer = null;
        }

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
    if (enrollmentState.getSession()) {
        return res.status(409).json({
            success: false,
            message: "Authentication is unavailable while enrollment is in progress."
        });
    }

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