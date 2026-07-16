#ifndef BUTTON_MANAGER_H
#define BUTTON_MANAGER_H
#include <Arduino.h>
namespace ButtonManager{
    enum ButtonEvent{
        BUTTON_PRESSED,
        BUTTON_RELEASED,
        BUTTON_LONG_PRESS
    };
    typedef void (*ButtonCallback)(ButtonEvent event);
    void begin();
    void loop();
    void onEvent(ButtonCallback callback);
    bool isPressed();
}
#endif