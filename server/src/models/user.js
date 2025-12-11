const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 30
    },
    lastName: {
        type: String,
        // required: true,
        minLength: 2,
        maxLength: 30
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true
    },
    age: {
        type: Number,
        min: 5,
        max: 90
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: true
    },
    problemSolved: {
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            unique: true
        }],
        // unique:true
    }
}, { timestamps: true });

userSchema.post('findOneAndDelete', async function(userInfo) {
    if(userInfo) {
        const Submission = require('./submission');
        await Submission.deleteMany({ userId: userInfo._id });
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;