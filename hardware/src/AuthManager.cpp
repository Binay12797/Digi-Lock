#include "AuthManager.h"
#include "Buzzer.h"
#include "SocketClient.h"
#include "DoorManager.h"

namespace {

  // ── State ──────────────────────────────────────────────────────────────────
  AuthState     state_       = AUTH_IDLE;
  unsigned long stateStartMs = 0;
  String        inputUID     = "";

  // ── Failure / lockout counters ─────────────────────────────────────────────
  int failedAttempts_ = 0;
  int lockoutCount_   = 0;

  const int MAX_FAILED_ATTEMPTS = 3;   // bad scans before a lockout
  const int MAX_LOCKOUTS        = 2;   // lockouts before the alarm fires

  // ── Alarm ──────────────────────────────────────────────────────────────────
  unsigned long alarmStartMs    = 0;
  unsigned long lastAlarmBeepMs = 0;
  const unsigned long ALARM_DURATION_MS      = 30000;
  const unsigned long ALARM_BEEP_INTERVAL_MS = 500;

  // ── Lockout ────────────────────────────────────────────────────────────────
  unsigned long lastLockoutBeepMs = 0;
  const unsigned long LOCKOUT_DURATION_MS      = 60000; // 1 minute
  const unsigned long LOCKOUT_BEEP_INTERVAL_MS = 2000;  // slow beep while locked

  // ── Auth timing ────────────────────────────────────────────────────────────
  const unsigned long AUTH_WAITING_MS        = 1000;
  const unsigned long AUTH_SCANNING_MS       = 700;
  const unsigned long AUTH_PROCESSING_MS     = 900;
  const unsigned long AUTH_VERIFY_TIMEOUT_MS = 5000;
  const unsigned long AUTH_RESULT_HOLD_MS    = 3000;

  // ── Helpers ────────────────────────────────────────────────────────────────
  void handleAlarmBuzzer(unsigned long now) {
    if (now - lastAlarmBeepMs >= ALARM_BEEP_INTERVAL_MS) {
      lastAlarmBeepMs = now;
      Buzzer::beepAlarm();
    }
  }

  void handleLockoutBuzzer(unsigned long now) {
    if (now - lastLockoutBeepMs >= LOCKOUT_BEEP_INTERVAL_MS) {
      lastLockoutBeepMs = now;
      Buzzer::beepFail(); // short low beep to signal "still locked"
    }
  }

  void triggerAlarm() {
    state_          = AUTH_ALARM;
    alarmStartMs    = millis();
    lastAlarmBeepMs = alarmStartMs - ALARM_BEEP_INTERVAL_MS;
    SocketClient::emitAlarm(lockoutCount_);
    Serial.println("[Auth] ALARM triggered after " + String(lockoutCount_) + " lockouts");
  }

  void applyResult(bool granted, const String &reason = "") {
    // Access log: one entry per completed attempt, regardless of outcome,
    // so the backend's access-log collection has a full history. Reason
    // defaults to a sensible value per outcome when the caller doesn't
    // supply one (e.g. plain granted/denied vs. a timeout).
    String logReason = reason;
    if (logReason.isEmpty()) logReason = granted ? "match" : "no_match";
    SocketClient::emitAccessLog(inputUID, granted, logReason);

    if (granted) {
      state_          = AUTH_GRANTED;
      failedAttempts_ = 0;
      lockoutCount_   = 0;   // full reset on a successful auth
      Buzzer::beepSuccess();
      Serial.println("[Auth] GRANTED for UID: " + inputUID);
    } else {
      state_ = AUTH_DENIED;
      failedAttempts_++;
      Buzzer::beepFail();
      Serial.println("[Auth] DENIED for UID: " + inputUID +
                     " (fail " + String(failedAttempts_) + "/" + String(MAX_FAILED_ATTEMPTS) + ")");

      if (failedAttempts_ >= MAX_FAILED_ATTEMPTS) {
        lockoutCount_++;
        Serial.println("[Auth] LOCKOUT #" + String(lockoutCount_) + " started (1 min)");
        state_            = AUTH_LOCKOUT;
        stateStartMs      = millis();
        lastLockoutBeepMs = stateStartMs - LOCKOUT_BEEP_INTERVAL_MS;
        return; // stateStartMs already set
      }
    }
    stateStartMs = millis();
  }

} // anonymous namespace

// =============================================================================
namespace AuthManager {

void begin() {
  SocketClient::onCommand([](const String &command, JsonObject data) {
  if (command == "OPEN_DOOR"){
    DoorManager::unlockDoor();
    AuthManager::onBackendResult(true);
  }
  else if (command == "DENY_ACCESS"){
    AuthManager::onBackendResult(false);
  }
  else if (command == "AUTH_CHECK"){
    String uid = data["uid"] | "";
    if (!uid.isEmpty())
      AuthManager::checkUID(uid);
  }
  });
}

void checkUID(const String &uid) {
  if (uid.isEmpty()) {
    Serial.println("[Auth] AUTH_CHECK received with empty UID");
    return;
  }
  if (state_ == AUTH_WAITING_SCAN ||
      state_ == AUTH_SCANNING ||
      state_ == AUTH_PROCESSING ||
      state_ == AUTH_VERIFYING) {

    Serial.println("[Auth] AUTH_CHECK ignored: authentication already in progress");
    return;
  }
  if (state_ == AUTH_LOCKOUT) {
    Serial.println("[Auth] AUTH_CHECK ignored: device is in lockout");
    return;
  }
  if (state_ == AUTH_ALARM) {
    Serial.println("[Auth] AUTH_CHECK ignored: alarm active");
    return;
  }
  inputUID = uid;
  state_ = AUTH_WAITING_SCAN;
  stateStartMs = millis();
  Serial.println("[Auth] Check started for UID: " + uid);
}

void reset() {
  state_          = AUTH_IDLE;
  inputUID        = "";
  failedAttempts_ = 0;
  lockoutCount_   = 0;
}

void onBackendResult(bool granted) {
  if (state_ != AUTH_VERIFYING) return; // stale / unexpected response — ignore
  applyResult(granted);
}

void loop() {
  unsigned long now = millis();

  switch (state_) {

    case AUTH_WAITING_SCAN:
      if (now - stateStartMs >= AUTH_WAITING_MS) {
        state_ = AUTH_SCANNING;
        stateStartMs = now;
        Buzzer::beepScan();
      }
      break;

    case AUTH_SCANNING:
      if (now - stateStartMs >= AUTH_SCANNING_MS) {
        state_ = AUTH_PROCESSING;
        stateStartMs = now;
        Buzzer::beepProcess();
      }
      break;

    case AUTH_PROCESSING:
      if (now - stateStartMs >= AUTH_PROCESSING_MS) {
        state_ = AUTH_VERIFYING;
        stateStartMs = now;
        SocketClient::emitFingerprintScan(inputUID); // → backend looks up MongoDB
      }
      break;

    case AUTH_VERIFYING:
      // Waiting for onBackendResult(). Fail-safe: deny on timeout.
      if (now - stateStartMs >= AUTH_VERIFY_TIMEOUT_MS) {
        Serial.println("[Auth] Backend response timeout - denying");
        applyResult(false, "backend_timeout");
      }
      break;

    case AUTH_GRANTED:
    case AUTH_DENIED:
      if (now - stateStartMs >= AUTH_RESULT_HOLD_MS) {
        state_ = AUTH_IDLE;
      }
      break;

    // ── 1-minute lockout ────────────────────────────────────────────────────
    case AUTH_LOCKOUT:
      handleLockoutBuzzer(now);
      if (now - stateStartMs >= LOCKOUT_DURATION_MS) {
        failedAttempts_ = 0; // reset per-lockout counter
        if (lockoutCount_ >= MAX_LOCKOUTS) {
          triggerAlarm();    // escalate to full alarm
        } else {
          state_ = AUTH_IDLE;
          Serial.println("[Auth] Lockout #" + String(lockoutCount_) +
                         " expired — back to idle");
        }
      }
      break;

    // ── Alarm ───────────────────────────────────────────────────────────────
    case AUTH_ALARM:
      handleAlarmBuzzer(now);
      if (now - alarmStartMs >= ALARM_DURATION_MS) {
        state_          = AUTH_IDLE;
        failedAttempts_ = 0;
        lockoutCount_   = 0;
        Buzzer::off();
        Serial.println("[Auth] Alarm reset after timeout");
      }
      break;

    default:
      break;
  }
}

AuthState state()        { return state_;        }
int       failedAttempts(){ return failedAttempts_; }
int       lockoutCount()  { return lockoutCount_;  }

String stateString() {
  switch (state_) {
    case AUTH_IDLE:         return "idle";
    case AUTH_WAITING_SCAN: return "waiting_scan";
    case AUTH_SCANNING:     return "scanning";
    case AUTH_PROCESSING:   return "processing";
    case AUTH_VERIFYING:    return "verifying";
    case AUTH_GRANTED:      return "granted";
    case AUTH_DENIED:       return "denied";
    case AUTH_LOCKOUT:      return "lockout";
    case AUTH_ALARM:        return "alarm";
  }
  return "unknown";
}

} // namespace AuthManager