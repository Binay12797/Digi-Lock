#include "Display.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include "AuthManager.h"
#include "EnrollmentManager.h"
#include "SocketClient.h"

#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define OLED_I2C_ADDR 0x3C
#define OLED_SDA_PIN  21
#define OLED_SCL_PIN  22

namespace {
  Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
  bool available = false;

  unsigned long lastDrawMs = 0;
  const unsigned long DRAW_INTERVAL_MS = 200; // ~5 fps - plenty for a status screen

  const char *modeLabel(int mode) {
    switch (mode) {
      case 0:  return "IDLE";
      case 1:  return "ENROLL";
      case 2:  return "AUTH";
      default: return "?";
    }
  }

  void drawHeader(int mode) {
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("MODE: ");
    display.println(modeLabel(mode));

    display.setCursor(88, 0);
    display.println(SocketClient::isConnected() ? "WS:UP" : "WS:--");

    display.drawLine(0, 10, SCREEN_WIDTH - 1, 10, SSD1306_WHITE);
  }

  void drawIdle() {
    display.setCursor(0, 20);
    display.println("Waiting for backend");
    display.setCursor(0, 32);
    display.println("to SET_MODE...");
  }

  void drawEnroll() {
    display.setCursor(0, 20);
    display.print("State: ");
    display.println(EnrollmentManager::stateString());

    display.setCursor(0, 34);
    String name = EnrollmentManager::pendingName();
    display.print("Name: ");
    display.println(name.isEmpty() ? "-" : name);
  }

  void drawAuth() {
    display.setCursor(0, 20);
    display.print("State: ");
    display.println(AuthManager::stateString());

    display.setCursor(0, 34);
    display.print("Fails: ");
    display.print(AuthManager::failedAttempts());
    display.println("/3");

    display.setCursor(0, 46);
    display.print("Lockouts: ");
    display.print(AuthManager::lockoutCount());
    display.println("/3");
  }
}

namespace Display {

void begin() {
  Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);
  available = display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDR);
  if (!available) {
    Serial.println("[Display] SSD1306 not found at 0x3C - screen disabled");
    return;
  }
  display.setTextColor(SSD1306_WHITE);
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Smart Lock");
  display.println("Booting...");
  display.display();
}

void render(int mode) {
  if (!available) return;

  unsigned long now = millis();
  if (now - lastDrawMs < DRAW_INTERVAL_MS) return;
  lastDrawMs = now;

  display.clearDisplay();
  drawHeader(mode);

  switch (mode) {
    case 1:  drawEnroll(); break;
    case 2:  drawAuth();   break;
    default: drawIdle();   break;
  }

  display.display();
}

} // namespace Display
