const express = require('express');
const chatRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { solveDoubt } = require('../controllers/solveDoubt');

chatRouter.post('/chat', userMiddleware, solveDoubt);

module.exports = chatRouter;