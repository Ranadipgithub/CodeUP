const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const { submitCode, runCode } = require('../controllers/userSubmission');
const submitRouter = express.Router();
const submitCodeRateLimiter = require('../middleware/rateLimiter').submitCodeRateLimiter;

submitRouter.post('/submit/:id', userMiddleware, submitCodeRateLimiter, submitCode);
submitRouter.post('/run/:id', userMiddleware, submitCodeRateLimiter, runCode);

module.exports = submitRouter;