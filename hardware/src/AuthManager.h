#pragma once
#include <Arduino.h>

// ── Failure / lockout flow ────────────────────────────────────────────────────
//
//  Each bad scan increments failedAttempts_.
//  failedAttempts_ >= MAX_FAILED_ATTEMPTS  →  AUTH_LOCKOUT  (1 min, no scans)
//    after lockout: failedAttempts_ resets, lockoutCount_++
//    lockoutCount_  >= MAX_LOCKOUTS         →  AUTH_ALARM
//
// ─────────────────────────────────────────────────────────────────────────────

enum AuthState {
  AUTH_IDLE,
  AUTH_WAITING_SCAN,
  AUTH_SCANNING,
  AUTH_PROCESSING,
  AUTH_VERIFYING,   // waiting on the backend to confirm the UID against MongoDB
  AUTH_GRANTED,
  AUTH_DENIED,
  AUTH_LOCKOUT,     // 1-minute cooldown after MAX_FAILED_ATTEMPTS — no scans accepted
  AUTH_ALARM        // fired after MAX_LOCKOUTS consecutive lockouts
};

// Drives the authorization flow. The actual "is this UID known?" check
// now happens on the backend (MongoDB), not locally — checkUID() sends
// a FINGERPRINT_SCAN event and onBackendResult() is called once the
// answer comes back over the WebSocket (OPEN_DOOR / DENY_ACCESS).
namespace AuthManager {
  void begin();   // registers the SocketClient command handler — call once in setup()
  void checkUID(const String &uid);
  void loop();
  void reset();

  // Called by SocketClient when the backend responds.
  void onBackendResult(bool granted);

  AuthState state();
  String    stateString();
  int       failedAttempts();
  int       lockoutCount();
}