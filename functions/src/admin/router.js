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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS before any other middleware
router.options('*', cors(corsOptions));
router.use(cors(corsOptions));

// Other middleware
router.use(express.json());
router.use(authMiddleware);

// Routes
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.put('/users/:id/password', userController.changePassword);

module.exports = router; 