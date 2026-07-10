# Smart Lock Device Firmware

ESP32 firmware for the fingerprint door lock. It no longer runs its own
web server — it's a **Socket.IO client** that connects to your Node/Express
backend. The backend owns MongoDB and serves the React admin frontend;
the device only talks to the backend.

```
[ React frontend ] <--socket--> [ Node/Express + Socket.IO backend ] <--socket--> [ ESP32 device ]
                                            |
                                        MongoDB
```

## File layout

| File | Responsibility |
|---|---|
| `smart_lock_device.ino` | Wires everything together: setup/loop, registers backend event handlers |
| `config.h` | WiFi + backend host/port — the only file you *must* edit |
| `SocketClient.h/.cpp` | The only module that talks to the network. Defines the event contract. |
| `EnrollmentManager.h/.cpp` | Two-scan enrollment state machine |
| `AuthManager.h/.cpp` | Auth check state machine (async — waits on backend for MongoDB lookup) |
| `FingerprintSensor.h/.cpp` | Simulated sensor — swap for real sensor code later without touching anything else |
| `Buzzer.h/.cpp` | Non-blocking buzzer tones |

## Libraries needed (Arduino Library Manager)

- **WebSockets** by Markus Sattler (Links2004) — provides `SocketIOclient`
- **ArduinoJson** by Benoit Blanchon

## Setup

1. Edit `config.h`: set `BACKEND_HOST`/`BACKEND_PORT` to wherever your
   Express + Socket.IO server runs (LAN IP if testing locally, not `localhost`).
2. Flash the device.
3. Once your backend is up and listening for Socket.IO connections on
   that host/port, the device will connect automatically and log
   `[Socket] Connected to backend` over serial.

## Event contract

This is what the device currently sends/expects. It's a *starting point* —
rename/add events freely as you learn your backend, just keep
`SocketClient.h` and your backend handlers in sync.

**Device → Backend**
| Event | Payload | Meaning |
|---|---|---|
| `device:hello` | `{ deviceId }` | Sent right after connecting |
| `status:update` | `{ deviceId, mode }` | Heartbeat, every 5s |
| `enroll:progress` | `{ deviceId, state, name }` | Enrollment state changed |
| `enroll:complete` | `{ deviceId, name, uid }` | New user captured — **save to MongoDB here** |
| `enroll:failed` | `{ deviceId, name, reason }` | Enrollment failed |
| `auth:check` | `{ deviceId, uid }` | **Look this UID up in MongoDB**, then reply with `auth:result` |
| `auth:log` | `{ deviceId, uid, granted }` | Access attempt — **write to access log collection** |
| `auth:alarm` | `{ deviceId, attempts }` | Too many failed attempts |

**Backend → Device**
| Event | Payload | Meaning |
|---|---|---|
| `mode:set` | `{ mode }` | 0=idle, 1=enrollment, 2=authorization |
| `enroll:start` | `{ name }` | Admin started enrolling a new user from the React UI |
| `enroll:scan1` / `enroll:scan2` | `{}` | Trigger a scan step |
| `auth:check` | `{ uid }` | Trigger an auth attempt (e.g. from a "test" button in the UI) |
| `auth:result` | `{ granted }` | Response to the device's `auth:check` — did MongoDB have this UID? |

## Notes on the `auth:check` round trip

The device no longer stores any user data locally. When someone scans a
finger in authorization mode, the device sends `auth:check` and waits
(up to 5s) for the backend to reply with `auth:result`. If the backend
doesn't answer in time, the device fails safe and denies access — check
your backend logs if you see a lot of "Backend response timeout" in the
device's serial output.
