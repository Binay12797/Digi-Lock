#include "DoorManager.h"
#include "SocketClient.h"
extern int currentMode;
namespace DoorManager {
    namespace {
        DoorStatus currentDoorStatus = LOCKED;
    }
    void begin() {
        currentDoorStatus = LOCKED;
    }
    DoorStatus getDoorStatus() {
        return currentDoorStatus;
    }
    bool isLocked() {
        return currentDoorStatus == LOCKED;
    }
    String doorStatusToString() {
        switch (currentDoorStatus) {
            case LOCKED:
                return "LOCKED";
            case UNLOCKED:
                return "UNLOCKED";
            default:
                return "LOCKED";
        }
    }

    void sendStatusUpdate() {
        if (!SocketClient::isConnected()) {
            Serial.println("[WS] Postponing status update: Waiting for active connection...");
            return;
        }
        SocketClient::emitStatus(
            currentMode,
            doorStatusToString()
        );
    }

<<<<<<< HEAD
    void unlockDoor(){
=======
    void unlockDoor() {
>>>>>>> 6a94516205b8bdec65fee043a0d71ad786c6b17e
        if (currentDoorStatus == UNLOCKED)
            return;
        currentDoorStatus = UNLOCKED;
        Serial.println("[Door] Status changed -> UNLOCKED");
        sendStatusUpdate();
    }

<<<<<<< HEAD
    void lockDoor(){
=======
    void lockDoor() {
>>>>>>> 6a94516205b8bdec65fee043a0d71ad786c6b17e
        if (currentDoorStatus == LOCKED)
            return;
        currentDoorStatus = LOCKED;
        Serial.println("[Door] Status changed -> LOCKED");
        sendStatusUpdate();
    }
}