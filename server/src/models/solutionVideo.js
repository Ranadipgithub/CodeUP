const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
    }, 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, 
    cloudinaryPublicId: {
        type: String,
        required: true,
        unique: true
    }, 
    secureUrl: {
        type: String,
        required: true,
    },
    thumbnailUrl: {
        type: String,
    },
    duration: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const SolutionVideo = mongoose.model("SolutionVideo", videoSchema);
module.exports = SolutionVideo;