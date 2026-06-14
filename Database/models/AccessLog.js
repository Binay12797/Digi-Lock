import mongoose from 'mongoose';
const accessLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  doorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Door',
    required: true
  },

  action: {
    type: String,
    enum: ['lock', 'unlock'],
    required: true
  },

  status: {
    type: String,
    enum: ['success','denied'],
    required: true
  },

  methodtype: {
    type: String,
    enum: ['pin','fingerprint', 'manual', 'api'],
    default: 'api'
  },

  timestamp: {
    type: Date,
    default: Date.now
  },
},
{
   versionKey : false
  }
);
export default mongoose.model("AccessLog", accessLogSchema);