#include "DoorManager.h"
#include "SocketClient.h"
extern int currentMode;
namespace DoorManager{
    namespace{
        DoorStatus currentDoorStatus = LOCKED;
    }
    void begin(){
        currentDoorStatus = LOCKED;
    }
    DoorStatus getDoorStatus(){
        return currentDoorStatus;
    }
    String doorStatusToString(){
        switch (currentDoorStatus){
            case LOCKED:   return "LOCKED";
            case UNLOCKED: return "UNLOCKED";
            default:       return "LOCKED";
        }
    }
    void sendStatusUpdate()
    {
        if (!SocketClient::isConnected()) {
            Serial.println("[WS] Postponing status update: Waiting for active connection...");
            return;
        }
        SocketClient::emitStatus(
            currentMode,
            doorStatusToString()
        );
    }

    void unlockDoor(){
        if (currentDoorStatus == UNLOCKED)
            return;
        currentDoorStatus = UNLOCKED;
        Serial.println("[Door] Status changed -> UNLOCKED");
        sendStatusUpdate();
    }

    void lockDoor(){
        if (currentDoorStatus == LOCKED)
            return;
        currentDoorStatus = LOCKED;
        Serial.println("[Door] Status changed -> LOCKED");
        sendStatusUpdate();
    }
}