const express = require('express');
const videoRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const { generateUploadSignature, saveVideoMetaData, deleteVideo, getVideoByProblemId, getAllVideo } = require('../controllers/videoUpload');
const userMiddleware = require('../middleware/userMiddleware');

videoRouter.get('/create/:problemId', adminMiddleware, generateUploadSignature);
videoRouter.post('/save', adminMiddleware, saveVideoMetaData);
videoRouter.delete('/delete/:problemId', adminMiddleware, deleteVideo);
videoRouter.get('/get/:problemId', userMiddleware, getVideoByProblemId);
videoRouter.get('/allVideoIds', adminMiddleware, getAllVideo);

module.exports = videoRouter;