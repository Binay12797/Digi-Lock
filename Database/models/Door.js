import mongoose from 'mongoose';
const doorSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['locked', 'unlocked'],
    default: 'locked'
  },

  authorizedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  lastAccessedAt: {
    type: Date,
    default: null
  }, 
},
{
   versionKey : false
  });

export default mongoose.model("Door", doorSchema);