const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const { getAllUsers, deleteUser } = require('../controllers/adminController');
const adminRouter = express.Router();

adminRouter.get('/users', adminMiddleware, getAllUsers);
adminRouter.delete('/delete/:userId', adminMiddleware, deleteUser);

module.exports = adminRouter;