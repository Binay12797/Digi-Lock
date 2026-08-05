# Smart Lock Device Firmware

ESP32 firmware for the fingerprint door lock. It doesn't run its own web
server — it's a **raw WebSocket client** (using the `WebSockets` library's
`WebSocketsClient`, *not* Socket.IO) that connects to your Node/Express
backend. The backend owns MongoDB and serves the React admin frontend;
the device only talks to the backend, over a single plain WebSocket
connection, using small flat JSON messages.

```
[ React frontend ] <--HTTP/WS--> [ Node/Express backend ] <--raw WebSocket--> [ ESP32 device ]
                                            |
                                        MongoDB
```

On the backend, `ws` or Express + `ws`/`express-ws` is what you want here
— not `socket.io` — since the device speaks plain WebSocket frames
carrying JSON text, not the Socket.IO wire protocol.

## File layout

| File | Responsibility |
|---|---|
| `smart_lock_device.ino` | Wires everything together: setup/loop, registers backend command handlers |
| `config.h` | WiFi + backend host/port — the only file you *must* edit |
| `SocketClient.h/.cpp` | The only module that talks to the network. Defines the message contract. |
| `EnrollmentManager.h/.cpp` | Two-scan enrollment state machine |
| `AuthManager.h/.cpp` | Auth check state machine (async — waits on backend for MongoDB lookup) |
| `FingerprintSensor.h/.cpp` | Simulated sensor — swap for real sensor code later without touching anything else |
| `Buzzer.h/.cpp` | Non-blocking buzzer tones |

## Libraries needed (Arduino Library Manager)

- **WebSockets** by Markus Sattler (Links2004) — provides `WebSocketsClient`
- **ArduinoJson** by Benoit Blanchon

## Setup

1. Edit `config.h`: set `WS_HOST`/`WS_PORT`/`WS_PATH` to wherever your
   Express + `ws` server runs (LAN IP if testing locally, not `localhost`
   — the device doesn't know what "localhost" means to it).
2. Flash the device.
3. Once your backend is up and listening on that host/port, the device
   connects automatically and logs `[WS] Connected to backend` over serial.

## Message contract

Every message is a flat JSON object sent as a WebSocket text frame — no
Socket.IO envelope/acking. Device→backend messages carry a `"type"`
field; backend→device messages carry a `"command"` field. This is a
*starting point* — rename/add fields freely as you build your backend,
just keep `SocketClient.h`'s doc comment, `SocketClient.cpp`, and your
backend handlers in sync with each other.

**Device → Backend** (`{ "type": ... }`)
| Type | Payload | Meaning |
|---|---|---|
| `HELLO` | `{ deviceId }` | Sent right after connecting |
| `STATUS_UPDATE` | `{ deviceId, mode }` | Heartbeat, every 5s |
| `ENROLL_PROGRESS` | `{ state, name }` | Enrollment state changed |
| `ENROLL_COMPLETE` | `{ name, fingerprint }` | New user captured — **save to MongoDB here** |
| `ENROLL_FAILED` | `{ name, reason }` | Enrollment failed |
| `ENROLL_LOG` | `{ name, fingerprint, success, reason, uptimeMs }` | One row per enrollment attempt — **write to your enrollment-log collection**. Flat and self-describing on purpose, so the backend can insert it close to as-is (plus its own server timestamp). |
| `FINGERPRINT_SCAN` | `{ fingerprint }` | **Look this UID up in MongoDB**, then reply with `OPEN_DOOR` or `DENY_ACCESS` |
| `ACCESS_LOG` | `{ deviceId, fingerprint, granted, reason, uptimeMs }` | One row per completed auth attempt (granted *or* denied) — **write to your access-log collection**. Same flat/self-describing shape as `ENROLL_LOG`. |
| `ALARM` | `{ attempts }` | Too many consecutive lockouts |

**Backend → Device** (`{ "command": ... }`)
| Command | Payload | Meaning |
|---|---|---|
| `SET_MODE` | `{ mode }` | 0=idle, 1=enrollment, 2=authorization |
| `START_ENROLL` | `{ name }` | Admin started enrolling a new user from the React UI |
| `CANCEL_ENROLL` | `{}` | Admin aborted an in-progress enrollment |
| `ENROLL_SCAN1` / `ENROLL_SCAN2` | `{}` | Trigger a scan step |
| `AUTH_CHECK` | `{ uid }` | Trigger a test auth attempt (e.g. from a "test" button in the UI) |
| `OPEN_DOOR` | `{}` | Response to the device's `FINGERPRINT_SCAN` — UID was found in MongoDB |
| `DENY_ACCESS` | `{}` | Response to the device's `FINGERPRINT_SCAN` — UID was not found |

## Access & enrollment logs

Every completed auth attempt fires one `ACCESS_LOG` message, and every
enrollment attempt (success, timeout, template failure, or admin
cancellation) fires one `ENROLL_LOG` message — in addition to the
existing progress/result events, which drive UI state rather than log
history. Both log message shapes are deliberately flat with plain field
names (`success`/`granted`, `reason`, `uptimeMs`) so a backend handler
can do close to `logCollection.insertOne({ ...msg, receivedAt: new Date() })`
with no reshaping. If you need more fields (e.g. a resolved user name
looked up from MongoDB by UID), add them on the backend side when you
persist the row — the device doesn't need to know about them.

`uptimeMs` is `millis()` since the device booted, **not** a wall-clock
timestamp — the device has no RTC. Use the backend's receive time as the
authoritative timestamp for log rows.

## Notes on the `FINGERPRINT_SCAN` round trip

The device no longer stores any user data locally. When someone scans a
finger in authorization mode, the device sends `FINGERPRINT_SCAN` and
waits (up to 5s) for the backend to reply with `OPEN_DOOR` or
`DENY_ACCESS`. If the backend doesn't answer in time, the device fails
safe and denies access (logged with reason `backend_timeout`) — check
your backend logs if you see a lot of "Backend response timeout" in the
device's serial output.
