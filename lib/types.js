/**
 * @fileoverview Type definitions and interfaces for OTP Verification System
 * Making the package integration-friendly with clear contracts
 */

/**
 * @typedef {Object} OtpConfig
 * @property {string} apiBaseUrl - Base URL for OTP API
 * @property {number} [otpLength=6] - Length of OTP (default: 6)
 * @property {number} [expiryMinutes=5] - OTP expiry time in minutes (default: 5)
 * @property {string} [emailService='gmail'] - Email service provider
 * @property {Object} [emailConfig] - Email configuration
 * @property {string} [emailConfig.user] - Email user
 * @property {string} [emailConfig.pass] - Email password
 */

/**
 * @typedef {Object} OtpResponse
 * @property {boolean} success - Operation success status
 * @property {string} message - Response message
 * @property {Object} [data] - Response data
 * @property {string} [data.email] - Email address
 */

/**
 * @typedef {Object} SendOtpRequest
 * @property {string} email - Email address to send OTP
 */

/**
 * @typedef {Object} VerifyOtpRequest
 * @property {string} email - Email address
 * @property {string} otp - OTP code to verify
 */

/**
 * @typedef {Object} ComponentProps
 * @property {string} [apiUrl] - Custom API URL
 * @property {Function} [onSuccess] - Success callback
 * @property {Function} [onError] - Error callback
 * @property {string} [label] - Input label
 * @property {string} [placeholder] - Input placeholder
 * @property {string} [className] - Custom CSS classes
 * @property {Object} [theme] - Custom theme configuration
 */

/**
 * @typedef {Object} EmailTemplate
 * @property {string} subject - Email subject
 * @property {string} html - HTML content
 * @property {string} text - Plain text content
 */

/**
 * Default configuration for OTP system
 */
export const DEFAULT_CONFIG = {
  otpLength: 6,
  expiryMinutes: 5,
  emailService: 'gmail',
  apiBaseUrl: 'http://localhost:3300',
  endpoints: {
    send: '/sentotp',
    verify: '/verifyotp'
  }
};

/**
 * Validation patterns
 */
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  otp: /^\d{6}$/
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_OTP: 'Please enter a valid 6-digit OTP',
  OTP_EXPIRED: 'OTP has expired. Please request a new one',
  OTP_NOT_FOUND: 'OTP not found. Please request a new one',
  EMAIL_REQUIRED: 'Email is required',
  OTP_REQUIRED: 'OTP is required',
  SEND_FAILED: 'Failed to send OTP. Please try again',
  VERIFY_FAILED: 'Failed to verify OTP. Please try again'
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  OTP_SENT: 'OTP sent successfully!',
  OTP_VERIFIED: 'OTP verified successfully!'
};
