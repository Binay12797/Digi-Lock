#include "EnrollmentManager.h"
#include "FingerprintSensor.h"
#include "Buzzer.h"
#include "SocketClient.h"

extern int currentMode;

namespace {
    EnrollState   state_            = ENROLL_IDLE;
    String        pendingName_      = "";
    unsigned long processingStartMs = 0;

    const unsigned long PROCESSING_TIMEOUT_MS = 8000;
}

namespace EnrollmentManager {

static int currentScanPass = 0;
static bool isReadyToScan = false;

// ── Initialisation ────────────────────────────────────────────────────────────
void begin() {
    SocketClient::onCommand([](const String &command, JsonObject data) {

        if (command == "START_ENROLL") {
            String name = "User";
            if (name.isEmpty()) {
                Serial.println("[Enroll] START_ENROLL received with no 'name' field — ignored");
                return;
            }
            EnrollmentManager::start(name);
            currentMode = 1;
            Serial.println("[Enroll] Initializing fingerprint enrollment matrix...");
            
            // Reset local scan state variables
            currentScanPass = 1; 
            isReadyToScan = true; 
            
            Serial.println("[Hardware] Ready for finger placement.");

        } else if (command == "CANCEL_ENROLL") {
            if (state_ == ENROLL_IDLE || state_ == ENROLL_DONE) return; 
            String nameAtCancel = pendingName_;
            EnrollmentManager::reset();
            SocketClient::emitEnrollFailed(nameAtCancel, "cancelled_by_admin");
            SocketClient::emitEnrollLog(nameAtCancel, "", false, "cancelled_by_admin");
            isReadyToScan = false;
            currentScanPass = 0;
            Serial.println("[Enroll] Cancelled by admin");

        } else if (command == "EXIT_ENROLL") {
            Serial.println("[DEBUG] EXIT_ENROLL received");
            EnrollmentManager::reset();
            isReadyToScan = false;
            currentScanPass = 0;
            currentMode = 0;
            Serial.println("[Enroll] Enrollment reset");

        } else if (command == "ENROLL_SCAN1") {
            Serial.println("[DEBUG] ENROLL_SCAN1 command received");
            EnrollmentManager::scan1();

        } else if (command == "ENROLL_SCAN2") {
            Serial.println("[DEBUG] ENROLL_SCAN2 command received");
            EnrollmentManager::scan2();
        }
    });
}

// ── Public API ────────────────────────────────────────────────────────────────
void start(const String &name) {
    pendingName_ = name;
    FingerprintSensor::reset();
    processingStartMs = 0;

    state_ = ENROLL_WAITING_SCAN1;
    Buzzer::beepScan();
    SocketClient::emitEnrollProgress("started",       pendingName_);
    SocketClient::emitEnrollProgress("waiting_scan1", pendingName_);
    Serial.println("[Enroll] Started for: " + name + " — waiting for scan 1");
}

void onButtonPressed() {
    switch (state_) {
        case ENROLL_WAITING_SCAN1:
            scan1();
            break;
        case ENROLL_WAITING_SCAN2:
            scan2();
            break;
        default:
            break;
    }
}

void scan1() {
    Serial.println("[DEBUG] scan1() called");
    Serial.print("[DEBUG] Current State = ");
    Serial.println(stateString());

    if (state_ != ENROLL_WAITING_SCAN1) {
        Serial.println("[DEBUG] Wrong state for Scan1");
        return;
    }

    Serial.println("[DEBUG] Calling captureTemplate1()");

    if (FingerprintSensor::captureTemplate1()) {
        Serial.println("[DEBUG] captureTemplate1 SUCCESS");
        Buzzer::beepScan();
        
        // Notify backend that scan 1 is complete
        SocketClient::emitEnrollProgress("scan1_done", pendingName_);

        // Shift directly to waiting for the user to lift their finger
        state_ = ENROLL_WAITING_FOR_LIFT;
        Serial.println("[Enroll] Scan 1 done — waiting for finger lift clear");
    }
}

void scan2() {
    if (state_ != ENROLL_WAITING_SCAN2) return;

    if (FingerprintSensor::captureTemplate2()) {
        state_            = ENROLL_SCAN2_DONE;
        processingStartMs = millis();
        Buzzer::beepScan();
        SocketClient::emitEnrollProgress("scan2_done", pendingName_);
        Serial.println("[Enroll] Scan 2 done — processing");
    }
}

void loop() {
    // ── Stage: Wait for finger lift clear before enabling Scan 2 ──────
    if (state_ == ENROLL_WAITING_FOR_LIFT) {
        if (FingerprintSensor::isFingerRemoved()) { 
            state_ = ENROLL_WAITING_SCAN2;
            SocketClient::emitEnrollProgress("waiting_scan2", pendingName_);
            Serial.println("[Enroll] Finger lifted clear. Ready for Scan 2.");
        }
    }

    // ── Stage: Brief pause after scan2 before processing ──────────────
    if (state_ == ENROLL_SCAN2_DONE) {
        unsigned long elapsed = millis() - processingStartMs;

        if (elapsed > PROCESSING_TIMEOUT_MS) {
            state_ = ENROLL_FAILED;
            Buzzer::beepFail();
            SocketClient::emitEnrollFailed(pendingName_, "processing_timeout");
            SocketClient::emitEnrollLog(pendingName_, "", false, "processing_timeout");
            return;
        }
        if (elapsed > 1500) {
            state_ = ENROLL_PROCESSING;
            Buzzer::beepProcess();
            SocketClient::emitEnrollProgress("processing", pendingName_);
        }
    }

    // ── Stage: Combine templates into a UID and report to backend ─────
    if (state_ == ENROLL_PROCESSING) {
        unsigned long elapsed = millis() - processingStartMs;

        if (elapsed > PROCESSING_TIMEOUT_MS) {
            state_ = ENROLL_FAILED;
            Buzzer::beepFail();
            SocketClient::emitEnrollFailed(pendingName_, "processing_timeout");
            SocketClient::emitEnrollLog(pendingName_, "", false, "processing_timeout");
            return;
        }
        if (elapsed > 3000) {
            String uid = FingerprintSensor::combineToUID();
            if (uid.isEmpty()) {
                state_ = ENROLL_FAILED;
                Buzzer::beepFail();
                SocketClient::emitEnrollFailed(pendingName_, "template_combine_failed");
                SocketClient::emitEnrollLog(pendingName_, "", false, "template_combine_failed");
                return;
            }
            
            state_ = ENROLL_DONE;
            Buzzer::beepSuccess();
            
            Serial.println("[DEBUG] About to send ENROLL_COMPLETE");
            SocketClient::emitEnrollComplete(pendingName_, uid);

            Serial.println("[DEBUG] About to send ENROLL_LOG");
            SocketClient::emitEnrollLog(pendingName_, uid, true, "enrolled");

            Serial.println("[Enroll] DONE — " + pendingName_ + " → " + uid);
        }
    }
}

void reset() {
    FingerprintSensor::reset();
    pendingName_      = "";
    processingStartMs = 0;
    state_            = ENROLL_IDLE;
}

EnrollState state()      { return state_;       }
String      pendingName(){ return pendingName_; }

String stateString() {
    switch (state_) {
        case ENROLL_IDLE:             return "idle";
        case ENROLL_WAITING_SCAN1:    return "waiting_scan1";
        case ENROLL_SCAN1_DONE:       return "scan1_done";
        case ENROLL_WAITING_FOR_LIFT: return "waiting_for_lift";
        case ENROLL_WAITING_SCAN2:    return "waiting_scan2";
        case ENROLL_SCAN2_DONE:       return "scan2_done";
        case ENROLL_PROCESSING:       return "processing";
        case ENROLL_DONE:             return "done";
        case ENROLL_FAILED:           return "failed";
    }
    return "unknown";
}

} // namespace EnrollmentManager