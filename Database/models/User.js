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
  fingerprintId: {
    type: Number,
    unique: true
  }
  
},
{collection: 'users',
versionKey : false
},
 );

export default mongoose.model("User", userSchema);