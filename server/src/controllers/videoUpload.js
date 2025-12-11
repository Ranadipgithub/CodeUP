const cloudinary = require("cloudinary").v2;
const Problem = require("../models/problem");
const SolutionVideo = require("../models/solutionVideo");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateUploadSignature = async (req, res) => {
  try {
    const userId = req.result._id;
    const {problemId} = req.params;
    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;

    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // generate signature for the video
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const saveVideoMetaData = async (req, res) => {
  try {
    const { problemId, cloudinaryPublicId, secureUrl, duration } = req.body;

    // Ensure we have the user ID (make sure your middleware sets req.user or req.result correctly)
    // Based on your previous fix, it seems you are using req.result
    const userId = req.result._id; 

    // 1. Verify required fields
    if (!problemId || !cloudinaryPublicId || !secureUrl) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // 2. Verify upload with Cloudinary (Optional but recommended safety check)
    // Note: This API call is rate-limited. If you trust the frontend, you can skip this.
    // If you keep it, ensure cloudinaryPublicId is just the string ID.
    try {
        await cloudinary.api.resource(cloudinaryPublicId, { resource_type: "video" });
    } catch (cloudinaryError) {
        return res.status(404).json({ error: "Video not found on Cloudinary servers" });
    }

    // 3. Check for existing video
    // FIX: Use SolutionVideo model, NOT Problem model
    const existingVideo = await SolutionVideo.findOne({
      problemId,
      // userId, // Optional: if you only want one video per user per problem
    });

    if (existingVideo) {
      return res.status(400).json({ error: "Video solution already exists for this problem" });
    }

    // 4. Generate Thumbnail URL
    const thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
      resource_type: "video", // Generates image from video
      format: "jpg",
      transformation: [
        { width: 400, height: 225, crop: "fill" },
        { start_offset: "auto" } // Auto selects a good frame
      ]
    });

    // 5. Create Record
    const videoSolution = await SolutionVideo.create({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      thumbnailUrl,
      duration: duration || 0,
    });

    res.status(200).json({
      message: "Video saved successfully",
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt,
      },
    });

  } catch (error) {
    console.error("Save MetaData Error:", error);
    res.status(400).json({ error: error.message });
  }
};

const deleteVideo = async (req, res) => {
    try{
        const {problemId} = req.params;
        const userId = req.result._id;

        const video = await SolutionVideo.findOneAndDelete({problemId: problemId});

        if(!video) {
            return res.status(404).json({error: "Video not found"});
        }

        await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
            resource_type: "video",
            invalidate: true
        });

        res.status(200).json({message: "Video deleted successfully"});
    } catch(err) {
        res.status(400).json({error: err.message});
    }
}

const getVideoByProblemId = async (req, res) => {
    try{
        const {problemId} = req.params;
        const video = await SolutionVideo.findOne({problemId: problemId});
        if(!video) {
            return res.status(404).json({error: "Video not found"});
        }
        res.status(200).json({video});
    } catch(err) {
        res.status(400).json({error: err.message});
    }
}

const getAllVideo = async (req, res) => {
  try {
    const videos = await SolutionVideo.find({}).select('problemId');
    res.status(200).json({ videos });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  generateUploadSignature,
  saveVideoMetaData,
  deleteVideo,
  getVideoByProblemId,
  getAllVideo
};