/**
 * @fileoverview Enhanced VerifyOtp Component
 * Integration-friendly component with extensive customization options
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { validateOTP, formatTimeRemaining } from '../../../lib/utils.js';
import { DEFAULT_CONFIG, ERROR_MESSAGES } from '../../../lib/types.js';

const VerifyOtp = ({
  // Required props
  email,
  
  // API Configuration
  apiUrl = DEFAULT_CONFIG.apiBaseUrl + DEFAULT_CONFIG.endpoints.verify,
  resendApiUrl,
  httpMethod = "POST",
  
  // Callbacks
  onSuccess = () => {},
  onError = () => {},
  onChange = () => {},
  onResend = () => {},
  onExpiry = () => {},
  
  // UI Customization
  label = "OTP",
  placeholder = "Enter the OTP you received",
  buttonText = "Verify OTP",
  loadingText = "Verifying...",
  resendText = "Resend OTP",
  resendingText = "Resending...",
  
  // Styling
  className = "",
  inputClassName = "",
  buttonClassName = "",
  errorClassName = "",
  successClassName = "",
  
  // Behavior
  disabled = false,
  autoFocus = true,
  clearOnSuccess = true,
  showResend = true,
  resendCooldown = 30,
  maxLength = 6,
  
  // Timer
  showTimer = true,
  timerDuration = 5 * 60 * 1000, // 5 minutes
  
  // Theme
  theme = {},
  
  // Advanced
  customValidation = null,
  autoSubmit = false,
  formatInput = true,
  
  // Integration helpers
  value: controlledValue,
  defaultValue = "",
  name = "otp",
  id = "otp-verify-input",
  
  // Accessibility
  ariaLabel = "Enter verification code"
}) => {
  const [otp, setOtp] = useState(controlledValue || defaultValue);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldownTime, setResendCooldownTime] = useState(0);
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const resendTimerRef = useRef(null);
  
  // Controlled vs uncontrolled component handling
  const isControlled = controlledValue !== undefined;
  const otpValue = isControlled ? controlledValue : otp;
  
  // Default theme
  const defaultTheme = {
    primaryColor: "#3B82F6",
    successColor: "#10B981",
    errorColor: "#EF4444",
    borderRadius: "0.5rem",
    spacing: "1rem",
    fontSize: "1rem"
  };
  
  const finalTheme = { ...defaultTheme, ...theme };
  
  // Timer effect
  useEffect(() => {
    if (showTimer && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            onExpiry();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining, showTimer, onExpiry]);
  
  // Resend cooldown effect
  useEffect(() => {
    if (resendCooldownTime > 0) {
      resendTimerRef.current = setTimeout(() => {
        setResendCooldownTime(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (resendTimerRef.current) {
        clearTimeout(resendTimerRef.current);
      }
    };
  }, [resendCooldownTime]);
  
  // Auto focus effect
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
    // Auto submit effect
  useEffect(() => {
    if (autoSubmit && otpValue.length === maxLength) {
      const submitForm = async () => {
        const otpCode = otpValue.trim();
        const validation = customValidation 
          ? customValidation(otpCode)
          : validateOTP(otpCode, maxLength);
          
        if (!validation.isValid) {
          setError(validation.error);
          return;
        }
        
        if (!email) {
          setError("Email is required for verification");
          return;
        }
        
        setLoading(true);
        
        try {
          const response = await axios({
            method: httpMethod,
            url: apiUrl,
            data: { email, otp: otpCode },
            timeout: 10000
          });
          
          if (response.data.success) {
            setSuccess(response.data.message || "OTP verified successfully!");
            if (clearOnSuccess && !isControlled) {
              setOtp("");
            }
            onSuccess(response.data);
          } else {
            throw new Error(response.data.message || "Failed to verify OTP");
          }
        } catch (err) {
          const errorMessage = err?.response?.data?.message || 
                              err?.message || 
                              ERROR_MESSAGES.VERIFY_FAILED;
          setError(errorMessage);
          onError(err?.response?.data || { message: errorMessage });
        } finally {
          setLoading(false);
        }
      };
      
      submitForm();
    }
  }, [otpValue, autoSubmit, maxLength, customValidation, email, httpMethod, apiUrl, clearOnSuccess, isControlled, onSuccess, onError]);
  
  const handleInputChange = (e) => {
    let value = e.target.value;
    
    // Format input (numbers only)
    if (formatInput) {
      value = value.replace(/\D/g, '');
    }
    
    // Limit length
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
    
    if (!isControlled) {
      setOtp(value);
    }
    
    // Clear previous messages
    if (error) setError("");
    if (success) setSuccess("");
    
    onChange(value);
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Clear previous messages
    setError("");
    setSuccess("");
    
    // Validate OTP
    const otpCode = otpValue.trim();
    const validation = customValidation 
      ? customValidation(otpCode)
      : validateOTP(otpCode, maxLength);
      
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    if (!email) {
      setError("Email is required for verification");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios({
        method: httpMethod,
        url: apiUrl,
        data: { email, otp: otpCode },
        timeout: 10000
      });
      
      if (response.data.success) {
        setSuccess(response.data.message || "OTP verified successfully!");
        if (clearOnSuccess && !isControlled) {
          setOtp("");
        }
        onSuccess(response.data);
      } else {
        throw new Error(response.data.message || "Failed to verify OTP");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          ERROR_MESSAGES.VERIFY_FAILED;
      setError(errorMessage);
      onError(err?.response?.data || { message: errorMessage });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResend = async () => {
    if (!canResend && resendCooldownTime > 0) return;
    
    setResending(true);
    setCanResend(false);
    setResendCooldownTime(resendCooldown);
    
    try {
      const url = resendApiUrl || apiUrl.replace('/verify', '/send');
      const response = await axios.post(url, { email });
      
      if (response.data.success) {
        setSuccess("OTP resent successfully!");
        setTimeRemaining(timerDuration); // Reset timer
        onResend(response.data);
      } else {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          "Failed to resend OTP";
      setError(errorMessage);
      setCanResend(true);
      setResendCooldownTime(0);
    } finally {
      setResending(false);
    }
  };
  
  // Generate CSS classes
  const containerClasses = `otp-verify-container ${className}`;
  const inputClasses = `otp-input ${inputClassName} ${error ? 'error' : ''} ${success ? 'success' : ''}`;
  const buttonClasses = `otp-button ${buttonClassName} ${loading || disabled ? 'disabled' : ''}`;
  const errorClasses = `otp-error ${errorClassName}`;
  const successClasses = `otp-success ${successClassName}`;
  
  // Inline styles for theme support
  const inputStyle = {
    borderColor: error ? finalTheme.errorColor : 
                success ? finalTheme.successColor : 
                finalTheme.primaryColor,
    borderRadius: finalTheme.borderRadius,
    fontSize: finalTheme.fontSize,
    padding: finalTheme.spacing,
    textAlign: 'center',
    letterSpacing: '0.1em'
  };
  
  const buttonStyle = {
    backgroundColor: disabled || loading ? '#9CA3AF' : finalTheme.primaryColor,
    borderRadius: finalTheme.borderRadius,
    fontSize: finalTheme.fontSize,
    padding: finalTheme.spacing
  };
  
  return (
    <div className={containerClasses}>
      {/* Email Display */}
      {email && (
        <p className="mb-2 text-gray-600 text-center">
          Verifying for: <strong>{email}</strong>
        </p>
      )}
      
      {/* Timer */}
      {showTimer && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600">
            Time remaining: 
            <span className={`ml-1 font-mono ${timeRemaining < 60000 ? 'text-red-500' : 'text-blue-600'}`}>
              {formatTimeRemaining(Date.now() + timeRemaining)}
            </span>
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {label && (
          <label 
            className="block text-gray-700 font-medium mb-1" 
            htmlFor={id}
          >
            {label}
          </label>
        )}
        
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className={inputClasses}
          style={inputStyle}
          placeholder={placeholder}
          value={otpValue}
          onChange={handleInputChange}
          disabled={loading || disabled}
          maxLength={maxLength}
          autoComplete="one-time-code"
          aria-label={ariaLabel}
          required
        />
        
        {/* Error Message */}
        {error && (
          <div className={errorClasses} style={{ color: finalTheme.errorColor }}>
            {error}
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className={successClasses} style={{ color: finalTheme.successColor }}>
            {success}
          </div>
        )}
        
        <button
          type="submit"
          className={buttonClasses}
          style={buttonStyle}
          disabled={loading || disabled}
        >
          {loading ? loadingText : buttonText}
        </button>
        
        {/* Resend Button */}
        {showResend && (
          <div className="text-center">
            {canResend && resendCooldownTime === 0 ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
              >
                {resending ? resendingText : resendText}
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend OTP in {resendCooldownTime}s
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

// Default CSS classes (can be overridden)
VerifyOtp.defaultProps = {
  className: "otp-verify-form",
  inputClassName: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
  buttonClassName: "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60",
  errorClassName: "text-red-500 text-sm",
  successClassName: "text-green-600 text-sm"
};

export default VerifyOtp;
