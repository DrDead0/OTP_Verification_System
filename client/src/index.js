/**
 * @fileoverview Main export file for OTP Verification System
 * Provides easy imports for all components and utilities
 */

// React Components
export { default as SendOtp } from './components/SendOtp.jsx';
export { default as VerifyOtp } from './components/VerifyOtp.jsx';

// Utility functions
export {
  generateOTP,
  validateEmail,
  validateOTP,
  formatTimeRemaining,
  createResponse,
  handleApiError,
  sanitizeEmail,
  createEmailTemplate,
  checkRateLimit
} from '../lib/utils.js';

// Types and constants
export {
  DEFAULT_CONFIG,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../lib/types.js';

// For server-side usage
export { otpMiddleware, createOtpRoutes, rateLimitMiddleware } from '../server/middleware/otp-middleware.js';

// Re-export everything for convenience
export * from './components/SendOtp.jsx';
export * from './components/VerifyOtp.jsx';
export * from '../lib/utils.js';
export * from '../lib/types.js';
