#include "FingerprintSensor.h"


namespace {
  String template1 = "";
  String template2 = "";
  unsigned long scan1Time = 0;
    String template1 = "";
    String template2 = "";
    int nextFingerprintId = 1;
}

namespace FingerprintSensor {

void reset() {
  template1 = "";
  template2 = "";
  scan1Time = 0;
}
bool isFingerRemoved() {
  // In a software simulation, we fake the "finger lifted" action 
  // by ensuring at least 1.5 seconds have passed since the first scan.
  // This gives the frontend time to breathe and transition states cleanly.
  if (scan1Time == 0) return true;
  return (millis() - scan1Time > 1500);
}
bool captureTemplate1() {
  template1 = "T1_" + String(millis(), HEX);
  return template1.length() > 0;
}

bool captureTemplate2() {
  template2 = "T2_" + String(millis(), HEX);
  return template2.length() > 0;
}

// String combineToUID() {
//   if (template1.isEmpty() || template2.isEmpty()) return "";
//   String uid = "FP-";
//   for (int i = 0; i < 4; i++) {
//     uid += String((template1[i % template1.length()] ^
//                    template2[i % template2.length()]), HEX);
//   }
//   uid.toUpperCase();
//   return uid;
// }
String combineToUID() {
  if (template1.isEmpty() || template2.isEmpty()) return "";
  
  // 1. Seed Arduino's internal random number generator using the dynamic timestamps
  // This breaks the predictable millisecond loop pattern
  randomSeed(millis() + scan1Time);
  
  // 2. Generate distinct random hex segments
  long randomValue1 = random(0x1000, 0xFFFF);
  long randomValue2 = random(0x1000, 0xFFFF);
  
  // 3. Construct a properly formatted unique string token
  String uid = "FP-" + String(randomValue1, HEX) + "-" + String(randomValue2, HEX);
  uid.toUpperCase();
  
  return uid;
}
} // namespace FingerprintSensor
