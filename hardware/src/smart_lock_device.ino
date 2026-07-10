#include <WiFi.h>
#include "config.h"
#include "Buzzer.h"
#include "EnrollmentManager.h"
#include "AuthManager.h"
#include "SocketClient.h"

// 0 = idle, 1 = enrollment mode, 2 = authorization mode
// The React frontend / backend controls this via a "mode:set" socket event.
int currentMode = 0;

unsigned long lastStatusMs = 0;
const unsigned long STATUS_INTERVAL_MS = 5000;

// ── Handlers for events coming from the backend ────────────────────
// Kept as plain functions (not lambdas) so they're easy to find/edit
// once you know what your backend actually sends.

void setMode(int mode) {
  currentMode = mode;
  if (mode == 1)      EnrollmentManager::reset();
  else if (mode == 2) AuthManager::reset();
  Buzzer::beepMode();
  Serial.println("[Mode] -> " + String(mode));
}

void handleEnrollStart(const String &name) {
  currentMode = 1;
  EnrollmentManager::start(name);
}

void handleEnrollScan1() { EnrollmentManager::scan1(); }
void handleEnrollScan2() { EnrollmentManager::scan2(); }

void handleAuthCheck(const String &uid) {
  currentMode = 2;
  AuthManager::checkUID(uid);
}

void handleAuthResult(bool granted) {
  AuthManager::onBackendResult(granted);
}

// ── Setup / loop ────────────────────────────────────────────────────

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println(" Connected! IP: " + WiFi.localIP().toString());
}

void setup() {
  Serial.begin(115200);
  Buzzer::begin();
  connectWiFi();

  SocketClient::onModeSet(setMode);
  SocketClient::onEnrollStart(handleEnrollStart);
  SocketClient::onEnrollScan1(handleEnrollScan1);
  SocketClient::onEnrollScan2(handleEnrollScan2);
  SocketClient::onAuthCheck(handleAuthCheck);
  SocketClient::onAuthResult(handleAuthResult);
  SocketClient::begin();

  Serial.println("[System] Ready.");
}

void loop() {
  SocketClient::loop();
  Buzzer::loop();

  if (currentMode == 1)      EnrollmentManager::loop();
  else if (currentMode == 2) AuthManager::loop();

  unsigned long now = millis();
  if (now - lastStatusMs >= STATUS_INTERVAL_MS) {
    lastStatusMs = now;
    SocketClient::emitStatus(currentMode);
  }

  delay(2);
}
