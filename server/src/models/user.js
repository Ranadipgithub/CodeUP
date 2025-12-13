const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  authProvider: {
    type: String,
    enum: ["local", "google"],
    required: true,
    default: "local"
  },
  firstName: {
    type: String,
    required: function () {
      return this.authProvider === "local";
    },
    minLength: 2,
    maxLength: 30
  },
  lastName: {
    type: String
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    immutable: true
  },
  password: {
    type: String,
    required: function () {
      return this.authProvider === "local";
    }
  },
  googleId: String,
  avatar: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  problemSolved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem"
  }]
}, { timestamps: true });


userSchema.post('findOneAndDelete', async function(userInfo) {
    if(userInfo) {
        const Submission = require('./submission');
        await Submission.deleteMany({ userId: userInfo._id });
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;