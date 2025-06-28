import { configDotenv } from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createOtpRoutes, rateLimitMiddleware } from './middleware/otp-middleware.js';

const app = express();
configDotenv();

app.use(bodyParser.json());
app.use(cors());

app.use('/sentotp', rateLimitMiddleware({ maxAttempts: 5, windowMs: 15 * 60 * 1000 }));
app.use('/verifyotp', rateLimitMiddleware({ maxAttempts: 10, windowMs: 15 * 60 * 1000 }));

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

app.use('/', otpRoutes);

app.post('/sentotp', (req, res, next) => {
  req.url = '/send';
  next();
});

app.post('/verifyotp', (req, res, next) => {
  req.url = '/verify';
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

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
