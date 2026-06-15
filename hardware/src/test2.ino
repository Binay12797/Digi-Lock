/*
 * ============================================================
 *  DigiLock – ID Storage Mode (Serial Control)
 *  Board   : esp32dev  (Wokwi / PlatformIO)
 *  File    : src/main.cpp
 *  Baud    : 115200
 *
 *  CIRCUIT
 *  ────────
 *  GPIO 2  -> 220R -> Green  LED -> GND   (idle blink / granted)
 *  GPIO 4  -> 220R -> Yellow LED -> GND   (enrolling)
 *  GPIO 5  -> 220R -> Red    LED -> GND   (removed)
 *  GPIO 21 -> OLED SDA
 *  GPIO 22 -> OLED SCL
 *  3V3     -> OLED VCC
 *  GND     -> OLED GND
 *
 *  SERIAL COMMANDS (type in Serial Monitor)
 *  ─────────────────────────────────────────
 *  A  →  Add / Enroll a new fingerprint ID
 *  R  →  Remove the last enrolled ID
 *  V  →  Verify / Grant access to last enrolled ID
 *  L  →  List all stored IDs
 * ============================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ── OLED ─────────────────────────────────────────────────────
#define SCREEN_W 128
#define SCREEN_H  64
Adafruit_SSD1306 display(SCREEN_W, SCREEN_H, &Wire, -1);

// ── Pins ─────────────────────────────────────────────────────
#define PIN_GREEN  2
#define PIN_YELLOW 4
#define PIN_RED    5

// ── ID storage ───────────────────────────────────────────────
#define MAX_IDS 10
String storedIDs[MAX_IDS];
int    idCount = 0;

// ── Timing ───────────────────────────────────────────────────
#define BLINK_MS   500
#define ENROLL_MS 3000
#define GRANT_MS  5000

unsigned long lastBlink  = 0;
unsigned long resultTime = 0;
bool          greenOn    = false;

// ── States ───────────────────────────────────────────────────
enum State { IDLE, ENROLLED, REMOVED, GRANTED };
State currentState = IDLE;

// ── LED helper ───────────────────────────────────────────────
void ledsOff() {
  digitalWrite(PIN_GREEN,  LOW);
  digitalWrite(PIN_YELLOW, LOW);
  digitalWrite(PIN_RED,    LOW);
}

// ── OLED helper ──────────────────────────────────────────────
void showOLED(const char* top, String mid, const char* bot) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(top);

  display.setTextSize(2);
  display.setCursor(0, 20);
  display.print(mid);

  display.setTextSize(1);
  display.setCursor(0, 52);
  display.print(bot);

  display.display();
}

// ── State machine ────────────────────────────────────────────
void enterState(State s, String id) {
  currentState = s;
  ledsOff();
  switch (s) {
    case IDLE:
      greenOn   = false;
      lastBlink = millis();
      showOLED("DigiLock", "Waiting...", "Ready for scan");
      Serial.println("[IDLE] Ready. Commands: A=Add  R=Remove  V=Verify  L=List");
      break;
    case ENROLLED:
      digitalWrite(PIN_YELLOW, HIGH);
      resultTime = millis();
      showOLED("Enrolled!", id, "New ID stored");
      Serial.println("[ENROLLED] " + id);
      Serial.println("{\"ok\":true,\"action\":\"enrolled\",\"id\":\"" + id + "\"}");
      break;
    case REMOVED:
      digitalWrite(PIN_RED, HIGH);
      resultTime = millis();
      showOLED("Removed!", id, "ID deleted");
      Serial.println("[REMOVED] " + id);
      Serial.println("{\"ok\":true,\"action\":\"removed\",\"id\":\"" + id + "\"}");
      break;
    case GRANTED:
      digitalWrite(PIN_GREEN, HIGH);
      resultTime = millis();
      showOLED("Access", "Granted!", id.c_str());
      Serial.println("[GRANTED] " + id);
      Serial.println("{\"ok\":true,\"action\":\"granted\",\"id\":\"" + id + "\"}");
      break;
  }
}

void enterIdle() { enterState(IDLE, ""); }

// ── Next available ID ─────────────────────────────────────────
String nextID() {
  for (int n = 1; n <= MAX_IDS; n++) {
    char buf[8];
    snprintf(buf, sizeof(buf), "FP%03d", n);
    String cand = String(buf);
    bool taken = false;
    for (int i = 0; i < idCount; i++) {
      if (storedIDs[i] == cand) { taken = true; break; }
    }
    if (!taken) return cand;
  }
  return "";
}

// ── Command handlers ─────────────────────────────────────────
void handleAdd() {
  if (idCount >= MAX_IDS) {
    Serial.println("[ERROR] Max 10 IDs reached");
    Serial.println("{\"ok\":false,\"error\":\"Max 10 IDs reached\"}");
    return;
  }
  String id = nextID();
  storedIDs[idCount++] = id;
  enterState(ENROLLED, id);
}

void handleRemove() {
  if (idCount == 0) {
    Serial.println("[ERROR] No IDs stored");
    Serial.println("{\"ok\":false,\"error\":\"No IDs stored\"}");
    return;
  }
  String removed = storedIDs[--idCount];
  storedIDs[idCount] = "";
  enterState(REMOVED, removed);
}

void handleVerify() {
  if (idCount == 0) {
    Serial.println("[ERROR] No IDs stored to verify");
    Serial.println("{\"ok\":false,\"error\":\"No IDs stored\"}");
    return;
  }
  // Verify the most recently enrolled ID
  String id = storedIDs[idCount - 1];
  enterState(GRANTED, id);
}

void handleList() {
  Serial.println("──────────────────────────");
  Serial.print("Stored IDs (");
  Serial.print(idCount);
  Serial.println("/10):");
  if (idCount == 0) {
    Serial.println("  (none)");
  } else {
    for (int i = 0; i < idCount; i++) {
      Serial.print("  [");
      Serial.print(i + 1);
      Serial.print("] ");
      Serial.println(storedIDs[i]);
    }
  }
  Serial.println("──────────────────────────");
}

// ── setup ─────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(PIN_GREEN,  OUTPUT);
  pinMode(PIN_YELLOW, OUTPUT);
  pinMode(PIN_RED,    OUTPUT);
  ledsOff();

  Wire.begin(21, 22);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("[WARN] OLED not found – continuing without display");
  }
  display.clearDisplay();
  display.display();

  Serial.println("========================================");
  Serial.println("  DigiLock ready (Serial Control Mode)");
  Serial.println("  Commands:");
  Serial.println("    A  →  Add / Enroll new ID");
  Serial.println("    R  →  Remove last ID");
  Serial.println("    V  →  Verify (grant access)");
  Serial.println("    L  →  List all stored IDs");
  Serial.println("========================================");

  enterIdle();
}

// ── loop ──────────────────────────────────────────────────────
void loop() {

  // ── Read Serial command ───────────────────────────────────
  if (Serial.available()) {
    char cmd = toupper((char)Serial.read());

    // Flush leftover newline / carriage-return bytes
    while (Serial.available() && (Serial.peek() == '\n' || Serial.peek() == '\r')) {
      Serial.read();
    }

    switch (cmd) {
      case 'A': handleAdd();    break;
      case 'R': handleRemove(); break;
      case 'V': handleVerify(); break;
      case 'L': handleList();   break;
      default:
        if (cmd > 32) {   // ignore whitespace silently
          Serial.println("[?] Unknown command. Use A / R / V / L");
        }
        break;
    }
  }

  // ── State timeouts ────────────────────────────────────────
  switch (currentState) {
    case IDLE:
      // Blink green LED while idle
      if (millis() - lastBlink >= BLINK_MS) {
        lastBlink = millis();
        greenOn   = !greenOn;
        digitalWrite(PIN_GREEN, greenOn ? HIGH : LOW);
      }
      break;

    case ENROLLED:
    case REMOVED:
      if (millis() - resultTime >= ENROLL_MS) enterIdle();
      break;

    case GRANTED:
      if (millis() - resultTime >= GRANT_MS)  enterIdle();
      break;
  }
}