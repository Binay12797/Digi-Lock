#include "Buzzer.h"
#include "config.h"
#include <Arduino.h>

// IMPORTANT: platformio.ini pins `espressif32 @ 7.0.0`. Despite that
// platform version number sounding "new", the OFFICIAL PlatformIO
// espressif32 platform has never shipped ESP32 Arduino core v3.x - every
// release through the current 7.0.1 still bundles core v2.0.17. Core v3
// is only available via the unofficial `pioarduino` fork, which this
// project isn't using. So this file intentionally uses the v2
// channel-based LEDC API (ledcSetup / ledcAttachPin / ledcWrite(channel,..)
// / ledcDetachPin) - the pin-based v3 API (ledcAttach / ledcChangeFrequency)
// does NOT exist in this toolchain and will fail to compile.

namespace {
  const int PWM_CHANNEL    = 0;
  const int PWM_RESOLUTION = 8; // bits -> duty range 0-255

  unsigned long buzzerUntilMs = 0;
  int buzzerFreq = 0;
}

namespace Buzzer {

void begin() {
  pinMode(BUZZER_PIN, OUTPUT);
}

void tone(int freq, int durationMs) {
  buzzerFreq    = freq;
  buzzerUntilMs = millis() + durationMs;
  ledcSetup(PWM_CHANNEL, freq, PWM_RESOLUTION);
  ledcAttachPin(BUZZER_PIN, PWM_CHANNEL);
  ledcWrite(PWM_CHANNEL, 128); // 50% duty cycle
}

void off() {
  ledcWrite(PWM_CHANNEL, 0);
  ledcDetachPin(BUZZER_PIN);
  buzzerFreq = 0;
}

void loop() {
  if (buzzerFreq > 0 && millis() >= buzzerUntilMs) {
    off();
  }
}

void beepScan()    { tone(1200, 120); }
void beepProcess() { tone(800,  80);  }
void beepSuccess() { tone(1800, 300); }
void beepFail()    { tone(300,  500); }
void beepMode()    { tone(1000, 100); }
void beepAlarm()   { tone(2500, 250); }

} // namespace Buzzer