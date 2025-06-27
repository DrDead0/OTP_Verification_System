/**
 * @fileoverview Express.js middleware for OTP verification
 * Provides reusable middleware functions for easy integration
 */

import nodemailer from 'nodemailer';
import { 
  generateOTP, 
  validateEmail, 
  validateOTP, 
  createResponse, 
  createEmailTemplate,
  checkRateLimit
} from '../../lib/utils.js';
import { DEFAULT_CONFIG } from '../../lib/types.js';

/**
 * OTP Middleware factory
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
export function otpMiddleware(options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  const otpStore = new Map();
  const rateLimitStore = new Map();
  
  // Create email transporter
  const transporter = nodemailer.createTransporter({
    service: config.emailConfig?.service || 'gmail',
    auth: {
      user: config.emailConfig?.user || process.env.EMAIL,
      pass: config.emailConfig?.pass || process.env.PASSWORD
    }
  });
  
  return (req, res, next) => {
    // Add OTP utility functions to request object
    req.sendOtp = async (email, customTemplate = {}) => {
      try {
        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          return createResponse(false, emailValidation.error);
        }
        
        // Check rate limiting
        if (config.rateLimit) {
          const rateLimitResult = checkRateLimit(
            rateLimitStore,
            email,
            config.rateLimit.maxAttempts,
            config.rateLimit.windowMs
          );
          
          if (!rateLimitResult.allowed) {
            return createResponse(false, rateLimitResult.error);
          }
        }
        
        // Generate OTP
        const otp = generateOTP(config.otpLength);
        const expireAt = Date.now() + (config.expiryMinutes * 60 * 1000);
        
        // Store OTP
        otpStore.set(email, { otp, expireAt });
        
        // Create email template
        const emailTemplate = createEmailTemplate(
          otp, 
          config.expiryMinutes, 
          customTemplate
        );
        
        // Send email
        await transporter.sendMail({
          from: config.emailConfig?.user || process.env.EMAIL,
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });
        
        return createResponse(true, 'OTP sent successfully!', { email });
        
      } catch (error) {
        console.error('Send OTP error:', error);
        return createResponse(false, 'Failed to send OTP. Please try again later.');
      }
    };
    
    req.verifyOtp = (email, otp) => {
      try {
        // Validate inputs
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          return createResponse(false, emailValidation.error);
        }
        
        const otpValidation = validateOTP(otp, config.otpLength);
        if (!otpValidation.isValid) {
          return createResponse(false, otpValidation.error);
        }
        
        // Check stored OTP
        const storeData = otpStore.get(email);
        if (!storeData) {
          return createResponse(false, 'OTP not found for this email. Please request a new OTP.');
        }
        
        const { otp: storedOtp, expireAt } = storeData;
        
        // Check expiry
        if (Date.now() > expireAt) {
          otpStore.delete(email);
          return createResponse(false, 'OTP has expired. Please request a new OTP.');
        }
        
        // Verify OTP
        if (storedOtp === otp) {
          otpStore.delete(email);
          return createResponse(true, 'OTP verified successfully!', { email });
        } else {
          return createResponse(false, 'Invalid OTP. Please try again.');
        }
        
      } catch (error) {
        console.error('Verify OTP error:', error);
        return createResponse(false, 'Failed to verify OTP. Please try again.');
      }
    };
    
    // Add cleanup function
    req.cleanupExpiredOtps = () => {
      const now = Date.now();
      for (const [email, data] of otpStore.entries()) {
        if (now > data.expireAt) {
          otpStore.delete(email);
        }
      }
    };
    
    next();
  };
}

/**
 * Create OTP routes
 * @param {Object} options - Configuration options
 * @returns {Object} Router with OTP routes
 */
export function createOtpRoutes(options = {}) {
  const router = express.Router();
  
  // Apply OTP middleware
  router.use(otpMiddleware(options));
  
  // Send OTP route
  router.post('/send', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json(createResponse(false, 'Email is required'));
    }
    
    const result = await req.sendOtp(email);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  });
  
  // Verify OTP route
  router.post('/verify', (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json(createResponse(false, 'Email and OTP are required'));
    }
    
    const result = req.verifyOtp(email, otp);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  });
  
  // Cleanup route (for maintenance)
  if (options.enableCleanupRoute) {
    router.post('/cleanup', (req, res) => {
      req.cleanupExpiredOtps();
      res.json(createResponse(true, 'Cleanup completed'));
    });
  }
  
  return router;
}

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware
 */
export function rateLimitMiddleware(options = {}) {
  const { maxAttempts = 5, windowMs = 15 * 60 * 1000 } = options;
  const rateLimitStore = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    
    const rateLimitResult = checkRateLimit(rateLimitStore, key, maxAttempts, windowMs);
    
    if (!rateLimitResult.allowed) {
      return res.status(429).json(createResponse(false, rateLimitResult.error));
    }
    
    next();
  };
}
