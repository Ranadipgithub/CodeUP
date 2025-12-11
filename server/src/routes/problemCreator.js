const express = require('express');
const problemRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, getsolvedProblemsByUser, submittedProblems, getProblemByIdAllInfo } = require('../controllers/userProblem');
const userMiddleware = require('../middleware/userMiddleware');

// only admins can create, update or delete problems
problemRouter.post('/create', adminMiddleware, createProblem);
problemRouter.put('/update/:id', adminMiddleware, updateProblem);
problemRouter.delete('/delete/:id', adminMiddleware, deleteProblem);
problemRouter.get('/problemById/allInfo/:id', adminMiddleware, getProblemByIdAllInfo);

problemRouter.get('/problemById/:id', getProblemById);
problemRouter.get('/getAllProblem', getAllProblem);
problemRouter.get('/problemSolvedByUser', userMiddleware, getsolvedProblemsByUser);
problemRouter.get('/submittedProblems/:pid', userMiddleware, submittedProblems);

module.exports = problemRouter;