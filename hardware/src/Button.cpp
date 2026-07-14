#include "Button.h"
#include "config.h"

namespace ButtonManager{
    namespace{
        //button attach pin
        const uint8_t BUTTON_PIN = LOCK_BUTTON_PIN;
        ButtonCallback callback = nullptr;
        
        //current state
        bool currentState = HIGH;
        
        //for long press, maybe use full in the future
        bool lastReading = HIGH;
        unsigned long lastDebounce = 0;
        unsigned long pressedTime = 0;
        
        const unsigned long debounceMs = 30;
        const unsigned long longPressMs = 2000;
        bool longPressSent = false;
    }

    void begin(){
        pinMode(BUTTON_PIN, INPUT_PULLUP);
    }
    void onEvent(ButtonCallback cb){
        callback = cb;
    }
    bool isPressed(){
        return currentState == LOW;
    }
    void loop(){
        bool reading = digitalRead(BUTTON_PIN);
        if (reading != lastReading){
            lastDebounce = millis();
        }
        if (millis() - lastDebounce > debounceMs){
            if (reading != currentState){
                currentState = reading;
                if (currentState == LOW){
                    pressedTime = millis();
                    longPressSent = false;
                    if (callback)
                        callback(BUTTON_PRESSED);
                }
                else{
                    if (callback)
                        callback(BUTTON_RELEASED);
                }
            }
        }
        if (currentState == LOW && !longPressSent && millis() - pressedTime >= longPressMs){
                longPressSent = true;
                if (callback)
                    callback(BUTTON_LONG_PRESS);
        }
        lastReading = reading;
    }
}