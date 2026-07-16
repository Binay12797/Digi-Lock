#include <WiFi.h>
#include "config.h"
#include "Buzzer.h"
#include "EnrollmentManager.h"
#include "AuthManager.h"
#include "SocketClient.h"
#include "Display.h"
#include "DoorManager.h"
#include "Button.h"
#include "RGBLed.h" // 🟢 Resolved Git conflict cleanly

// 0 = normal operation (authentication)
// 1 = enrollment mode
int currentMode = 0;

unsigned long lastStatusMs = 0;
const unsigned long STATUS_INTERVAL_MS = 5000;

// ── System Command Intercept ───────────────────────────────────────────
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

// ── WiFi Initialization ───────────────────────────────────────────────
void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println(" Connected! IP: " + WiFi.localIP().toString());
}

// ── Unified Button Manager Event Router ───────────────────────────────
void handleButton(ButtonManager::ButtonEvent event) {
    switch (event) {
        case ButtonManager::LOCK_BUTTON_PRESSED:
            Serial.println("[Button] Lock command triggered.");
            DoorManager::lockDoor();
            AuthManager::reset();
            break;

        case ButtonManager::SCAN_BUTTON_PRESSED:
            // 🟢 If in Enrollment mode, step through the simulated Wokwi touch states
            if (currentMode == 1) {
                if (EnrollmentManager::state() == ENROLL_IDLE) {
                    Serial.println("[Button] Starting enrollment sequence...");
                    SocketClient::emitScanTrigger(); 
                } 
                else if (EnrollmentManager::state() == ENROLL_WAITING_SCAN1) {
                    Serial.println("[Button] Simulating touch: Scan 1");
                    EnrollmentManager::scan1();
                } 
                else if (EnrollmentManager::state() == ENROLL_WAITING_SCAN2) {
                    Serial.println("[Button] Simulating touch: Scan 2");
                    EnrollmentManager::scan2();
                }
            } 
            // 🔵 If in Normal mode, process standard hardware authorization
            else {
                Serial.println("[Button] Simulating scan for Auth check...");
                AuthManager::onScanButton();
            }
            break;

        default:
            break;
    }
}

// ── Setup ─────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Buzzer::begin();
  Display::begin();
  RGBLed::begin(); // 🟢 Initializing your new indicator layout
  connectWiFi();

  EnrollmentManager::begin();   
  AuthManager::begin();         
  DoorManager::begin();
  ButtonManager::begin();
  
  ButtonManager::onEvent(handleButton);
  SocketClient::onCommand(handleSystemCommand);
  SocketClient::begin();        
  Serial.println("[System] Ready.");
}

// ── Main Loop ─────────────────────────────────────────────────────────
void loop() {
  SocketClient::loop();
  Buzzer::loop();
  ButtonManager::loop();
  RGBLed::loop(); // 🟢 Keeps your status animations processing smoothly
  
  Display::render(
      currentMode,
      DoorManager::getDoorStatus()
  );
  
  if (currentMode == 1) {
    EnrollmentManager::loop();
  } else {
    AuthManager::loop();
  }
  
  unsigned long now = millis();
  if (now - lastStatusMs >= STATUS_INTERVAL_MS) {
    lastStatusMs = now;
    DoorManager::sendStatusUpdate();
  }
  delay(2);
}