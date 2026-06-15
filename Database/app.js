import { WebSocketServer } from "ws";
import si from "systeminformation";
import mongoose from 'mongoose';
import User from './models/User.js';
import Door from './models/Door.js';
import AccessLog from './models/AccessLog.js';

mongoose.connect(
  'mongodb://rajab2007bal_db_user:Test1234@ac-nisxnkl-shard-00-00.n030ezp.mongodb.net:27017,ac-nisxnkl-shard-00-01.n030ezp.mongodb.net:27017,ac-nisxnkl-shard-00-02.n030ezp.mongodb.net:27017/digilock?ssl=true&replicaSet=atlas-aosg6b-shard-0&authSource=admin&appName=Cluster0'
)
.then(async () => {
  console.log('Connected to MongoDB');

// Save User
  let user = await User.findOne({
    email: 'email@gmail.com'
  });

  if (!user) {
  user = new User({
    username: 'Username',
    email: 'email@gmail.com',
    password: '123'
  });
  await user.save();
  console.log('User Saved');
}
  else{
    console.log("User exists");
  }
 
  // Save Door
  const door = new Door({
    name: 'Lab door',
    location: 'Computer Lab',
    deviceId: 'ESP32-001'
  });

  await door.save();
  console.log('door saved');

  //Save AccessLog
  const log = new AccessLog({
  userId: user._id,
  doorId: door._id,
  action: 'unlock',
  status: 'success'

});
  await log.save();
  console.log('AccessLog Saved');
})  
.catch(err => console.error(err));

//WebSocket Server
const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket server running at ws://localhost:8080");

wss.on("connection", function connection(ws) {
  ws.send("something");

  setInterval(async () => {
    const cpuTemp = JSON.stringify(await si.currentLoad());
    ws.send(cpuTemp);
  }, 1000);

  ws.on("close", () => clearInterval(interval)); 
  //Interval is cleared every run
});


