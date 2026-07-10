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
    DynamicJsonDocument doc(512);
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
      commandHandlers_[i](<command, obj>);
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
  DynamicJsonDocument doc(128);
  doc["type"]     = "HELLO";
  doc["deviceId"] = DEVICE_ID;
  sendMessage(doc);
}

// { "type": "FINGERPRINT_SCAN", "fingerprint": "<uid>" }
void emitFingerprintScan(const String &uid) {
  DynamicJsonDocument doc(128);
  doc["type"]        = "FINGERPRINT_SCAN";
  doc["fingerprint"] = uid;
  sendMessage(doc);
}

// { "type": "ENROLL_PROGRESS", "state": "...", "name": "..." }
void emitEnrollProgress(const String &state, const String &name) {
  DynamicJsonDocument doc(192);
  doc["type"]  = "ENROLL_PROGRESS";
  doc["state"] = state;
  doc["name"]  = name;
  sendMessage(doc);
}

// { "type": "ENROLL_COMPLETE", "name": "...", "fingerprint": "<uid>" }
void emitEnrollComplete(const String &name, const String &uid) {
  DynamicJsonDocument doc(192);
  doc["type"]        = "ENROLL_COMPLETE";
  doc["name"]        = name;
  doc["fingerprint"] = uid;
  sendMessage(doc);
}

// { "type": "ENROLL_FAILED", "name": "...", "reason": "..." }
void emitEnrollFailed(const String &name, const String &reason) {
  DynamicJsonDocument doc(192);
  doc["type"]   = "ENROLL_FAILED";
  doc["name"]   = name;
  doc["reason"] = reason;
  sendMessage(doc);
}

// { "type": "ALARM", "attempts": N }
void emitAlarm(int attempts) {
  DynamicJsonDocument doc(96);
  doc["type"]     = "ALARM";
  doc["attempts"] = attempts;
  sendMessage(doc);
}

} // namespace SocketClient