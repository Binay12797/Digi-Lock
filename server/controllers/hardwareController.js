const enrollmentState = require("../services/enrollmentState");
const User = require("../models/userModel");
const accessLog = require("../models/accesslogModel");
const { sendToDevice } = require("../services/wokwiSocketService");

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
        const existingTimer = enrollmentState.getTimer();

        if (existingTimer) {
            clearTimeout(existingTimer);
            enrollmentState.setTimer(null);
        }

        const timer = setTimeout(() => {
            const currentSession = enrollmentState.getSession();

            if (currentSession === sessionId) {
                console.log("Enrollment session timed out.");

                const io = req.app.get("io");

                io.emit("ENROLLMENT_TIMEOUT", {
                    message: "Enrollment window expired."
                });

                enrollmentState.clearSession();
            }
        }, 60000);
        enrollmentState.setTimer(timer);

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
    verification,
    startEnrollment,
};