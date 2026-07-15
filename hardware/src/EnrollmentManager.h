#pragma once
#include <Arduino.h>

// ── Enrollment flow ───────────────────────────────────────────────────────────
//
//  Backend sends:   START_ENROLL  { name }
//  ESP replies:     ENROLL_PROGRESS { state: "started"          }
//  [user places finger]
//  ESP replies:     ENROLL_PROGRESS { state: "waiting_scan1"    }
//  [FingerprintSensor captures template 1]
//  ESP replies:     ENROLL_PROGRESS { state: "scan1_done"       }
//  ESP replies:     ENROLL_PROGRESS { state: "waiting_scan2"    }
//  [user lifts + re-places finger]
//  [FingerprintSensor captures template 2]
//  ESP replies:     ENROLL_PROGRESS { state: "scan2_done"       }
//  ESP replies:     ENROLL_PROGRESS { state: "processing"       }
//  [combine templates → UID]
//  ESP replies:     ENROLL_COMPLETE { name, fingerprint }
//       — OR —     ENROLL_FAILED   { name, reason }
//
//  Backend can abort at any time with:  CANCEL_ENROLL
//
// ─────────────────────────────────────────────────────────────────────────────

enum EnrollState {
  ENROLL_IDLE,
  ENROLL_WAITING_SCAN1,  // start() called — waiting for first finger placement
  ENROLL_SCAN1_DONE,
  ENROLL_WAITING_SCAN2,  // scan1 done — waiting for lift + re-placement
  ENROLL_SCAN2_DONE,
  ENROLL_PROCESSING,
  ENROLL_DONE,
  ENROLL_FAILED
};

// Drives the two-scan enrollment flow. Storage no longer happens on the
// device — when a fingerprint is successfully captured, the result is
// reported to the backend (via SocketClient) which is responsible for
// writing it to MongoDB.
namespace EnrollmentManager {
  void begin();   // registers START_ENROLL / CANCEL_ENROLL handlers — call once in setup()
  void start(const String &name);
  void scan1();
  void scan2();
  void loop();
  void reset();
  void onButtonPressed();

  EnrollState state();
  String      stateString();
  String      pendingName();
}