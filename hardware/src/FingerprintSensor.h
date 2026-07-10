#pragma once
#include <Arduino.h>

// Simulates a fingerprint sensor so the rest of the system can be built
// and tested before real hardware is wired up.
//
// TODO: when you connect a real sensor (e.g. R307 / AS608), only this
// file's .cpp needs to change — captureTemplate1/2() should read from the
// real sensor instead of faking a value. Nothing else in the codebase
// depends on how a template is actually captured.
namespace FingerprintSensor {
  void reset();
  bool captureTemplate1();
  bool captureTemplate2();
  String combineToUID(); // combines both templates into one unique id
}
