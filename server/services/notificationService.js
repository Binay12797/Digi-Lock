const Notification = require("../models/Notification");

async function sendNotification(io, data) {
  const notification = await Notification.create({
    ...data,
  });

  io.emit("notification", notification);

  return notification;
}

module.exports = {
  sendNotification,
};
