const devices = new Map();

//Register a connected ESP.
function register(deviceId, socket) {
    devices.set(deviceId, {
        socket,
        lastSeen: Date.now()
    });
    console.log(`[DeviceManager] ${deviceId} connected`);
}
//Remove a disconnected ESP.
function unregister(deviceId) {
    devices.delete(deviceId);
    console.log(`[DeviceManager] ${deviceId} disconnected`);
}

function heartbeat(deviceId) {
    const device = devices.get(deviceId);
    if (!device) return;
    device.lastSeen = Date.now();
}

//Get socket for a device.
function get(deviceId) {
    return devices.get(deviceId);
}

//Send a command to one ESP.
function send(deviceId, data) {
    const device = devices.get(deviceId);
    if (!device) {
        console.log(`[DeviceManager] ${deviceId} not connected`);
        return false;
    }
    device.socket.send(JSON.stringify(data));
    return true;
}

//Return all connected devices.
function getConnectedDevices() {
    return [...devices.keys()];
}

//Check whether a device is online. 
function isConnected(deviceId) {
    return devices.has(deviceId);
}

//intervalue for checking if the device is still connected after 15 sec
setInterval(() => {
    const now = Date.now();
    for(const [deviceId, device] of devices){
        if(now - device.lastSeen > 15000){
            console.log(`[DeviceManager] ${deviceId} offline`);
            devices.delete(deviceId);
        }
    }
},5000);

module.exports = {
    register,
    unregister,
    get,
    send,
    getConnectedDevices,
    isConnected,
    heartbeat
};