#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>

// ── MESSAGE PROTOCOL ──────────────────────────────────────────────────
//
// Device → Backend  (all have a "type" field):
//   { "type": "HELLO",            "deviceId": "..."                      }
//   { "type": "STATUS_UPDATE",    "deviceId": "...", "mode": N           }
//   { "type": "FINGERPRINT_SCAN", "fingerprint": "12345"                 }
//   { "type": "ENROLL_PROGRESS",  "state": "...", "name": "..."          }
//   { "type": "ENROLL_COMPLETE",  "name": "...", "fingerprint": "..."    }
//   { "type": "ENROLL_FAILED",    "name": "...", "reason": "..."         }
//   { "type": "ENROLL_LOG",       "name": "...", "fingerprint": "...",
//                                  "success": bool, "reason": "...",
//                                  "uptimeMs": N                         }
//   { "type": "ACCESS_LOG",       "deviceId": "...", "fingerprint": "...",
//                                  "granted": bool, "reason": "...",
//                                  "uptimeMs": N                         }
//   { "type": "ALARM",            "attempts": N                          }
//
// ACCESS_LOG / ENROLL_LOG are intentionally flat, self-describing JSON
// objects — the backend should be able to `db.collection.insertOne(msg)`
// (plus its own server-side timestamp) with no reshaping. Add/rename
// fields here and in SocketClient.cpp's emitAccessLog/emitEnrollLog as
// your log schema evolves; nothing else in the firmware needs to change.
//
// Backend → Device  (all have a "command" field):
//   { "command": "OPEN_DOOR"                        }   // auth granted
//   { "command": "DENY_ACCESS"                      }   // auth denied
//   { "command": "AUTH_CHECK",   "uid": "..."       }   // trigger a test auth attempt
//   { "command": "START_ENROLL", "name": "..."      }   // begin enrollment
//   { "command": "CANCEL_ENROLL"                    }   // abort enrollment
//   { "command": "ENROLL_SCAN1"                     }   // trigger scan step 1
//   { "command": "ENROLL_SCAN2"                     }   // trigger scan step 2
//   { "command": "SET_MODE",     "mode": N          }   // 0=idle 1=enroll 2=auth
// ─────────────────────────────────────────────────────────────────────

namespace SocketClient {
  void begin();
  void loop();
  bool isConnected();

  // ── Outgoing ─────────────────────────────────────────────────────
  void emitHello();
  void emitStatus(int mode);
  void emitFingerprintScan(const String &uid);
  void emitEnrollProgress(const String &state, const String &name);
  void emitEnrollComplete(const String &name, const String &uid);
  void emitEnrollFailed(const String &name, const String &reason);
  // Structured log entries, meant to feed an admin-facing log table.
  void emitEnrollLog(const String &name, const String &uid, bool success, const String &reason);
  void emitAccessLog(const String &uid, bool granted, const String &reason);
  void emitAlarm(int attempts);

  // ── Incoming ─────────────────────────────────────────────────────
  // Call onCommand() once per subscriber (e.g. AuthManager::begin(),
  // EnrollmentManager::begin()). All registered handlers are called for
  // every incoming command — each handler should ignore commands it does
  // not own. Up to MAX_COMMAND_HANDLERS (4) subscribers are supported.
  typedef void (*CommandHandler)(const String &command, JsonObject data);
  void onCommand(CommandHandler handler);
}