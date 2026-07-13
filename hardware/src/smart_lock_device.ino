#include <WiFi.h>
#include "config.h"
#include "Buzzer.h"
#include "EnrollmentManager.h"
#include "AuthManager.h"
#include "SocketClient.h"
#include "Display.h"

// 0 = normal operation (authentication)
// 1 = enrollment mode
// The React frontend / backend controls this via a { "command": "SET_MODE", "mode": N } message.
int currentMode = 0;
String currentLockStatus = "LOCKED";

unsigned long lastStatusMs = 0;
const unsigned long STATUS_INTERVAL_MS = 5000;

// ── Handler for the events this file itself owns ────────────────────
// EnrollmentManager::begin() and AuthManager::begin() each register
// their own SocketClient::onCommand() subscriber for the commands they
// own (START_ENROLL/CANCEL_ENROLL/ENROLL_SCAN1/ENROLL_SCAN2 and
// OPEN_DOOR/DENY_ACCESS/AUTH_CHECK respectively — see SocketClient.h).
// This file only needs to react to SET_MODE (system-level) and to
// START_ENROLL for the purpose of switching currentMode, since only
// main.ino knows about currentMode.
void handleSystemCommand(const String &command, JsonObject data) {
  if (command == "SET_MODE") {
      int mode = data["mode"] | 0;
      currentMode = mode;

      if (mode == 1) {
          EnrollmentManager::reset();
      }

      Buzzer::beepMode();
      Serial.println("[Mode] -> " + String(mode));
  }
}
// ── Setup / loop ────────────────────────────────────────────────────

void connectWiFi() {
  IPAddress dns(8, 8, 8, 8);
  WiFi.config(INADDR_NONE, INADDR_NONE, INADDR_NONE, dns);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println(" Connected! IP: " + WiFi.localIP().toString());
}

void setup() {
  // Force ESP32 to use Google's DNS server
  
  Serial.begin(115200);
  Buzzer::begin();
  Display::begin();
  connectWiFi();

  EnrollmentManager::begin();   // registers its own command handler
  AuthManager::begin();         // registers its own command handler
  SocketClient::onCommand(handleSystemCommand);
  SocketClient::begin();        // connect last, once all handlers are registered

  Serial.println("[System] Ready.");
}

void loop() {
  SocketClient::loop();
  Buzzer::loop();
  Display::render(currentMode);

  if(currentMode == 1)
  {
      EnrollmentManager::loop();
  }
  else
  {
      AuthManager::loop();
  }

  unsigned long now = millis();
  if (now - lastStatusMs >= STATUS_INTERVAL_MS) {
    lastStatusMs = now;
    if (SocketClient::isConnected()) {
      SocketClient::emitStatus(currentMode, currentLockStatus);
    } else {
      Serial.println("[WS] Postponing status update: Waiting for active connection...");
    }
   // SocketClient::emitStatus(currentMode);
  }

  delay(2);
}
