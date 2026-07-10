#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>

// ── MESSAGE PROTOCOL ──────────────────────────────────────────────────
//
// Device → Backend  (all have a "type" field):
//   { "type": "HELLO",            "deviceId": "..."                      }
//   { "type": "FINGERPRINT_SCAN", "fingerprint": "12345"                 }
//   { "type": "ENROLL_PROGRESS",  "state": "...", "name": "..."          }
//   { "type": "ENROLL_COMPLETE",  "name": "...", "fingerprint": "..."    }
//   { "type": "ENROLL_FAILED",    "name": "...", "reason": "..."         }
//   { "type": "ALARM",            "attempts": N                          }
//
// Backend → Device  (all have a "command" field):
//   { "command": "OPEN_DOOR"                        }   // auth granted
//   { "command": "DENY_ACCESS"                      }   // auth denied
//   { "command": "START_ENROLL", "name": "..."      }   // begin enrollment
//   { "command": "CANCEL_ENROLL"                    }   // abort enrollment
//   { "command": "SET_MODE",     "mode": N          }   // future
// ─────────────────────────────────────────────────────────────────────

namespace SocketClient {
  void begin();
  void loop();
  bool isConnected();

  // ── Outgoing ─────────────────────────────────────────────────────
  void emitHello();
  void emitFingerprintScan(const String &uid);
  void emitEnrollProgress(const String &state, const String &name);
  void emitEnrollComplete(const String &name, const String &uid);
  void emitEnrollFailed(const String &name, const String &reason);
  void emitAlarm(int attempts);

  // ── Incoming ─────────────────────────────────────────────────────
  // Call onCommand() once per subscriber (e.g. AuthManager::begin(),
  // EnrollmentManager::begin()). All registered handlers are called for
  // every incoming command — each handler should ignore commands it does
  // not own. Up to MAX_COMMAND_HANDLERS (4) subscribers are supported.
  typedef void (*CommandHandler)(const String &command, JsonObject data);
  void onCommand(CommandHandler handler);
}