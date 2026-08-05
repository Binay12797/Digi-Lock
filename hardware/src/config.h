#pragma once

#define WS_HOST "192.168.1.4"
//#define WS_HOST "172.18.100.244"
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
#define LOCK_BUTTON_PIN 18
#define SCAN_BUTTON_PIN  19
#define RED_LED_PIN    25
#define GREEN_LED_PIN  26
#define YELLOW_LED_PIN   27
