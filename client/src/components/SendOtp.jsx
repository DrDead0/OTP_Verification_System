import React, { useState, useEffect } from "react";
import axios from "axios";
import { validateEmail } from "../../../lib/utils.js";
import { DEFAULT_CONFIG, ERROR_MESSAGES } from "../../../lib/types.js";

const SendOtp = ({
  apiUrl = DEFAULT_CONFIG.apiBaseUrl + DEFAULT_CONFIG.endpoints.send,  httpMethod = "POST",
  
  onSuccess = () => {},
  onError = () => {},  onChange = () => {},
  
  label = "Email",
  placeholder = "Enter your email address",
  buttonText = "Send OTP",  loadingText = "Sending...",
  
  className = "",
  inputClassName = "",
  buttonClassName = "",
  errorClassName = "",  successClassName = "",
  
  disabled = false,
  autoFocus = false,
  clearOnSuccess = true,  validateOnBlur = true,
  
  theme = {},  
  customValidation = null,  retryConfig = { enabled: false, maxRetries: 3, delay: 1000 },
  
  value: controlledValue,
  defaultValue = "",
  name = "email",
  id = "otp-email-input"
}) => {
  const [input, setInput] = useState(controlledValue || defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");  const [retryCount, setRetryCount] = useState(0);
  
  const isControlled = controlledValue !== undefined;  const inputValue = isControlled ? controlledValue : input;
  
  const defaultTheme = {
    primaryColor: "#3B82F6",
    successColor: "#10B981",
    errorColor: "#EF4444",
    borderRadius: "0.5rem",
    spacing: "1rem",
    fontSize: "1rem"
  };
  
  const finalTheme = { ...defaultTheme, ...theme };
  
  useEffect(() => {
    onChange(inputValue);
  }, [inputValue, onChange]);
  
  const handleInputChange = (e) => {
    const value = e.target.value;    if (!isControlled) {
      setInput(value);
    }
    
    if (error) setError("");
    if (success) setSuccess("");
    
    onChange(value);
  };
  
  const handleBlur = () => {
    if (validateOnBlur && inputValue.trim()) {
      const validation = customValidation 
        ? customValidation(inputValue)
        : validateEmail(inputValue);
        
      if (!validation.isValid) {
        setError(validation.error);
      }
    }
  };
  
  const performSubmit = async (email, attempt = 1) => {
    try {
      const response = await axios({
        method: httpMethod,
        url: apiUrl,
        data: { email },
        timeout: 10000
      });
      
      if (response.data.success) {
        setSuccess(response.data.message || "OTP sent successfully!");
        if (clearOnSuccess && !isControlled) {
          setInput("");
        }
        setRetryCount(0);
        onSuccess(response.data);
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (err) {      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          ERROR_MESSAGES.SEND_FAILED;
      
      if (retryConfig.enabled && attempt < retryConfig.maxRetries) {
        setTimeout(() => {
          performSubmit(email, attempt + 1);
        }, retryConfig.delay * attempt);
        setRetryCount(attempt);
        return;
      }
      
      setError(errorMessage);
      onError(err?.response?.data || { message: errorMessage });
      setRetryCount(0);
    }
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError("");
    setSuccess("");
    
    const email = inputValue.trim();
    const validation = customValidation 
      ? customValidation(email)
      : validateEmail(email);
      
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    setLoading(true);
    await performSubmit(email);
    setLoading(false);
  };
    
  const containerClasses = `otp-send-container ${className}`;
  const inputClasses = `otp-input ${inputClassName} ${error ? 'error' : ''} ${success ? 'success' : ''}`;
  const buttonClasses = `otp-button ${buttonClassName} ${loading || disabled ? 'disabled' : ''}`;
  const errorClasses = `otp-error ${errorClassName}`;  const successClasses = `otp-success ${successClassName}`;
  
  const inputStyle = {
    borderColor: error ? finalTheme.errorColor : 
                success ? finalTheme.successColor : 
                finalTheme.primaryColor,
    borderRadius: finalTheme.borderRadius,
    fontSize: finalTheme.fontSize,
    padding: finalTheme.spacing
  };
  
  const buttonStyle = {
    backgroundColor: disabled || loading ? '#9CA3AF' : finalTheme.primaryColor,
    borderRadius: finalTheme.borderRadius,
    fontSize: finalTheme.fontSize,
    padding: finalTheme.spacing
  };
  
  return (
    <div className={containerClasses}>
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
          id={id}
          name={name}
          type="email"
          className={inputClasses}
          style={inputStyle}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={loading || disabled}
          autoFocus={autoFocus}
          autoComplete="email"
          required        />
        
        {error && (
          <div className={errorClasses} style={{ color: finalTheme.errorColor }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className={successClasses} style={{ color: finalTheme.successColor }}>
            {success}
          </div>
        )}
        
        {retryConfig.enabled && retryCount > 0 && (
          <div className="text-sm text-gray-600">
            Retrying... (Attempt {retryCount + 1} of {retryConfig.maxRetries})
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
      </form>
    </div>
  );
};

SendOtp.defaultProps = {
  className: "otp-send-form",
  inputClassName: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
  buttonClassName: "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60",
  errorClassName: "text-red-500 text-sm",
  successClassName: "text-green-600 text-sm"
};

export default SendOtp;
