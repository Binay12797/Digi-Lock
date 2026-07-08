import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fingerprintId: {
    type: String,
    unique: true,
    sparse: true   
  },
  isActive: {
    type: Boolean,
    default: true
  },
},
{collection: 'users',
versionKey : false
},
 );

export default mongoose.model("User", userSchema);