export { default as SendOtp } from './components/SendOtp.jsx';
export { default as VerifyOtp } from './components/VerifyOtp.jsx';

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
} from '../../lib/utils.js';

export {
  DEFAULT_CONFIG,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../../lib/types.js';

export { otpMiddleware, createOtpRoutes, rateLimitMiddleware } from '../../server/middleware/otp-middleware.js';

export * from './components/SendOtp.jsx';
export * from './components/VerifyOtp.jsx';
export * from '../../lib/utils.js';
export * from '../../lib/types.js';
