#include "FingerprintSensor.h"

namespace {
  String template1 = "";
  String template2 = "";
}

namespace FingerprintSensor {

void reset() {
  template1 = "";
  template2 = "";
}

bool captureTemplate1() {
  template1 = "T1_" + String(millis(), HEX);
  return template1.length() > 0;
}

bool captureTemplate2() {
  template2 = "T2_" + String(millis(), HEX);
  return template2.length() > 0;
}

String combineToUID() {
  if (template1.isEmpty() || template2.isEmpty()) return "";
  String uid = "FP-";
  for (int i = 0; i < 4; i++) {
    uid += String((template1[i % template1.length()] ^
                   template2[i % template2.length()]), HEX);
  }
  uid.toUpperCase();
  return uid;
}

} // namespace FingerprintSensor
