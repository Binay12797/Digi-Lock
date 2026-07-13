import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  autoConnect: false,
});

// With autoConnect: true:
// As soon as your React app loads, it connects to the Socket.IO server.
// Even if the user is on the login page or browsing pages that don't need real-time updates, the connection stays open.
//so autoConnect: false,
