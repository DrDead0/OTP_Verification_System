// OTP Verification System API - Modular Version
// Integration-friendly, standardized responses for easy use in any project
import { configDotenv } from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createOtpRoutes, rateLimitMiddleware } from './middleware/otp-middleware.js';

const app = express();
configDotenv();

app.use(bodyParser.json());
// For production, set origin: 'https://yourdomain.com' in cors options
// app.use(cors({ origin: 'https://yourdomain.com' }));
app.use(cors());

// Rate limiting
app.use('/sentotp', rateLimitMiddleware({ maxAttempts: 5, windowMs: 15 * 60 * 1000 }));
app.use('/verifyotp', rateLimitMiddleware({ maxAttempts: 10, windowMs: 15 * 60 * 1000 }));

// Create OTP routes with configuration
const otpRoutes = createOtpRoutes({
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  otpLength: 6,
  expiryMinutes: 5,
  enableCleanupRoute: process.env.NODE_ENV === 'development'
});

// Mount OTP routes
app.use('/', otpRoutes);

// Legacy routes for backward compatibility
app.post('/sentotp', (req, res, next) => {
  req.url = '/send';
  next();
});

app.post('/verifyotp', (req, res, next) => {
  req.url = '/verify';
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

const port = process.env.PORT || 3300;
app.listen(port, () => {
  console.log(`🚀 OTP Verification Server running on http://localhost:${port}`);
  console.log(`📧 Email service: ${process.env.EMAIL ? 'Configured' : 'Not configured'}`);
  console.log(`🔒 CORS: ${process.env.NODE_ENV === 'production' ? 'Restricted' : 'Open'}`);
});
