#ifndef DOOR_MANAGER_H
#define DOOR_MANAGER_H

#include <Arduino.h>

namespace DoorManager
{
    enum DoorStatus
    {
        LOCKED,
        UNLOCKED
    };

    void begin();

    void lockDoor();
    void unlockDoor();

    DoorStatus getDoorStatus();
    String doorStatusToString();

    void sendStatusUpdate();
    
    bool isLocked();
}

#endif