#pragma once

// Non-blocking buzzer control. Call Buzzer::loop() every iteration of
// the main loop() so tones automatically switch off after their duration.
namespace Buzzer {
  void begin();
  void tone(int freq, int durationMs);
  void off();
  void loop();

  // Predefined tones for state changes, used throughout the app so the
  // "meaning" of a beep stays consistent and defined in one place.
  void beepScan();     // short high: scan captured
  void beepProcess();  // mid: processing tick
  void beepSuccess();  // high long: success
  void beepFail();     // low long: failure
  void beepMode();     // mode switch
  void beepAlarm();    // sharp alarm chirp
}
