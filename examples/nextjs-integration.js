import { useState } from 'react';
import { SendOtp } from '../../../client/src/components/SendOtp';

export default function SendOtpPage() {
  const [otpSent, setOtpSent] = useState(false);
  
  const handleOtpSuccess = (data) => {    console.log('OTP sent successfully:', data);
    setOtpSent(true);
    router.push('/auth/verify-otp');
  };
    const handleOtpError = (error) => {
    console.error('OTP send failed:', error);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">Login to Your Account</h1>
        <SendOtp
          apiUrl={process.env.NEXT_PUBLIC_API_URL + '/sentotp'}
          onSuccess={handleOtpSuccess}
          onError={handleOtpError}
          label="Email Address"
          placeholder="Enter your email to receive OTP"
          className="custom-otp-form"
        />
      </div>
    </div>
  );
}


import { VerifyOtp } from '../../../client/src/components/VerifyOtp';
import { useRouter } from 'next/router';

export default function VerifyOtpPage() {
  const router = useRouter();
  
  const handleVerifySuccess = (data) => {
    console.log('OTP verified:', data);
    
    localStorage.setItem('authenticated', 'true');
    router.push('/dashboard');
  };
  
  const handleVerifyError = (error) => {
    console.error('OTP verification failed:', error);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full">
        <VerifyOtp
          apiUrl={process.env.NEXT_PUBLIC_API_URL + '/verifyotp'}
          onSuccess={handleVerifySuccess}
          onError={handleVerifyError}
        />
      </div>
    </div>
  );
}


module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  }
};





