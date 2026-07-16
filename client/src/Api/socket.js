import { io } from "socket.io-client";

export const socket = io("https://art-dinginess-activity.ngrok-free.dev", {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"] // websocket is faster, polling acts as a backup
});