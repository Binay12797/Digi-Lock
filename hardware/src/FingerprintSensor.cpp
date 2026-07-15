#include "FingerprintSensor.h"


namespace {
    String template1 = "";
    String template2 = "";
    int nextFingerprintId = 1;
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
    if (template1.isEmpty() || template2.isEmpty())
        return "";

    char buffer[12];
    sprintf(buffer, "FP-%04d", nextFingerprintId++);

    return String(buffer);
}
} // namespace FingerprintSensor
