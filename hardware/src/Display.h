#pragma once
#include <Arduino.h>
#include "DoorManager.h"

// Non-blocking OLED status screen (SSD1306, 128x64, I2C on SDA=21/SCL=22,
// address 0x3C — matches oled1 in diagram.json). Purely a readout for
// demoing — it doesn't drive or gate any logic, so if the screen is
// missing/unwired the rest of the firmware is unaffected.
//
// Call Display::begin() once in setup() (after Serial.begin()), and
// Display::render(currentMode) every loop() iteration — it internally
// throttles its own refresh rate so calling it every loop is fine.
//
// currentMode contract (matches smart_lock_device.ino): 0 = normal
// operation / authentication (the default at boot), 1 = enrollment.
// There is no separate "idle" mode — the device is always doing one or
// the other, so mode 0 always renders the auth screen.
namespace Display {
  void begin();
  void render(int mode, DoorManager::DoorStatus status);; // 0 = authentication (default), 1 = enrollment
}