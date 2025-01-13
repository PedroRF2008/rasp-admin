const express = require('express');
const cors = require('cors');
const { authMiddleware } = require('./middleware/authMiddleware');
const { userController } = require('./controllers/userController');

const router = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://kiosk.digitro.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
router.use(cors(corsOptions));
router.use(express.json());
router.use(authMiddleware);

// Routes
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router; 