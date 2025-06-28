import nodemailer from 'nodemailer';
import express from 'express';
import {
  generateOTP, 
  validateEmail, 
  validateOTP, 
  createResponse, 
  createEmailTemplate,
  checkRateLimit
} from '../../lib/utils.js';
import { DEFAULT_CONFIG } from '../../lib/types.js';

export function otpMiddleware(options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  const otpStore = new Map();  const rateLimitStore = new Map();  
  const transporter = nodemailer.createTransport({
    service: config.emailConfig?.service || 'gmail',
    auth: {
      user: config.emailConfig?.user || process.env.EMAIL,
      pass: config.emailConfig?.pass || process.env.PASSWORD
    }
  });
    return (req, res, next) => {
    req.sendOtp = async (email, customTemplate = {}) => {      try {
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          return createResponse(false, emailValidation.error);        }
        
        if (config.rateLimit) {
          const rateLimitResult = checkRateLimit(
            rateLimitStore,
            email,
            config.rateLimit.maxAttempts,
            config.rateLimit.windowMs
          );
          
          if (!rateLimitResult.allowed) {
            return createResponse(false, rateLimitResult.error);
          }        }
        
        const otp = generateOTP(config.otpLength);        const expireAt = Date.now() + (config.expiryMinutes * 60 * 1000);
        
        otpStore.set(email, { otp, expireAt });        
        const emailTemplate = createEmailTemplate(
          otp, 
          config.expiryMinutes, 
          customTemplate        );
        
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
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          return createResponse(false, emailValidation.error);
        }
        
        const otpValidation = validateOTP(otp, config.otpLength);
        if (!otpValidation.isValid) {
          return createResponse(false, otpValidation.error);        }
        
        const storeData = otpStore.get(email);
        if (!storeData) {
          return createResponse(false, 'OTP not found for this email. Please request a new OTP.');
        }
          const { otp: storedOtp, expireAt } = storeData;
        
        if (Date.now() > expireAt) {
          otpStore.delete(email);
          return createResponse(false, 'OTP has expired. Please request a new OTP.');        }
        
        if (storedOtp === otp) {
          otpStore.delete(email);
          return createResponse(true, 'OTP verified successfully!', { email });
        } else {
          return createResponse(false, 'Invalid OTP. Please try again.');
        }
        
      } catch (error) {
        console.error('Verify OTP error:', error);
        return createResponse(false, 'Failed to verify OTP. Please try again.');
      }    };
    
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

export function createOtpRoutes(options = {}) {  const router = express.Router();
  
  router.use(otpMiddleware(options));  
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
    }  });
  
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
    }  });
  
  if (options.enableCleanupRoute) {
    router.post('/cleanup', (req, res) => {
      req.cleanupExpiredOtps();
      res.json(createResponse(true, 'Cleanup completed'));
    });
  }
  
  return router;
}

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
