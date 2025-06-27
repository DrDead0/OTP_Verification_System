/**
 * @fileoverview Utility functions for OTP Verification System
 * Reusable functions for validation, formatting, and common operations
 */

import { VALIDATION, ERROR_MESSAGES } from './types.js';

/**
 * Generate a random OTP of specified length
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} Generated OTP
 */
export const generateOTP = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: ERROR_MESSAGES.EMAIL_REQUIRED };
  }
  
  if (!VALIDATION.email.test(email.trim())) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }
  
  return { isValid: true };
};

/**
 * Validate OTP
 * @param {string} otp - OTP to validate
 * @param {number} expectedLength - Expected OTP length (default: 6)
 * @returns {Object} Validation result
 */
export const validateOTP = (otp, expectedLength = 6) => {
  if (!otp || !otp.trim()) {
    return { isValid: false, error: ERROR_MESSAGES.OTP_REQUIRED };
  }
  
  const pattern = new RegExp(`^\\d{${expectedLength}}$`);
  if (!pattern.test(otp.trim())) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_OTP };
  }
  
  return { isValid: true };
};

/**
 * Format time remaining for OTP expiry
 * @param {number} expiryTime - Expiry timestamp
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (expiryTime) => {
  const now = Date.now();
  const remaining = Math.max(0, expiryTime - now);
  const minutes = Math.floor(remaining / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  if (remaining === 0) return 'Expired';
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Create standardized API response
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {Object} data - Response data
 * @returns {Object} Standardized response
 */
export const createResponse = (success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return response;
};

/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @returns {Object} Standardized error response
 */
export const handleApiError = (error) => {
  if (error.response?.data) {
    return error.response.data;
  }
  
  return createResponse(false, error.message || ERROR_MESSAGES.SEND_FAILED);
};

/**
 * Sanitize and prepare email for processing
 * @param {string} email - Raw email input
 * @returns {string} Sanitized email
 */
export const sanitizeEmail = (email) => {
  return email ? email.toString().trim().toLowerCase() : '';
};

/**
 * Create email template with OTP
 * @param {string} otp - OTP code
 * @param {number} expiryMinutes - Expiry time in minutes
 * @param {Object} customTemplate - Custom template override
 * @returns {Object} Email template
 */
export const createEmailTemplate = (otp, expiryMinutes = 5, customTemplate = {}) => {
  const defaultTemplate = {
    subject: 'Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Verification Code</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hello!</h2>
          <p style="font-size: 16px; line-height: 1.5;">Your One-Time Password (OTP) is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666;">
            This OTP is valid for <strong>${expiryMinutes} minutes</strong>.
          </p>
          <p style="font-size: 14px; color: #d32f2f; margin-top: 20px;">
            🔒 <strong>Security Notice:</strong> Do not share this code with anyone.
          </p>
        </div>
        <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
          If you did not request this code, please ignore this email.
        </div>
      </div>
    `,
    text: `Hello!\n\nYour One-Time Password (OTP) is: ${otp}\n\nThis OTP is valid for ${expiryMinutes} minutes.\n\n🔒 Security Notice: Do not share this code with anyone.\n\nIf you did not request this code, please ignore this email.`
  };
  
  return { ...defaultTemplate, ...customTemplate };
};

/**
 * Rate limiting helper
 * @param {Map} store - Storage for rate limiting data
 * @param {string} key - Unique key (usually email)
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} Rate limit result
 */
export const checkRateLimit = (store, key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const record = store.get(key) || { attempts: 0, resetTime: now + windowMs };
  
  if (now > record.resetTime) {
    record.attempts = 0;
    record.resetTime = now + windowMs;
  }
  
  if (record.attempts >= maxAttempts) {
    return { 
      allowed: false, 
      resetTime: record.resetTime,
      error: `Too many attempts. Try again after ${Math.ceil((record.resetTime - now) / 1000 / 60)} minutes.`
    };
  }
  
  record.attempts++;
  store.set(key, record);
  
  return { allowed: true };
};
