#pragma once
#include <Arduino.h>

// Non-blocking OLED status screen (SSD1306, 128x64, I2C on SDA=21/SCL=22,
// address 0x3C — matches oled1 in diagram.json). Purely a readout for
// demoing — it doesn't drive or gate any logic, so if the screen is
// missing/unwired the rest of the firmware is unaffected.
//
// Call Display::begin() once in setup() (after Serial.begin()), and
// Display::render(currentMode) every loop() iteration — it internally
// throttles its own refresh rate so calling it every loop is fine.
namespace Display {
  void begin();
  void render(int mode); // 0 = idle, 1 = enrollment, 2 = authorization
}
