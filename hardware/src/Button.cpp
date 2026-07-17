#include "Button.h"
#include "config.h"

namespace ButtonManager {

namespace {

    // Button pins
    const uint8_t LOCK_PIN = LOCK_BUTTON_PIN;
    const uint8_t SCAN_PIN = SCAN_BUTTON_PIN;

    ButtonCallback callback = nullptr;

    const unsigned long debounceMs = 30;
    const unsigned long longPressMs = 2000;

    struct ButtonState
    {
        bool currentState = HIGH;
        bool lastReading = HIGH;
        bool longPressSent = false;

        unsigned long lastDebounce = 0;
        unsigned long pressedTime = 0;
    };

    ButtonState lockButton;
    ButtonState scanButton;

    void processButton(
        ButtonState& button,
        uint8_t pin,
        ButtonEvent pressedEvent,
        ButtonEvent releasedEvent,
        ButtonEvent longPressEvent)
    {
        bool reading = digitalRead(pin);

        if (reading != button.lastReading) {
            button.lastDebounce = millis();
        }

        if (millis() - button.lastDebounce > debounceMs) {

            if (reading != button.currentState) {

                button.currentState = reading;

                if (button.currentState == LOW) {

                    button.pressedTime = millis();
                    button.longPressSent = false;

                    if (callback)
                        callback(pressedEvent);

                } else {

                    if (callback)
                        callback(releasedEvent);
                }
            }
        }

        if (button.currentState == LOW &&
            !button.longPressSent &&
            millis() - button.pressedTime >= longPressMs)
        {
            button.longPressSent = true;

            if (callback)
                callback(longPressEvent);
        }

        button.lastReading = reading;
    }

} // anonymous namespace

void begin()
{
    pinMode(LOCK_PIN, INPUT_PULLUP);
    pinMode(SCAN_PIN, INPUT_PULLUP);
}

void onEvent(ButtonCallback cb)
{
    callback = cb;
}

void loop()
{
    processButton(
        lockButton,
        LOCK_PIN,
        LOCK_BUTTON_PRESSED,
        LOCK_BUTTON_RELEASED,
        LOCK_BUTTON_LONG_PRESS
    );

    processButton(
        scanButton,
        SCAN_PIN,
        SCAN_BUTTON_PRESSED,
        SCAN_BUTTON_RELEASED,
        SCAN_BUTTON_LONG_PRESS
    );
}

} // namespace ButtonManager
