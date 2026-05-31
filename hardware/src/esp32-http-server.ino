/*
 * ============================================================
 *  Fingerprint Scanner Skeleton – ESP32
 *  IDE     : PlatformIO (VS Code)
 *  Board   : esp32dev  (Wokwi uses this for the generic ESP32)
 *  Baud    : 115200
 * ============================================================

 *  LED STATES
 *  ──────────
 *  IDLE      → Green blinks every 500 ms  ("waiting for scan")
 *  SCANNING  → Yellow ON only             ("reading finger…")
 *  AUTH OK   → Green solid 5 s            ("access granted")
 *  AUTH FAIL → Red solid 5 s              ("access denied")
 *
 *  SERIAL COMMANDS (send via Serial Monitor or HTML page)
 *  ──────────────────────────────────────────────────────
 *  'A'  → simulate AUTHORIZED scan
 *  'U'  → simulate UNAUTHORIZED scan
 *  'R'  → force reset to IDLE
 * ============================================================
 */

#include <Arduino.h>

// ── Pin definitions (ESP32 GPIO numbers) ─────────────────────
// Use only OUTPUT-capable, non-strapping GPIO pins.
// GPIO 2  is safe and has an on-board LED on most ESP32 devkits.
#define PIN_LED_GREEN   2   // Green  – idle blink / auth OK
#define PIN_LED_YELLOW  4   // Yellow – scanning
#define PIN_LED_RED     5   // Red    – auth fail

// ── Fingerprint sensor UART pins (for later / real hardware) ──
// These are wired in Wokwi's diagram but not used in skeleton.
#define FP_RX_PIN  16   // ESP32 RX2 ← sensor TX (yellow wire)
#define FP_TX_PIN  17   // ESP32 TX2 → sensor RX (white wire)

// ── Timing constants (milliseconds) ──────────────────────────
#define BLINK_INTERVAL   500   // green blink half-period (ms)
#define RESULT_HOLD_MS  5000   // how long to show auth result

// ── System states ─────────────────────────────────────────────
enum State {
  STATE_IDLE,       // waiting – green blinks
  STATE_SCANNING,   // finger detected – yellow on
  STATE_AUTH_OK,    // authorised – green solid
  STATE_AUTH_FAIL   // denied     – red solid
};

// ── Global variables ──────────────────────────────────────────
State         currentState  = STATE_IDLE;
bool          greenLedOn    = false;
unsigned long lastBlinkTime = 0;
unsigned long resultTimer   = 0;

// ── Helper: turn ALL LEDs off ─────────────────────────────────
void allLedsOff() {
  digitalWrite(PIN_LED_GREEN,  LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED,    LOW);
}

// ── State machine: transition to a new state ─────────────────
void enterState(State newState) {
  currentState = newState;
  allLedsOff();

  switch (newState) {

    case STATE_IDLE:
      Serial.println("[STATUS] IDLE – waiting for fingerprint…");
      greenLedOn    = false;
      lastBlinkTime = millis();
      break;

    case STATE_SCANNING:
      digitalWrite(PIN_LED_YELLOW, HIGH);
      Serial.println("[STATUS] SCANNING – reading fingerprint…");
      break;

    case STATE_AUTH_OK:
      digitalWrite(PIN_LED_GREEN, HIGH);
      resultTimer = millis();
      Serial.println("[STATUS] AUTH OK – access granted!");
      break;

    case STATE_AUTH_FAIL:
      digitalWrite(PIN_LED_RED, HIGH);
      resultTimer = millis();
      Serial.println("[STATUS] AUTH FAIL – access denied!");
      break;
  }
}

// ── Arduino setup ─────────────────────────────────────────────
void setup() {
  // USB Serial (for debug output and HTML page control)
  Serial.begin(115200);
  delay(500); // small delay so the serial monitor can connect

  // Configure LED GPIO pins
  pinMode(PIN_LED_GREEN,  OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED,    OUTPUT);

  // ── Real sensor UART setup (uncomment when using real hardware)
  // Serial2.begin(57600, SERIAL_8N1, FP_RX_PIN, FP_TX_PIN);

  // Start in idle
  enterState(STATE_IDLE);

  Serial.println("========================================");
  Serial.println("  Fingerprint Scanner – ESP32 Skeleton");
  Serial.println("  'A' = Authorized scan");
  Serial.println("  'U' = Unauthorized scan");
  Serial.println("  'R' = Force reset");
  Serial.println("========================================");
}

// ── Arduino main loop ─────────────────────────────────────────
void loop() {

  // ── 1. Read Serial commands (from PC Serial Monitor or HTML page) ──
  if (Serial.available() > 0) {
    char cmd = (char)Serial.read();

    switch (cmd) {

      case 'A':   // Simulate authorized scan
        if (currentState == STATE_IDLE) {
          enterState(STATE_SCANNING);
          delay(800);             // brief "reading" pause
          enterState(STATE_AUTH_OK);
        } else {
          Serial.println("[WARN] Command ignored – not in IDLE state.");
        }
        break;

      case 'U':   // Simulate unauthorized scan
        if (currentState == STATE_IDLE) {
          enterState(STATE_SCANNING);
          delay(800);
          enterState(STATE_AUTH_FAIL);
        } else {
          Serial.println("[WARN] Command ignored – not in IDLE state.");
        }
        break;

      case 'R':   // Force reset
        enterState(STATE_IDLE);
        Serial.println("[CMD] Manual reset.");
        break;

      default:
        break;    // ignore newlines, spaces, etc.
    }
  }

  // ── 2. State behaviour ────────────────────────────────────
  switch (currentState) {

    case STATE_IDLE:
      // Non-blocking green blink using millis() (not delay!)
      if (millis() - lastBlinkTime >= BLINK_INTERVAL) {
        lastBlinkTime = millis();
        greenLedOn    = !greenLedOn;
        digitalWrite(PIN_LED_GREEN, greenLedOn ? HIGH : LOW);
      }
      break;

    case STATE_SCANNING:
      // ── TODO (real hardware): poll Serial2 for sensor data here ──
      // Example:
      //   uint8_t p = finger.getImage();
      //   if (p == FINGERPRINT_OK) { ... image2Tz, fingerFastSearch ... }
      break;

    case STATE_AUTH_OK:
    case STATE_AUTH_FAIL:
      // Auto-reset after RESULT_HOLD_MS
      if (millis() - resultTimer >= RESULT_HOLD_MS) {
        enterState(STATE_IDLE);
      }
      break;
  }
}

/*
 * ============================================================
 *  NEXT STEPS – Adding the Real Fingerprint Sensor
 * ============================================================
 *
 *  1. Uncomment Serial2.begin() in setup().
 *  2. Add to platformio.ini lib_deps:
 *       adafruit/Adafruit Fingerprint Sensor Library
 *  3. At the top of this file add:
 *       #include <Adafruit_Fingerprint.h>
 *       Adafruit_Fingerprint finger(&Serial2);
 *  4. In STATE_SCANNING, call:
 *       finger.getImage()
 *       finger.image2Tz()
 *       finger.fingerFastSearch()
 *     and use finger.fingerID to decide AUTH_OK or AUTH_FAIL.
 *  5. Build an authorized ID list:
 *       const int authorizedIDs[] = {1, 2, 3};
 *     and check if finger.fingerID is in that array.
 *
 *  BONUS: ESP32 has Wi-Fi built in, so you can replace the
 *  USB Serial commands with an HTTP endpoint (WebServer.h)
 *  and control everything from the browser over Wi-Fi!
 * ============================================================
 */