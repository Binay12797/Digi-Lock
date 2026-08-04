const enrollmentState = require("../services/enrollmentState");
const User = require("../models/addUserModel");
const accessLog = require("../models/accesslogModel");
const { getDashboardData } = require("../services/dashboardService");

async function startEnrollment(req, res) {
  const { sendToDevice } = require("../services/wokwiSocketService");
  const { sessionId } = req.body;

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({
      success: false,
      message: "A valid sessionId is required.",
    });
  }

  // Prevent multiple enrollment sessions
  const activeSession = enrollmentState.getSession();

  if (activeSession) {
    return res.status(409).json({
      success: false,
      message: "Another enrollment session is already in progress.",
    });
  }

  try {
    enrollmentState.setSession(sessionId);
    console.log("Starting Enroll");

    sendToDevice({
      command: "START_ENROLL",
    });

    console.log("START_ENROLL sent");
    console.log(
      `Enrollment session successfully started for user: ${sessionId}. Ready for fingerprint payload.`,
    );

    const existingTimer = enrollmentState.getTimer();

    if (existingTimer) {
      clearTimeout(existingTimer);
      enrollmentState.setTimer(null);
    }

    const timer = setTimeout(() => {
      const currentSession = enrollmentState.getSession();

      const io = req.app.get("io");
      io.emit("ENROLLMENT_TIMEOUT", {
        message: "Enrollment window expired.",
      });

      enrollmentState.clearSession();
    }, 300000);
    enrollmentState.setTimer(timer);

    return res.json({
      success: true,
      message: `Enrollment session started for user: ${sessionId}.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Inside your controller file

async function enroll(req, res) {
  const {
    firstName,
    lastName,
    email,
    relation,
    contact,
    address,
    fingerprintId,
  } = req.body;
  const sessionId = enrollmentState.getSession();
  const io = req.app.get("io");

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message:
        "Enrollment session has expired or was not started. Please scan your fingerprint again.",
    });
  }

  if (!firstName || !email || !fingerprintId) {
    return res.status(400).json({
      success: false,
      message:
        "Required fields (First Name, Email, and Fingerprint ID) are missing.",
    });
  }

  try {
    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      relation,
      contact,
      address,
      fingerprint: fingerprintId,
      isActive: true,
    });

    console.log(
      `[Database] User profile created for: ${newUser.name} (${newUser._id})`,
    );

    if (io) {
      io.emit("BIOMETRIC_LINKED", {
        success: true,
        message: `Profile created successfully for ${newUser.name}!`,
      });
    }

    enrollmentState.clearSession();

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: newUser,
    });
  } catch (error) {
    console.error("Database save failed:", error);
    return res.status(500).json({
      success: false,
      message: "Database insertion failed.",
      error: error.message,
    });
  }
}
async function processVerification(fingerprint, io) {
  const user = await User.findOne({ fingerprint, isActive: true });
  let status = "DENIED";
  let userId = null;
  let username = "Unknown user";
  let action = "LOCKED";

  if (user) {
    status = "GRANTED";
    userId = user._id;
    username = user.name;
    action = "OPEN_DOOR";
  }

  // Write to Access Log in MongoDB
  const log = await accessLog.create({
    userId,
    authType: "fingerprint",
    status,
    scannedDataString: fingerprint,
  });

  const populatedLog = await accessLog
    .findById(log._id)
    .populate("userId", "name email");

  // Notify frontend clients of real-time scan event
  if (io) {
    io.emit("newAccessLog", populatedLog);

    const dashboard = await getDashboardData();

    io.emit("dashboardUpdate", dashboard);

    io.emit("lockStatusUpdate", {
      deviceId: "test-lock-101",
      status: action === "OPEN_DOOR" ? "UNLOCKED" : "LOCKED",
      lastUpdated: new Date(),
      isOnline: true,
    });
  }

  return { accessGranted: !!user, action, username };
}

async function verification(req, res) {
  const { fingerprint } = req.body;

  console.log("EXACT PAYLOAD RECEIVED:", JSON.stringify(rawFingerprint));
  const io = req.app.get("io");

  try {
    const result = await processVerification(fingerprint, io);

    if (result.accessGranted) {
      return res.json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  verification,
  processVerification,
  startEnrollment,
  enroll,
  //scan1,
  //scan2
};
