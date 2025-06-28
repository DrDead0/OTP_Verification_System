export interface OtpConfig {
  otpLength?: number;
  expiryMinutes?: number;
  maxAttempts?: number;
}

export interface EmailConfig {
  service?: string;
  user: string;
  pass: string;
  host?: string;
  port?: number;
  secure?: boolean;
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  errorColor?: string;
  successColor?: string;
  borderRadius?: string;
  fontSize?: string;
}

export interface SendOtpProps {
  apiUrl: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  theme?: ThemeConfig;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  errorClassName?: string;
  successClassName?: string;
  placeholder?: string;
  buttonText?: string;
  loadingText?: string;
}

export interface VerifyOtpProps {
  apiUrl: string;
  email: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onResend?: () => void;
  otpLength?: number;
  expiryTime?: number;
  theme?: ThemeConfig;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  errorClassName?: string;
  successClassName?: string;
  autoFocus?: boolean;
  allowPaste?: boolean;
}

export interface OtpMiddlewareOptions {
  emailConfig: EmailConfig;
  otpConfig?: OtpConfig;
  rateLimitConfig?: {
    maxAttempts?: number;
    windowMs?: number;
  };
  enableCleanupRoute?: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export declare const SendOtp: React.FC<SendOtpProps>;
export declare const VerifyOtp: React.FC<VerifyOtpProps>;

export declare function generateOTP(length?: number): string;
export declare function validateEmail(email: string): ValidationResult;
export declare function validateOTP(otp: string, expectedLength?: number): ValidationResult;
export declare function formatTimeRemaining(expiryTime: number): string;
export declare function createResponse(success: boolean, message: string, data?: any): ApiResponse;
export declare function handleApiError(error: any): ApiResponse;

export declare function createOtpRoutes(options: OtpMiddlewareOptions): any;
export declare function otpMiddleware(options: OtpMiddlewareOptions): any;
export declare function rateLimitMiddleware(options?: { maxAttempts?: number; windowMs?: number }): any;
