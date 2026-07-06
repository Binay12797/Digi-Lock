#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <uri/UriBraces.h>
#include "web_assets.h"

#define WIFI_SSID     "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define WIFI_CHANNEL  6

WebServer server(80);

// ── Buzzer ────────────────────────────────────────────────
const int BUZZER_PIN = 14;
unsigned long buzzerUntilMs = 0;
int buzzerFreq = 0;

void buzzerTone(int freq, int durationMs) {
  buzzerFreq    = freq;
  buzzerUntilMs = millis() + durationMs;
  ledcSetup(0, freq, 8);
  ledcAttachPin(BUZZER_PIN, 0);
  ledcWrite(0, 128); // 50% duty cycle
}

void buzzerOff() {
  ledcWrite(0, 0);
  ledcDetachPin(BUZZER_PIN);
  buzzerFreq = 0;
}

void handleBuzzer() {
  if (buzzerFreq > 0 && millis() >= buzzerUntilMs) {
    buzzerOff();
  }
}

// Predefined tones for state changes
void beepScan()    { buzzerTone(1200, 120); }  // short high: scan captured
void beepProcess() { buzzerTone(800,  80);  }  // mid: processing tick
void beepSuccess() { buzzerTone(1800, 300); }  // high long: success
void beepFail()    { buzzerTone(300,  500); }  // low long: failure
void beepMode()    { buzzerTone(1000, 100); }  // mode switch
void beepAuth()    { buzzerTone(1500, 200); }  // auth event
void beepAlarm()   { buzzerTone(2500, 250); }  // sharp alarm chirp

// ── System state ─────────────────────────────────────────
int currentMode = 0; // 0=none, 1=Enrollment, 2=Authorization

// ── Enrollment states ─────────────────────────────────────
enum EnrollState {
  ENROLL_IDLE,
  ENROLL_SCAN1_DONE,
  ENROLL_SCAN2_DONE,
  ENROLL_PROCESSING,
  ENROLL_STORING,
  ENROLL_DONE,
  ENROLL_FAILED
};
EnrollState enrollState = ENROLL_IDLE;

unsigned long processingStartMs = 0;
const unsigned long PROCESSING_TIMEOUT_MS = 8000;

String pendingName = "";

// ── In-memory DB ──────────────────────────────────────────
struct EnrolledUser {
  String name;
  String uniqueID;
  unsigned long enrolledAt;
};

const int DB_MAX = 50;
EnrolledUser enrolledDB[DB_MAX];
int dbCount = 0;

// ── Auth states ───────────────────────────────────────────
enum AuthState {
  AUTH_IDLE,          // ready, no check in progress
  AUTH_WAITING_SCAN,  // waiting for scan (starts after button press)
  AUTH_SCANNING,      // scanning the print
  AUTH_PROCESSING,    // processing scan / extracting print
  AUTH_VERIFYING,     // checking id against database
  AUTH_GRANTED,       // authorized access granted
  AUTH_DENIED,        // unauthorized access attempt
  AUTH_ALARM          // too many failed attempts - alarm active
};

AuthState     authState        = AUTH_IDLE;
unsigned long authStateStartMs = 0;
String        authInputUID     = "";

int failedAttempts = 0;
const int MAX_FAILED_ATTEMPTS = 3;

unsigned long alarmStartMs    = 0;
unsigned long lastAlarmBeepMs = 0;
const unsigned long ALARM_DURATION_MS      = 30000; // alarm resets after 30s
const unsigned long ALARM_BEEP_INTERVAL_MS = 500;

// Simulated timing for each authorization step (ms)
const unsigned long AUTH_WAITING_MS     = 1000;
const unsigned long AUTH_SCANNING_MS    = 700;
const unsigned long AUTH_PROCESSING_MS  = 900;
const unsigned long AUTH_VERIFY_MS      = 600;
const unsigned long AUTH_RESULT_HOLD_MS = 3000; // how long granted/denied is shown before idle

bool lastAuthGranted  = false;
bool lastAuthHappened = false;

String authStateString();
String enrollStateString();

// ── Database abstraction (temp / in-memory) ──────────────

bool enrollDB_save(const EnrolledUser &user) {
  if (dbCount >= DB_MAX) return false;
  enrolledDB[dbCount++] = user;
  Serial.println("[DB] Saved: " + user.name + " -> " + user.uniqueID);
  return true;
}

String enrollDB_toJSON() {
  String json = "[";
  for (int i = 0; i < dbCount; i++) {
    if (i > 0) json += ",";
    json += "{\"name\":\"" + enrolledDB[i].name
          + "\",\"uid\":\"" + enrolledDB[i].uniqueID
          + "\",\"ts\":"   + String(enrolledDB[i].enrolledAt) + "}";
  }
  json += "]";
  return json;
}

bool enrollDB_findByUID(const String &uid) {
  for (int i = 0; i < dbCount; i++)
    if (enrolledDB[i].uniqueID == uid) return true;
  return false;
}

void enrollDB_clear() {
  dbCount = 0;
  Serial.println("[DB] Cleared.");
}

// ── Fingerprint abstraction (simulated) ──────────────────

String fp_template1 = "";
String fp_template2 = "";

void fp_resetTemplates() {
  fp_template1 = "";
  fp_template2 = "";
}

bool fp_captureTemplate1() {
  fp_template1 = "T1_" + String(millis(), HEX);
  return fp_template1.length() > 0;
}

bool fp_captureTemplate2() {
  fp_template2 = "T2_" + String(millis(), HEX);
  return fp_template2.length() > 0;
}

String fp_combineToUID() {
  if (fp_template1.isEmpty() || fp_template2.isEmpty()) return "";
  String uid = "FP-";
  for (int i = 0; i < 4; i++)
    uid += String((fp_template1[i % fp_template1.length()] ^
                   fp_template2[i % fp_template2.length()]), HEX);
  uid.toUpperCase();
  return uid;
}

// ── Enrollment state machine ──────────────────────────────

void enrollStart(const String &name) {
  pendingName = name;
  fp_resetTemplates();
  enrollState = ENROLL_IDLE;
  processingStartMs = 0;
  Serial.println("[Enroll] Started for: " + name);
}

void enrollScan1() {
  if (enrollState != ENROLL_IDLE) return;
  if (fp_captureTemplate1()) {
    enrollState = ENROLL_SCAN1_DONE;
    beepScan();
    Serial.println("[Enroll] Template 1 captured: " + fp_template1);
  }
}

void enrollScan2() {
  if (enrollState != ENROLL_SCAN1_DONE) return;
  if (fp_captureTemplate2()) {
    enrollState = ENROLL_SCAN2_DONE;
    processingStartMs = millis();
    beepScan();
    Serial.println("[Enroll] Template 2 captured: " + fp_template2);
  }
}

void enrollProcessLoop() {
  if (enrollState == ENROLL_SCAN2_DONE) {
    unsigned long elapsed = millis() - processingStartMs;
    if (elapsed > PROCESSING_TIMEOUT_MS) {
      enrollState = ENROLL_FAILED;
      beepFail();
      Serial.println("[Enroll] FAILED - processing timeout");
      return;
    }
    if (elapsed > 1500) {
      enrollState = ENROLL_PROCESSING;
      beepProcess();
    }
  }
  if (enrollState == ENROLL_PROCESSING) {
    unsigned long elapsed = millis() - processingStartMs;
    if (elapsed > 3000) {
      String uid = fp_combineToUID();
      if (uid.isEmpty()) {
        enrollState = ENROLL_FAILED;
        beepFail();
        return;
      }
      enrollState = ENROLL_STORING;
      EnrolledUser u;
      u.name       = pendingName;
      u.uniqueID   = uid;
      u.enrolledAt = millis();
      if (enrollDB_save(u)) {
        enrollState = ENROLL_DONE;
        beepSuccess();
        Serial.println("[Enroll] DONE - " + u.name + " -> " + u.uniqueID);
      } else {
        enrollState = ENROLL_FAILED;
        beepFail();
        Serial.println("[Enroll] FAILED - database full");
      }
    }
  }
}

void enrollReset() {
  fp_resetTemplates();
  pendingName = "";
  enrollState = ENROLL_IDLE;
}

String enrollStateString() {
  switch (enrollState) {
    case ENROLL_IDLE:       return "idle";
    case ENROLL_SCAN1_DONE: return "scan1_done";
    case ENROLL_SCAN2_DONE: return "scan2_done";
    case ENROLL_PROCESSING: return "processing";
    case ENROLL_STORING:    return "storing";
    case ENROLL_DONE:       return "done";
    case ENROLL_FAILED:     return "failed";
  }
  return "unknown";
}

// ── Authorization state machine ──────────────────────────

String authStateString() {
  switch (authState) {
    case AUTH_IDLE:         return "idle";
    case AUTH_WAITING_SCAN: return "waiting_scan";
    case AUTH_SCANNING:     return "scanning";
    case AUTH_PROCESSING:   return "processing";
    case AUTH_VERIFYING:    return "verifying";
    case AUTH_GRANTED:      return "granted";
    case AUTH_DENIED:       return "denied";
    case AUTH_ALARM:        return "alarm";
  }
  return "unknown";
}

// Kicks off a check. Ignored if a check is already running or the
// system is in an active alarm lockdown.
void authCheck(const String &uid) {
  if (authState == AUTH_WAITING_SCAN || authState == AUTH_SCANNING ||
      authState == AUTH_PROCESSING   || authState == AUTH_VERIFYING ||
      authState == AUTH_ALARM) {
    return;
  }
  if (uid.isEmpty()) return;

  authInputUID     = uid;
  authState        = AUTH_WAITING_SCAN;
  authStateStartMs = millis();
  lastAuthHappened = false;
  Serial.println("[Auth] Check started for UID: " + uid);
}

void authReset() {
  authState        = AUTH_IDLE;
  authInputUID     = "";
  lastAuthHappened = false;
}

// Repeated chirp while the alarm is active (non-blocking).
void handleAlarmBuzzer(unsigned long now) {
  if (now - lastAlarmBeepMs >= ALARM_BEEP_INTERVAL_MS) {
    lastAlarmBeepMs = now;
    beepAlarm();
  }
}

void authProcessLoop() {
  unsigned long now = millis();

  switch (authState) {
    case AUTH_WAITING_SCAN:
      if (now - authStateStartMs >= AUTH_WAITING_MS) {
        authState = AUTH_SCANNING;
        authStateStartMs = now;
        beepScan();
      }
      break;

    case AUTH_SCANNING:
      if (now - authStateStartMs >= AUTH_SCANNING_MS) {
        authState = AUTH_PROCESSING;
        authStateStartMs = now;
        beepProcess();
      }
      break;

    case AUTH_PROCESSING:
      if (now - authStateStartMs >= AUTH_PROCESSING_MS) {
        authState = AUTH_VERIFYING;
        authStateStartMs = now;
      }
      break;

    case AUTH_VERIFYING:
      if (now - authStateStartMs >= AUTH_VERIFY_MS) {
        bool found = enrollDB_findByUID(authInputUID);
        lastAuthHappened = true;
        lastAuthGranted  = found;

        if (found) {
          authState = AUTH_GRANTED;
          failedAttempts = 0;
          beepSuccess();
          Serial.println("[Auth] GRANTED for UID: " + authInputUID);
        } else {
          authState = AUTH_DENIED;
          failedAttempts++;
          beepFail();
          Serial.println("[Auth] DENIED for UID: " + authInputUID +
                          " (fail " + String(failedAttempts) + "/" + String(MAX_FAILED_ATTEMPTS) + ")");

          if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            authState       = AUTH_ALARM;
            alarmStartMs    = now;
            lastAlarmBeepMs = now - ALARM_BEEP_INTERVAL_MS; // fire immediately
            Serial.println("[Auth] ALARM triggered - too many failed attempts");
          }
        }
        authStateStartMs = now;
      }
      break;

    case AUTH_GRANTED:
    case AUTH_DENIED:
      if (now - authStateStartMs >= AUTH_RESULT_HOLD_MS) {
        authState = AUTH_IDLE;
      }
      break;

    case AUTH_ALARM:
      handleAlarmBuzzer(now);
      if (now - alarmStartMs >= ALARM_DURATION_MS) {
        authState      = AUTH_IDLE;
        failedAttempts = 0;
        buzzerOff();
        Serial.println("[Auth] Alarm reset after timeout");
      }
      break;

    default:
      break;
  }
}

// ── HTTP routes ───────────────────────────────────────────

void setup() {
  Serial.begin(115200);

  // Buzzer
  pinMode(BUZZER_PIN, OUTPUT);

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(100); Serial.print("."); }
  Serial.println(" Connected! IP: " + WiFi.localIP().toString());

  // ── Static pages / assets (served straight from firmware) ──
  server.on("/", HTTP_GET, []() {
    serveEmbedded(server, index_html_start, index_html_end, "text/html");
  });

  server.on("/style.css", HTTP_GET, []() {
    serveEmbedded(server, style_css_start, style_css_end, "text/css");
  });

  server.on("/app.js", HTTP_GET, []() {
    serveEmbedded(server, app_js_start, app_js_end, "application/javascript");
  });

  // Mode switch: flips the state machine, then serves the matching
  // static page. The page itself pulls all dynamic info from /api/*.
  server.on(UriBraces("/mode/{}"), []() {
    int m = server.pathArg(0).toInt();
    if (m == 1 || m == 2) {
      currentMode = m;
      if (m == 1) enrollReset();
      else        authReset();
      beepMode();
      Serial.println("[Mode] -> " + String(m == 1 ? "Enrollment" : "Authorization"));
    }
    if (currentMode == 1)      serveEmbedded(server, enroll_html_start, enroll_html_end, "text/html");
    else if (currentMode == 2) serveEmbedded(server, auth_html_start, auth_html_end, "text/html");
    else                       serveEmbedded(server, index_html_start, index_html_end, "text/html");
  });

  // ── General status API (used by the home page) ────────────
  server.on("/api/status", []() {
    String json = "{";
    json += "\"mode\":"     + String(currentMode) + ",";
    json += "\"dbCount\":"  + String(dbCount) + ",";
    json += "\"maxUsers\":" + String(DB_MAX) + ",";
    json += "\"ip\":\""     + WiFi.localIP().toString() + "\"";
    json += "}";
    server.send(200, "application/json", json);
  });

  // ── Enrollment REST API ─────────────────────────────────────
  server.on("/api/enroll/start", []() {
    String name = server.arg("name");
    if (name.isEmpty()) { server.send(400, "text/plain", "name required"); return; }
    enrollStart(name);
    server.send(200, "application/json", "{\"ok\":true}");
  });

  server.on("/api/enroll/scan1", []() {
    enrollScan1();
    server.send(200, "application/json", "{\"state\":\"" + enrollStateString() + "\"}");
  });

  server.on("/api/enroll/scan2", []() {
    enrollScan2();
    server.send(200, "application/json", "{\"state\":\"" + enrollStateString() + "\"}");
  });

  server.on("/api/enroll/state", []() {
    server.send(200, "application/json",
      "{\"state\":\"" + enrollStateString() + "\",\"name\":\"" + pendingName + "\"}");
  });

  server.on("/api/enroll/reset", []() {
    enrollReset();
    server.send(200, "application/json", "{\"ok\":true}");
  });

  // ── Database API ─────────────────────────────────────────────
  server.on("/api/users", []() {
    server.send(200, "application/json", enrollDB_toJSON());
  });

  server.on("/api/db/clear", []() {
    enrollDB_clear();
    server.sendHeader("Location", "/mode/1");
    server.send(302);
  });

  // ── Authorization REST API ───────────────────────────────────
  server.on("/api/auth/check", []() {
    String uid = server.arg("uid");
    if (uid.isEmpty()) { server.send(400, "application/json", "{\"error\":\"uid required\"}"); return; }
    authCheck(uid);
    server.send(200, "application/json", "{\"ok\":true,\"state\":\"" + authStateString() + "\"}");
  });

  server.on("/api/auth/state", []() {
    unsigned long remain = 0;
    if (authState == AUTH_ALARM) {
      unsigned long elapsed = millis() - alarmStartMs;
      remain = (elapsed < ALARM_DURATION_MS) ? (ALARM_DURATION_MS - elapsed) / 1000 : 0;
    }
    String json = "{";
    json += "\"state\":\""       + authStateString() + "\",";
    json += "\"uid\":\""         + authInputUID + "\",";
    json += "\"attempts\":"      + String(failedAttempts) + ",";
    json += "\"maxAttempts\":"   + String(MAX_FAILED_ATTEMPTS) + ",";
    json += "\"alarmRemaining\":" + String(remain) + ",";
    json += "\"granted\":"       + String(lastAuthGranted  ? "true" : "false") + ",";
    json += "\"happened\":"      + String(lastAuthHappened ? "true" : "false");
    json += "}";
    server.send(200, "application/json", json);
  });

  server.on("/api/auth/reset", []() {
    authReset();
    server.send(200, "application/json", "{\"ok\":true}");
  });

  server.begin();
  currentMode = 0;
  Serial.println("[HTTP] Server started - http://localhost:8180");
}

// ──────────────────────────────────────────────────────────
// LOOP
// ──────────────────────────────────────────────────────────

void loop() {
  server.handleClient();
  enrollProcessLoop();
  authProcessLoop();
  handleBuzzer();
  delay(2);
}