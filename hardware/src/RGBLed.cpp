#include "RGBLed.h"
#include "config.h"

#include <Arduino.h>

namespace {

enum RGBLed {
    LED_OFF,
    LED_YELLOW,
    LED_GREEN,
    LED_RED,
    LED_FLASH_FAST_RED,
    LED_FLASH_SLOW_RED
};

RGBLed currentMode = LED_OFF;

bool flashState = false;
unsigned long lastFlash = 0;

const unsigned long FAST_FLASH = 250;
const unsigned long SLOW_FLASH = 750;

void allOff() {
    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(YELLOW_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, LOW);
}

}

namespace RGBLed {

void begin() {
    pinMode(GREEN_LED_PIN, OUTPUT);
    pinMode(YELLOW_LED_PIN, OUTPUT);
    pinMode(RED_LED_PIN, OUTPUT);

    allOff();
}

void off() {
    currentMode = LED_OFF;
    allOff();
}

void setYellow() {
    currentMode = LED_YELLOW;

    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(YELLOW_LED_PIN, HIGH);
    digitalWrite(RED_LED_PIN, LOW);
}

void setGreen() {
    currentMode = LED_GREEN;

    digitalWrite(GREEN_LED_PIN, HIGH);
    digitalWrite(YELLOW_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, LOW);
}

void setRed() {
    currentMode = LED_RED;

    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(YELLOW_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, HIGH);
}

void setFastFlashRed() {
    currentMode = LED_FLASH_FAST_RED;
}

void setSlowFlashRed() {
    currentMode = LED_FLASH_SLOW_RED;
}

void loop() {

    unsigned long now = millis();

    switch (currentMode) {

        case LED_FLASH_FAST_RED:
            if (now - lastFlash >= FAST_FLASH) {
                lastFlash = now;
                flashState = !flashState;

                digitalWrite(RED_LED_PIN, flashState);
                digitalWrite(GREEN_LED_PIN, LOW);
                digitalWrite(YELLOW_LED_PIN, LOW);
            }
            break;

        case LED_FLASH_SLOW_RED:
            if (now - lastFlash >= SLOW_FLASH) {
                lastFlash = now;
                flashState = !flashState;

                digitalWrite(RED_LED_PIN, flashState);
                digitalWrite(GREEN_LED_PIN, LOW);
                digitalWrite(YELLOW_LED_PIN, LOW);
            }
            break;

        default:
            break;
    }
}

}