#include "Buzzer.h"
#include "config.h"
#include <Arduino.h>

namespace {
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
  ledcSetup(0, freq, 8);
  ledcAttachPin(BUZZER_PIN, 0);
  ledcWrite(0, 128); // 50% duty cycle
}

void off() {
  ledcWrite(0, 0);
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
