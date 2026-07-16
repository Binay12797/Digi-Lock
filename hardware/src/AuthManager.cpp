#include "AuthManager.h"
#include "Buzzer.h"
#include "SocketClient.h"
#include "DoorManager.h"
#include "RGBLed.h"
#include <Arduino.h>

namespace {

  // ── State ──────────────────────────────────────────────────────────────────
  AuthState     state_       = AUTH_IDLE;
  unsigned long stateStartMs = 0;
  String        inputUID     = "";
  String        bufferedUID  = ""; // Holds typed Serial IDs until button is pressed

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

  // ── Hardware Configuration ─────────────────────────────────────────────────
  const int WOKWI_BUTTON_PIN = 12;
  int lastButtonState = HIGH;

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
      Buzzer::beepFail(); 
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
    String logReason = reason;
    if (logReason.isEmpty()) logReason = granted ? "match" : "no_match";
    SocketClient::emitAccessLog(inputUID, granted, logReason);

    if (granted) {
      state_          = AUTH_GRANTED;
      failedAttempts_ = 0;
      lockoutCount_   = 0;   
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
        return; 
      }
    }
    stateStartMs = millis();
  }

  // ── Non-Blocking Background Serial Listener (Timeout-Based) ────────────────
  void checkSerialInput() {
    static String incomingLine = ""; 
    static unsigned long lastCharMs = 0;
    const unsigned long SERIAL_TIMEOUT_MS = 500; 

    while (Serial.available() > 0) {
      char c = Serial.read();
      lastCharMs = millis(); 
      
      if (c == '\n' || c == '\r') {
        incomingLine.trim();
        if (incomingLine.length() >= 3) {
          bufferedUID = incomingLine;
          Serial.println("[Sim] Buffered UID: \"" + bufferedUID + "\" -> Ready! Press the physical button now.");
        }
        incomingLine = ""; 
        return; 
      }
      
      if (c >= 32 && incomingLine.length() < 32) {
        incomingLine += c;
      }
    }

    if (incomingLine.length() > 0 && (millis() - lastCharMs >= SERIAL_TIMEOUT_MS)) {
      incomingLine.trim();
      if (incomingLine.length() >= 3) {
        bufferedUID = incomingLine;
        Serial.println("[Sim] Buffered UID: \"" + bufferedUID + "\" -> Ready! Press the physical button now.");
      }
      incomingLine = ""; 
    }
  }

  // ── Non-Blocking Button Debounce Listener ──────────────────────────────────
  void checkPhysicalButton(unsigned long now) {
    static unsigned long lastDebounceTime = 0;
    const unsigned long DEBOUNCE_DELAY = 50; 
    static int stableButtonState = HIGH;

    int reading = digitalRead(WOKWI_BUTTON_PIN);

    // If the switch changed, reset the debounce timer
    if (reading != lastButtonState) {
      lastDebounceTime = now;
    }

    // Filter out transient noise by checking stability window
    if ((now - lastDebounceTime) > DEBOUNCE_DELAY) {
      if (reading != stableButtonState) {
        stableButtonState = reading;
        
        // Active LOW (Button pressed down)
        if (stableButtonState == LOW) {
          AuthManager::onScanButton();
        }
      }
    }
    lastButtonState = reading;
  }

} // anonymous namespace

// =============================================================================
namespace AuthManager {

  void begin() {
    pinMode(WOKWI_BUTTON_PIN, INPUT_PULLUP); // 🔌 Set up pullup for stable readings
    RGBLed::begin();
    RGBLed::setYellow();

    SocketClient::onCommand([](const String &command, JsonObject data) {
        if (command == "OPEN_DOOR") {
            DoorManager::unlockDoor();
            AuthManager::onBackendResult(true);
        }
        else if (command == "DENY_ACCESS") {
            AuthManager::onBackendResult(false);
        }
        else if (command == "AUTH_CHECK") {
            String uid = data["uid"] | "";
            if (!uid.isEmpty()) {
                AuthManager::checkUID(uid);
            }
        }
    });
  }

  void checkUID(const String &uid) {
      if (uid.isEmpty()) {
          Serial.println("[Auth] AUTH_CHECK received with empty UID");
          return;
      }
      if (!DoorManager::isLocked()) {
          Serial.println("[Auth] Door already unlocked.");
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

      if (state_ != AUTH_IDLE) {
          Serial.println("[Auth] AUTH_CHECK ignored: authentication already in progress");
          return;
      }

      inputUID = uid;
      state_ = AUTH_WAITING_SCAN;
      Serial.println("[Auth] Ready to scan UID: " + uid);
  }

  void onScanButton() {
      if (state_ == AUTH_IDLE) {
          Serial.println("[Auth] Walk-up scan detected. Initializing process...");
          
          if (!bufferedUID.isEmpty()) {
              inputUID = bufferedUID;
              Serial.println("[Sim] Using buffered ID: " + inputUID);
              bufferedUID = ""; // Consume it
          } else {
              inputUID = "user_65bc830f3a1e"; 
              Serial.println("[Sim] No buffered ID found. Using default fallback: " + inputUID);
          }
          state_ = AUTH_WAITING_SCAN; 
      }

      if (state_ != AUTH_WAITING_SCAN) {
          Serial.println("[Auth] Scan ignored: no active or pending scan state (Current: " + stateString() + ")");
          return;
      }

      state_ = AUTH_SCANNING;
      stateStartMs = millis();

      Buzzer::beepScan();
      Serial.println("[Auth] Scan started");
  }

  void reset() {
    state_ = AUTH_IDLE;
    inputUID = "";
    bufferedUID = ""; // 🧹 Clean up simulation buffer on manual reset
    failedAttempts_ = 0;
    lockoutCount_ = 0;
    RGBLed::setYellow();
  }

  void onBackendResult(bool granted) {
    if (state_ == AUTH_IDLE && granted) {
      applyResult(true, "admin_bypass");
      return;
    }
    if (state_ != AUTH_VERIFYING) return; 
    applyResult(granted);
  }

  void loop() {
    unsigned long now = millis();

    // ── Run background monitoring ──
    checkPhysicalButton(now); // 🔘 Listens for button pushes constantly
    
    if (state_ == AUTH_IDLE) {
      checkSerialInput(); // 🎧 Listens for test IDs typed in Serial Monitor
    }

    // ── State Machine ────────────────────────────────────────────────────────
    switch (state_) {
      case AUTH_IDLE:
        RGBLed::setYellow();
        break;
        
      case AUTH_WAITING_SCAN:
        break;

      case AUTH_SCANNING:
        RGBLed::setYellow();
        if (now - stateStartMs >= AUTH_SCANNING_MS) {
          state_ = AUTH_PROCESSING;
          stateStartMs = now;
          Buzzer::beepProcess();
        }
        break;

      case AUTH_PROCESSING:
        RGBLed::setYellow();
        if (now - stateStartMs >= AUTH_PROCESSING_MS) {
          state_ = AUTH_VERIFYING;
          stateStartMs = now;
          SocketClient::emitFingerprintScan(inputUID); 
        }
        break;

      case AUTH_VERIFYING:
        RGBLed::setYellow();
        if (now - stateStartMs >= AUTH_VERIFY_TIMEOUT_MS) {
          Serial.println("[Auth] Backend response timeout - denying");
          applyResult(false, "backend_timeout");
        }
        break;

      case AUTH_GRANTED:
        RGBLed::setGreen();
        if (now - stateStartMs >= AUTH_RESULT_HOLD_MS) {
          state_ = AUTH_IDLE;
          Serial.println("[Auth] Access hold expired — returning to idle");
        }
        break;

      case AUTH_DENIED:
        RGBLed::setRed();
        if (now - stateStartMs >= AUTH_RESULT_HOLD_MS) {
          state_ = AUTH_IDLE;
        }
        break;

      case AUTH_LOCKOUT:
        RGBLed::setSlowFlashRed();
        handleLockoutBuzzer(now);
        if (now - stateStartMs >= LOCKOUT_DURATION_MS) {
          failedAttempts_ = 0; 
          if (lockoutCount_ >= MAX_LOCKOUTS) {
            triggerAlarm();    
          } else {
            state_ = AUTH_IDLE;
            Serial.println("[Auth] Lockout #" + String(lockoutCount_) +
                           " expired — back to idle");
          }
        }
        break;

      case AUTH_ALARM:
        handleAlarmBuzzer(now);
        RGBLed::setFastFlashRed();
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