/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require('firebase-admin/app');
const adminRouter = require('./src/admin/router');

// Initialize Firebase Admin
initializeApp();

// Admin API endpoint
exports.admin = onRequest({ 
  region: "us-central1",
  cors: true,
  maxInstances: 10
}, adminRouter);
