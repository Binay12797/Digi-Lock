#ifndef BUTTON_MANAGER_H
#define BUTTON_MANAGER_H
#include <Arduino.h>
namespace ButtonManager{
    enum ButtonEvent {
        LOCK_BUTTON_PRESSED,
        LOCK_BUTTON_RELEASED,

        SCAN_BUTTON_PRESSED,
        SCAN_BUTTON_RELEASED,

        LOCK_BUTTON_LONG_PRESS,
        SCAN_BUTTON_LONG_PRESS
    };
    typedef void (*ButtonCallback)(ButtonEvent event);
    void begin();
    void loop();
    void onEvent(ButtonCallback callback);
    bool isPressed();
}
#endif