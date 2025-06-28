
import React, { useState } from 'react';
import { SendOtp, VerifyOtp } from '../client/src/components';


export function BasicOtpFlow() {
  const [currentStep, setCurrentStep] = useState('send');
  const [email, setEmail] = useState('');
  
  return (
    <div className="otp-container">
      {currentStep === 'send' && (
        <SendOtp
          onSuccess={(data) => {
            setEmail(data.email);
            setCurrentStep('verify');
          }}
          onError={(error) => {
            console.error('Send OTP failed:', error);
          }}
          className="custom-send-form"
          theme={{
            primaryColor: '#3B82F6',
            borderRadius: '8px',
            spacing: '1rem'
          }}
        />
      )}
      
      {currentStep === 'verify' && (
        <VerifyOtp
          email={email}
          onSuccess={(data) => {
            console.log('Verification successful:', data);
            
          }}
          onError={(error) => {
            console.error('Verification failed:', error);
          }}
          onBackToSend={() => setCurrentStep('send')}
          className="custom-verify-form"
        />
      )}
    </div>
  );
}


export function CustomOtpFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const steps = ['Enter Email', 'Verify OTP', 'Complete'];
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((stepName, index) => (
            <div
              key={index}
              className={`flex items-center ${
                step > index + 1 ? 'text-green-600' :
                step === index + 1 ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step > index + 1 ? 'bg-green-600 border-green-600 text-white' :
                  step === index + 1 ? 'border-blue-600' : 'border-gray-300'
                }`}
              >
                {step > index + 1 ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step > index + 1 ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 text-center">
          Step {step} of {steps.length}: {steps[step - 1]}
        </p>
      </div>
      
      {}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">Enter Your Email</h2>
          <SendOtp
            apiUrl="/api/auth/send-otp"
            onSuccess={(data) => {
              setEmail(data.email);
              setStep(2);
            }}
            onError={(error) => {
              console.error('Send failed:', error);
            }}
            label="Email Address"
            placeholder="your@email.com"
            loadingText="Sending OTP..."
          />
        </div>
      )}
      
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">Verify OTP</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            We've sent a 6-digit code to {email}
          </p>
          <VerifyOtp
            email={email}
            apiUrl="/api/auth/verify-otp"
            onSuccess={(data) => {
              setStep(3);
            }}
            onError={(error) => {
              console.error('Verify failed:', error);
            }}
            showResend={true}
            resendCooldown={30}
            onResend={() => {
              
              setLoading(true);
              
              setLoading(false);
            }}
          />
          <button
            onClick={() => setStep(1)}
            className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            ← Change Email Address
          </button>
        </div>
      )}
      
      {step === 3 && (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-green-600">✓</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Verification Complete!</h2>
          <p className="text-gray-600 mb-4">
            Your email has been successfully verified.
          </p>
          <button
            onClick={() => {
              
              window.location.href = '/dashboard';
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Continue to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}


export function ModalOtpFlow({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState('send');
  const [email, setEmail] = useState('');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Email Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {step === 'send' && (
          <SendOtp
            onSuccess={(data) => {
              setEmail(data.email);
              setStep('verify');
            }}
            compact={true}
            hideLabels={true}
            placeholder="Enter email for verification"
          />
        )}
        
        {step === 'verify' && (
          <VerifyOtp
            email={email}
            onSuccess={(data) => {
              onComplete(data);
              onClose();
            }}
            compact={true}
            autoFocus={true}
          />
        )}
      </div>
    </div>
  );
}


export function FlexibleOtpForm({ 
  purpose = 'login', 
  onComplete,
  config = {}
}) {
  const [step, setStep] = useState('send');
  const [email, setEmail] = useState('');
  
  const purposes = {
    login: {
      title: 'Sign In',
      subtitle: 'Enter your email to receive a login code',
      sendLabel: 'Email Address',
      verifyTitle: 'Enter Login Code',
      successMessage: 'Login successful!'
    },
    registration: {
      title: 'Create Account',
      subtitle: 'Verify your email to complete registration',
      sendLabel: 'Email Address',
      verifyTitle: 'Verify Your Email',
      successMessage: 'Account created successfully!'
    },
    'password-reset': {
      title: 'Reset Password',
      subtitle: 'Enter your email to receive a reset code',
      sendLabel: 'Email Address',
      verifyTitle: 'Enter Reset Code',
      successMessage: 'You can now reset your password'
    },
    '2fa': {
      title: 'Two-Factor Authentication',
      subtitle: 'Enter your email for 2FA verification',
      sendLabel: 'Email Address',
      verifyTitle: 'Enter 2FA Code',
      successMessage: '2FA verification complete'
    }
  };
  
  const currentPurpose = purposes[purpose] || purposes.login;
  
  return (
    <div className="otp-form-container">
      {step === 'send' && (
        <div>
          <h2 className="text-2xl font-bold mb-2">{currentPurpose.title}</h2>
          <p className="text-gray-600 mb-6">{currentPurpose.subtitle}</p>
          <SendOtp
            apiUrl={config.apiUrl || `/api/${purpose}/send-otp`}
            onSuccess={(data) => {
              setEmail(data.email);
              setStep('verify');
            }}
            label={currentPurpose.sendLabel}
            {...config.sendProps}
          />
        </div>
      )}
      
      {step === 'verify' && (
        <div>
          <h2 className="text-2xl font-bold mb-2">{currentPurpose.verifyTitle}</h2>
          <VerifyOtp
            email={email}
            apiUrl={config.apiUrl || `/api/${purpose}/verify-otp`}
            onSuccess={(data) => {
              onComplete({ ...data, purpose, email });
            }}
            successMessage={currentPurpose.successMessage}
            {...config.verifyProps}
          />
        </div>
      )}
    </div>
  );
}
