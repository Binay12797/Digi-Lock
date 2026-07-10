#include "EnrollmentManager.h"
#include "FingerprintSensor.h"
#include "Buzzer.h"
#include "SocketClient.h"

namespace {
  EnrollState   state_            = ENROLL_IDLE;
  String        pendingName_      = "";
  unsigned long processingStartMs = 0;

  const unsigned long PROCESSING_TIMEOUT_MS = 8000;
}

namespace EnrollmentManager {

// ── Initialisation ────────────────────────────────────────────────────────────
// Must be called once in setup(), AFTER SocketClient::begin().
void begin() {
  SocketClient::onCommand([](const String &command, JsonObject data) {

    if (command == "START_ENROLL") {
      String name = data["name"] | "";
      if (name.isEmpty()) {
        Serial.println("[Enroll] START_ENROLL received with no 'name' field — ignored");
        return;
      }
      EnrollmentManager::start(name);

    } else if (command == "CANCEL_ENROLL") {
      if (state_ == ENROLL_IDLE || state_ == ENROLL_DONE) return; // nothing active
      String nameAtCancel = pendingName_;
      EnrollmentManager::reset();
      SocketClient::emitEnrollFailed(nameAtCancel, "cancelled_by_admin");
      Serial.println("[Enroll] Cancelled by admin");
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

// Called by the main loop when the fingerprint sensor detects a finger
// while an enrollment is in the ENROLL_WAITING_SCAN1 stage.
void scan1() {
  if (state_ != ENROLL_WAITING_SCAN1) return;

  if (FingerprintSensor::captureTemplate1()) {
    state_ = ENROLL_SCAN1_DONE;
    Buzzer::beepScan();
    SocketClient::emitEnrollProgress("scan1_done", pendingName_);

    // Immediately advance to waiting for the second scan
    state_ = ENROLL_WAITING_SCAN2;
    SocketClient::emitEnrollProgress("waiting_scan2", pendingName_);
    Serial.println("[Enroll] Scan 1 done — waiting for scan 2");
  }
}

// Called by the main loop when the fingerprint sensor detects a finger
// while an enrollment is in the ENROLL_WAITING_SCAN2 stage.
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
  // ── Stage: brief pause after scan2 before processing ──────────────
  if (state_ == ENROLL_SCAN2_DONE) {
    unsigned long elapsed = millis() - processingStartMs;

    if (elapsed > PROCESSING_TIMEOUT_MS) {
      state_ = ENROLL_FAILED;
      Buzzer::beepFail();
      SocketClient::emitEnrollFailed(pendingName_, "processing_timeout");
      return;
    }
    if (elapsed > 1500) {
      state_ = ENROLL_PROCESSING;
      Buzzer::beepProcess();
      SocketClient::emitEnrollProgress("processing", pendingName_);
    }
  }

  // ── Stage: combine templates into a UID and report to backend ─────
  if (state_ == ENROLL_PROCESSING) {
    unsigned long elapsed = millis() - processingStartMs;

    if (elapsed > PROCESSING_TIMEOUT_MS) {
      state_ = ENROLL_FAILED;
      Buzzer::beepFail();
      SocketClient::emitEnrollFailed(pendingName_, "processing_timeout");
      return;
    }
    if (elapsed > 3000) {
      String uid = FingerprintSensor::combineToUID();
      if (uid.isEmpty()) {
        state_ = ENROLL_FAILED;
        Buzzer::beepFail();
        SocketClient::emitEnrollFailed(pendingName_, "template_combine_failed");
        return;
      }
      // Report to backend — it persists the UID against the user record
      // it already holds from the frontend form submission.
      state_ = ENROLL_DONE;
      Buzzer::beepSuccess();
      SocketClient::emitEnrollComplete(pendingName_, uid);
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
    case ENROLL_IDLE:           return "idle";
    case ENROLL_WAITING_SCAN1:  return "waiting_scan1";
    case ENROLL_SCAN1_DONE:     return "scan1_done";
    case ENROLL_WAITING_SCAN2:  return "waiting_scan2";
    case ENROLL_SCAN2_DONE:     return "scan2_done";
    case ENROLL_PROCESSING:     return "processing";
    case ENROLL_DONE:           return "done";
    case ENROLL_FAILED:         return "failed";
  }
  return "unknown";
}

} // namespace EnrollmentManager