#include "SocketClient.h"
#include "config.h"

#include <WebSocketsClient.h>
#include <ArduinoJson.h>

namespace {
  WebSocketsClient ws;
  bool connected = false;

  // ── Multi-subscriber command dispatch ─────────────────────────────
  const int MAX_COMMAND_HANDLERS = 4;
  void (*commandHandlers_[MAX_COMMAND_HANDLERS])(const String &, JsonObject) = {};
  int commandHandlerCount_ = 0;

  // ── Dispatch incoming { "command": "..." } frames ─────────────────
  void handleIncomingMessage(uint8_t *payload, size_t length) {
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, payload, length);
    if (err) {
      Serial.println("[WS] JSON parse error: " + String(err.c_str()));
      return;
    }

    String command = doc["command"] | "";
    if (command.isEmpty()) {
      Serial.println("[WS] Received message with no 'command' field");
      return;
    }

    Serial.println("[WS] Command received: " + command);

    // Notify every registered subscriber
    JsonObject obj = doc.as<JsonObject>();
    for (int i = 0; i < commandHandlerCount_; i++) {
      commandHandlers_[i](command, obj);
    }
  }

  // ── Raw WebSocket event callback ──────────────────────────────────
  void wsEvent(WStype_t type, uint8_t *payload, size_t length) {
    switch (type) {
      case WStype_DISCONNECTED:
        connected = false;
        Serial.println("[WS] Disconnected");
        break;

      case WStype_CONNECTED:
        connected = true;
        Serial.println("[WS] Connected to backend");
        SocketClient::emitHello();
        break;

      case WStype_TEXT:
        handleIncomingMessage(payload, length);
        break;

      case WStype_ERROR:
        Serial.println("[WS] Error");
        break;

      default:
        break;
    }
  }

  // ── Build and send a flat outgoing message ────────────────────────
  void sendMessage(JsonDocument &doc) {
    String out;
    serializeJson(doc, out);
    Serial.println("[WS] Sending: " + out);
    ws.sendTXT(out);
  }
}

// ── Public API ────────────────────────────────────────────────────────

namespace SocketClient {

void begin() {
  ws.begin(WS_HOST, WS_PORT, WS_PATH);
  
  //ws.setExtraHeaders("ngrok-skip-browser-warning: true\r\n");
  //ws.setExtraHeaders("Host: art-dinginess-activity.ngrok-free.dev");
  ws.onEvent(wsEvent);
  ws.setReconnectInterval(5000);
}

void loop() {
  ws.loop();
}

bool isConnected() {
  return connected;
}

// Register a handler — appended to the list, NOT overwriting
void onCommand(CommandHandler handler) {
  if (commandHandlerCount_ < MAX_COMMAND_HANDLERS) {
    commandHandlers_[commandHandlerCount_++] = handler;
  } else {
    Serial.println("[WS] onCommand: MAX_COMMAND_HANDLERS reached, handler ignored");
  }
}

// { "type": "HELLO", "deviceId": "..." }
void emitHello() {
  JsonDocument doc;
  doc["type"]     = "HELLO";
  doc["deviceId"] = DEVICE_ID;
  sendMessage(doc);
}

// { "type": "STATUS_UPDATE", "deviceId": "...", "mode": N, "status": "LOCKED|UNLOCKED" }
void emitStatus(int mode, const String &status) {
  JsonDocument doc;
  doc["type"]     = "STATUS_UPDATE";
  doc["deviceId"] = DEVICE_ID;
  doc["mode"]     = mode;
  doc["status"]   = status;
  sendMessage(doc);
}

// { "type": "FINGERPRINT_SCAN", "fingerprint": "<uid>" }
void emitFingerprintScan(const String &uid) {
  JsonDocument doc;
  doc["type"]        = "FINGERPRINT_SCAN";
  doc["fingerprint"] = uid;
  sendMessage(doc);
}

// { "type": "ENROLL_PROGRESS", "state": "...", "name": "..." }
void emitEnrollProgress(const String &state, const String &name) {
  JsonDocument doc;
  doc["type"]  = "ENROLL_PROGRESS";
  doc["state"] = state;
  doc["name"]  = name;
  sendMessage(doc);
}

// { "type": "ENROLL_COMPLETE", "name": "...", "fingerprint": "<uid>" }
void emitEnrollComplete(const String &name, const String &uid) {
  JsonDocument doc;
  doc["type"]        = "ENROLL_COMPLETE";
  doc["name"]        = name;
  doc["fingerprint"] = uid;
  sendMessage(doc);
}

// { "type": "ENROLL_FAILED", "name": "...", "reason": "..." }
void emitEnrollFailed(const String &name, const String &reason) {
  JsonDocument doc;
  doc["type"]   = "ENROLL_FAILED";
  doc["name"]   = name;
  doc["reason"] = reason;
  sendMessage(doc);
}

// { "type": "ENROLL_LOG", "name": "...", "fingerprint": "...", "success": bool,
//   "reason": "...", "uptimeMs": N }
// A structured, self-describing record meant for an admin-facing
// enrollment log table/collection on the backend. Fields are flat and
// named to match the backend schema 1:1 — edit here (and the .h decl)
// if that schema changes; nothing else in the firmware calls this
// directly except EnrollmentManager.
void emitEnrollLog(const String &name, const String &uid, bool success, const String &reason) {
  JsonDocument doc;
  doc["type"]        = "ENROLL_LOG";
  doc["name"]        = name;
  doc["fingerprint"] = uid;
  doc["success"]     = success;
  doc["reason"]      = reason;
  doc["uptimeMs"]    = millis();
  sendMessage(doc);
}

// { "type": "ACCESS_LOG", "deviceId": "...", "fingerprint": "...", "granted": bool,
//   "reason": "...", "uptimeMs": N }
// Same idea as emitEnrollLog, for the access/auth attempt log. Sent for
// every completed auth attempt (granted or denied) so the backend can
// keep a full access history, independent of the FINGERPRINT_SCAN
// lookup message.
void emitAccessLog(const String &uid, bool granted, const String &reason) {
  JsonDocument doc;
  doc["type"]        = "ACCESS_LOG";
  doc["deviceId"]    = DEVICE_ID;
  doc["fingerprint"] = uid;
  doc["granted"]     = granted;
  doc["reason"]      = reason;
  doc["uptimeMs"]    = millis();
  sendMessage(doc);
}

// { "type": "ALARM", "attempts": N }
void emitAlarm(int attempts) {
  JsonDocument doc;
  doc["type"]     = "ALARM";
  doc["attempts"] = attempts;
  sendMessage(doc);
}

} // namespace SocketClient