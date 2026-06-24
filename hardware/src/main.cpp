#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

#define WIFI_SSID     "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define WIFI_CHANNEL  6

#define WS_HOST "host.wokwi.internal"
#define WS_PORT 3000

WebSocketsClient webSocket;

const int LED_GREEN  = 25;
const int LED_RED    = 26;
const int LED_YELLOW = 27;

int currentMode = 0;
bool wsConnected = false;
bool pinSent = false; // so we only send once per connection

void updateLeds() {
  if (currentMode == 1) {
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_YELLOW, LOW);
  } else if (currentMode == 2) {
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, HIGH);
  } else {
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, LOW);
  }
}

void handleServerMessage(String msg) {
  Serial.print("Server says: ");
  Serial.println(msg);

  // Parse JSON response
  StaticJsonDocument<128> doc;
  DeserializationError error = deserializeJson(doc, msg);
  if (error) {
    Serial.println("JSON parse error");
    return;
  }

  String status = doc["status"].as<String>();

  if (status == "GRANTED") {
    Serial.println("Access GRANTED - green LED");
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, LOW);
    delay(2000);
    updateLeds();

  } else if (status == "DENIED") {
    Serial.println("Access DENIED - red LED");
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_YELLOW, LOW);
    delay(2000);
    updateLeds();

  } else if (status == "LOCKED") {
    Serial.println("System LOCKED - both LEDs");
    digitalWrite(LED_GREEN, HIGH);
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_YELLOW, LOW);

  } else if (status == "CONNECTED") {
    Serial.println("Server acknowledged connection");
  }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {

    case WStype_CONNECTED:
      wsConnected = true;
      pinSent = false; // reset so PIN can be sent
      Serial.println("[WS] Connected");
      Serial.printf("[WS] URL: %s\n", payload);
      break;

    case WStype_DISCONNECTED:
      wsConnected = false;
      Serial.println("[WS] Disconnected");
      break;

    case WStype_TEXT:
      Serial.printf("[WS] Received: %s\n", payload);
      handleServerMessage(String((char*)payload));
      break;

    case WStype_ERROR:
      Serial.println("[WS] Error");
      break;

    default:
      break;
  }
}

void sendPin(String pin) {
  if (!wsConnected) {
    Serial.println("Not connected, cannot send PIN");
    return;
  }

  StaticJsonDocument<64> doc;
  doc["pin"] = pin;

  String output;
  serializeJson(doc, output);

  Serial.print("Sending PIN: ");
  Serial.println(output);

  webSocket.sendTXT(output);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  updateLeds();

  WiFi.config(INADDR_NONE, INADDR_NONE, INADDR_NONE, IPAddress(8, 8, 8, 8));
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, WIFI_CHANNEL);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
  }
  Serial.println(" Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  Serial.println("Connecting to Node.js WebSocket directly...");
  webSocket.begin(WS_HOST, WS_PORT, "/esp32");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(3000);

  currentMode = 2;
  updateLeds();
}

void loop() {
  webSocket.loop();

  // Send a test PIN once after connection is established
  if (wsConnected && !pinSent) {
    delay(500); // small delay to let CONNECTED message arrive first
    sendPin("1234"); // replace with a real PIN from your MongoDB
    pinSent = true;
  }
}