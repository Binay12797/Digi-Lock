/* ESP32 WebSocket IoT Server - Enrollment / Authorization Mode Demo
   Based on Wokwi ESP32 HTTP Server example, converted to WebSocket transport
   Connect a WebSocket client to ws://localhost:8180 (see wokwi.toml) and send
   text messages "/", "/mode/1", or "/mode/2" to navigate.
*/
#include <WiFi.h>
#include <WiFiClient.h>
#include <WebSocketsServer.h>

#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define WIFI_CHANNEL 6

WebSocketsServer webSocket = WebSocketsServer(81);

const int LED_GREEN  = 25; // Enrollment indicator (part 1)
const int LED_RED    = 26; // Enrollment indicator (part 2)
const int LED_YELLOW = 27; // Authorization indicator

// System mode: 0 = none selected, 1 = Enrollment, 2 = Authorization
int currentMode = 0;

void updateLeds() {
  if (currentMode == 1) {
    // Enrollment: green + red ON, yellow OFF
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_YELLOW, LOW);
  } else if (currentMode == 2) {
    // Authorization: only yellow ON
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, HIGH);
  } else {
    // No mode selected: all off
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, LOW);
  }
}

// ---------- Home page: mode selector ----------
void sendHomePage(uint8_t num) {
  String response = R"(
    <!DOCTYPE html><html>
      <head>
        <title>ESP32 Access Control System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          html { font-family: sans-serif; text-align: center; }
          body { display: inline-flex; flex-direction: column; padding: 2em; }
          h1 { margin-bottom: 0.3em; }
          p.status { font-size: 1.1em; margin-bottom: 1.5em; color: #555; }
          .btn { background-color: #357; border: none; color: #fff; padding: 0.9em 1.6em;
                 font-size: 1.3em; text-decoration: none; border-radius: 8px; margin: 0.6em; }
          .btn.active { background-color: #2a8; }
          .leds { margin-top: 2em; font-size: 1em; color: #333; }
          .dot { display: inline-block; width: 18px; height: 18px; border-radius: 50%; margin: 0 6px; vertical-align: middle; }
        </style>
      </head>
      <body>
        <h1>ESP32 Access Control System</h1>
        <p class="status">Current mode: <b>MODE_TEXT</b></p>
        <div>
          <a href="/mode/1" class="btn ENROLL_ACTIVE">Enrollment System</a>
          <a href="/mode/2" class="btn AUTH_ACTIVE">Authorization System</a>
        </div>
        <div class="leds">
          <span class="dot" style="background:GREEN_COLOR;"></span>Green
          <span class="dot" style="background:RED_COLOR;"></span>Red
          <span class="dot" style="background:YELLOW_COLOR;"></span>Yellow
        </div>
      </body>
    </html>
  )";

  String modeText = currentMode == 1 ? "Enrollment System" :
                     currentMode == 2 ? "Authorization System" : "None selected";

  response.replace("MODE_TEXT", modeText);
  response.replace("ENROLL_ACTIVE", currentMode == 1 ? "active" : "");
  response.replace("AUTH_ACTIVE", currentMode == 2 ? "active" : "");
  response.replace("GREEN_COLOR", currentMode == 1 ? "#2ecc40" : "#ccc");
  response.replace("RED_COLOR", currentMode == 1 ? "#ff4136" : "#ccc");
  response.replace("YELLOW_COLOR", currentMode == 2 ? "#ffdc00" : "#ccc");

  webSocket.sendTXT(num, response);
}

// ---------- Enrollment system page ----------
void sendEnrollmentPage(uint8_t num) {
  String response = R"(
    <!DOCTYPE html><html>
      <head>
        <title>Enrollment System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          html { font-family: sans-serif; text-align: center; }
          body { display: inline-flex; flex-direction: column; padding: 2em; }
          h1 { color: #2a8; margin-bottom: 0.2em; }
          p { font-size: 1.1em; color: #555; }
          .indicators { margin: 1.5em 0; }
          .dot { display: inline-block; width: 24px; height: 24px; border-radius: 50%; margin: 0 10px; vertical-align: middle; }
          .back { margin-top: 2em; display: inline-block; background:#357; color:#fff;
                   padding: 0.6em 1.2em; text-decoration:none; border-radius: 6px; }
          form { margin-top: 1.5em; }
          input { padding: 0.5em; font-size: 1em; margin: 0.4em; border-radius: 4px; border: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <h1>Enrollment System</h1>
        <p>System is in Enrollment Mode. Green and Red indicators are ON.</p>
        <div class="indicators">
          <span class="dot" style="background:#2ecc40;"></span>
          <span class="dot" style="background:#ff4136;"></span>
        </div>
        <form>
          <div><input type="text" placeholder="Name" /></div>
          <div><input type="text" placeholder="ID Number" /></div>
          <div><input type="text" placeholder="Fingerprint / Card ID" /></div>
        </form>
        <a class="back" href="/">&larr; Back to mode selection</a>
      </body>
    </html>
  )";
  webSocket.sendTXT(num, response);
}

// ---------- Authorization system page (placeholder for now) ----------
void sendAuthorizationPage(uint8_t num) {
  String response = R"(
    <!DOCTYPE html><html>
      <head>
        <title>Authorization System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          html { font-family: sans-serif; text-align: center; }
          body { display: inline-flex; flex-direction: column; padding: 2em; }
          h1 { color: #c90; margin-bottom: 0.2em; }
          p { font-size: 1.1em; color: #555; }
          .dot { display: inline-block; width: 24px; height: 24px; border-radius: 50%; margin: 1.5em auto; background:#ffdc00; }
          .back { margin-top: 2em; display: inline-block; background:#357; color:#fff;
                   padding: 0.6em 1.2em; text-decoration:none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <h1>Authorization System</h1>
        <p>System is in Authorization Mode. Yellow indicator is ON.</p>
        <div class="dot"></div>
        <p><i>Authorization workflow coming soon.</i></p>
        <a class="back" href="/">&larr; Back to mode selection</a>
      </body>
    </html>
  )";
  webSocket.sendTXT(num, response);
}

// ---------- WebSocket event handler (replaces HTTP route handlers) ----------
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected\n", num);
      break;

    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      sendHomePage(num);
      break;
    }

    case WStype_TEXT: {
      String path = String((char *)payload).substring(0, length);

      if (path.startsWith("/mode/")) {
        String modeStr = path.substring(6);
        int m = modeStr.toInt();
        if (m == 1 || m == 2) {
          currentMode = m;
          updateLeds();
          Serial.print("Mode switched to: ");
          Serial.println(m == 1 ? "Enrollment" : "Authorization");
        }
      }

      if (currentMode == 1) {
        sendEnrollmentPage(num);
      } else if (currentMode == 2) {
        sendAuthorizationPage(num);
      } else {
        sendHomePage(num);
      }
      break;
    }

    default:
      break;
  }
}

void setup(void) {
  Serial.begin(115200);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  updateLeds();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);
  Serial.print("Connecting to WiFi ");
  Serial.print(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }
  Serial.println(" Connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  Serial.println("WebSocket server started (ws://localhost:8180)");
}

void loop(void) {
  webSocket.loop();
  delay(2);
}