#pragma once

// ────────────────────────────────────────────────────────────
// WiFi credentials
// ────────────────────────────────────────────────────────────


// ────────────────────────────────────────────────────────────
// Backend (Node.js / Express / Socket.IO) connection
// ────────────────────────────────────────────────────────────
// TODO: point this at your backend once it's running.
// - If your backend runs on your dev laptop and the ESP32 is on the
//   same WiFi network, use your laptop's LAN IP (e.g. "192.168.1.42"),
//   NOT "localhost" — the device has no idea what "localhost" means to it.
// - If you deploy the backend somewhere (Render, Railway, a VPS, etc),
//   put that host here instead.
//#define WS_HOST "192.168.110.233"
//#define WS_HOST "3.6.122.107"
//#define WS_HOST "art-dinginess-activity.ngrok-free.dev"
#define WS_HOST  "host.wokwi.internal"
#define WS_PORT 8080
#define WS_PATH "/"


#define WIFI_SSID     "Wokwi-GUEST"
#define WIFI_PASSWORD ""
#define WIFI_CHANNEL  6
// Unique id for this device. Sent with every event so the backend can
// tell devices apart if you ever add a second door/lock.
#define DEVICE_ID      "door-lock-01"

// ────────────────────────────────────────────────────────────
// Hardware pins
// ────────────────────────────────────────────────────────────
#define BUZZER_PIN     14
