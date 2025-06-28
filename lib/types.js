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

export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  otp: /^\d{6}$/
};

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

export const SUCCESS_MESSAGES = {
  OTP_SENT: 'OTP sent successfully!',
  OTP_VERIFIED: 'OTP verified successfully!'
};
