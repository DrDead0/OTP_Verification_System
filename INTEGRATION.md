# Integration Guide 🚀

This guide shows you how to integrate the OTP Verification System into your projects quickly and easily.

## Table of Contents

1. [Quick Start](#quick-start)
2. [React Integration](#react-integration)
3. [Express.js Integration](#expressjs-integration)
4. [Custom Styling](#custom-styling)
5. [Configuration Options](#configuration-options)
6. [API Reference](#api-reference)
7. [Examples](#examples)

## Quick Start

### Option 1: Use as npm packages (Recommended)

```bash
# Install React components
npm install @yourorg/otp-verification-react

# Install Express middleware
npm install @yourorg/otp-verification-server
```

### Option 2: Copy components directly

1. Copy the `client/src/components` folder to your React project
2. Copy the `server/middleware` folder to your Express project
3. Copy the `lib` folder for shared utilities

## React Integration

### Basic Usage

```jsx
import React from 'react';
import { SendOtp, VerifyOtp } from '@yourorg/otp-verification-react';

function LoginPage() {
  const [step, setStep] = useState('send');
  const [email, setEmail] = useState('');

  return (
    <div>
      {step === 'send' && (
        <SendOtp
          apiUrl="https://your-api.com/auth/send-otp"
          onSuccess={(data) => {
            setEmail(data.email);
            setStep('verify');
          }}
        />
      )}
      
      {step === 'verify' && (
        <VerifyOtp
          email={email}
          apiUrl="https://your-api.com/auth/verify-otp"
          onSuccess={(data) => {
            // User is verified, redirect to dashboard
            window.location.href = '/dashboard';
          }}
        />
      )}
    </div>
  );
}
```

### Next.js Integration

```jsx
// pages/auth/login.js
import { SendOtp, VerifyOtp } from '@yourorg/otp-verification-react';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState('send');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center">
      {step === 'send' ? (
        <SendOtp
          apiUrl={`${process.env.NEXT_PUBLIC_API_URL}/auth/send-otp`}
          onSuccess={(data) => {
            setEmail(data.email);
            setStep('verify');
          }}
          className="max-w-md w-full"
        />
      ) : (
        <VerifyOtp
          email={email}
          apiUrl={`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`}
          onSuccess={() => {
            router.push('/dashboard');
          }}
          className="max-w-md w-full"
        />
      )}
    </div>
  );
}
```

### Custom Hook Usage

```jsx
import { useState } from 'react';
import { SendOtp, VerifyOtp } from '@yourorg/otp-verification-react';

function useOtpFlow(apiBaseUrl) {
  const [step, setStep] = useState('send');
  const [email, setEmail] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const handleSendSuccess = (data) => {
    setEmail(data.email);
    setStep('verify');
  };

  const handleVerifySuccess = (data) => {
    setIsComplete(true);
    return data;
  };

  const reset = () => {
    setStep('send');
    setEmail('');
    setIsComplete(false);
  };

  const OtpFlow = () => (
    <>
      {step === 'send' && (
        <SendOtp
          apiUrl={`${apiBaseUrl}/send-otp`}
          onSuccess={handleSendSuccess}
        />
      )}
      {step === 'verify' && (
        <VerifyOtp
          email={email}
          apiUrl={`${apiBaseUrl}/verify-otp`}
          onSuccess={handleVerifySuccess}
        />
      )}
    </>
  );

  return { OtpFlow, step, email, isComplete, reset };
}

// Usage
function MyComponent() {
  const { OtpFlow, isComplete } = useOtpFlow('https://api.example.com');
  
  if (isComplete) {
    return <div>Verification complete!</div>;
  }
  
  return <OtpFlow />;
}
```

## Express.js Integration

### Using as Middleware

```javascript
import express from 'express';
import { otpMiddleware } from '@yourorg/otp-verification-server';

const app = express();

app.use('/auth', otpMiddleware({
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
}));

// Now you can use req.sendOtp and req.verifyOtp in your routes
app.post('/auth/login', async (req, res) => {
  const { email, otp } = req.body;
  
  if (otp) {
    // Verify OTP
    const result = req.verifyOtp(email, otp);
    if (result.success) {
      // Generate JWT token and send response
      const token = generateJWT(email);
      res.json({ success: true, token });
    } else {
      res.status(400).json(result);
    }
  } else {
    // Send OTP
    const result = await req.sendOtp(email);
    res.json(result);
  }
});
```

### Using Routes

```javascript
import express from 'express';
import { createOtpRoutes } from '@yourorg/otp-verification-server';

const app = express();

const otpRoutes = createOtpRoutes({
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000
  }
});

app.use('/otp', otpRoutes);

// Routes available:
// POST /otp/send - Send OTP
// POST /otp/verify - Verify OTP
```

### Custom Integration

```javascript
import express from 'express';
import { generateOTP, validateEmail, createEmailTemplate } from '@yourorg/otp-verification-server';
import nodemailer from 'nodemailer';

const app = express();
const otpStore = new Map();

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

app.post('/custom-otp/send', async (req, res) => {
  const { email } = req.body;
  
  const validation = validateEmail(email);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }
  
  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000;
  
  otpStore.set(email, { otp, expiry });
  
  const template = createEmailTemplate(otp, 5);
  
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: template.subject,
    html: template.html
  });
  
  res.json({ success: true, message: 'OTP sent!' });
});
```

## Custom Styling

### Tailwind CSS (Default)

The components come with Tailwind CSS classes by default:

```jsx
<SendOtp 
  className="custom-container"
  inputClassName="my-custom-input-style"
  buttonClassName="my-custom-button-style"
  errorClassName="my-error-style"
/>
```

### CSS-in-JS

```jsx
<SendOtp 
  theme={{
    primaryColor: '#6366f1',
    successColor: '#10b981',
    errorColor: '#ef4444',
    borderRadius: '0.5rem',
    fontSize: '1rem'
  }}
/>
```

### Custom CSS

```css
/* Custom styles */
.otp-input {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  text-align: center;
}

.otp-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.otp-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.otp-button:hover {
  transform: translateY(-1px);
}
```

## Configuration Options

### SendOtp Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiUrl` | string | Required | API endpoint for sending OTP |
| `onSuccess` | function | `() => {}` | Called when OTP is sent successfully |
| `onError` | function | `() => {}` | Called when sending fails |
| `label` | string | `"Email"` | Input label text |
| `placeholder` | string | `"Enter your email address"` | Input placeholder |
| `buttonText` | string | `"Send OTP"` | Button text |
| `loadingText` | string | `"Sending..."` | Loading state text |
| `className` | string | `""` | Container CSS class |
| `disabled` | boolean | `false` | Disable the form |
| `autoFocus` | boolean | `false` | Auto focus on input |
| `theme` | object | `{}` | Custom theme configuration |

### VerifyOtp Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `email` | string | Required | Email address to verify |
| `apiUrl` | string | Required | API endpoint for verification |
| `onSuccess` | function | `() => {}` | Called when OTP is verified |
| `onError` | function | `() => {}` | Called when verification fails |
| `showResend` | boolean | `true` | Show resend OTP option |
| `resendCooldown` | number | `30` | Resend cooldown in seconds |
| `showTimer` | boolean | `true` | Show expiry timer |
| `timerDuration` | number | `300000` | Timer duration in milliseconds |
| `maxLength` | number | `6` | Maximum OTP length |
| `autoSubmit` | boolean | `false` | Auto submit when OTP is complete |

### Middleware Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `emailConfig.service` | string | `"gmail"` | Email service provider |
| `emailConfig.user` | string | `process.env.EMAIL` | Email username |
| `emailConfig.pass` | string | `process.env.PASSWORD` | Email password |
| `otpLength` | number | `6` | OTP length |
| `expiryMinutes` | number | `5` | OTP expiry time |
| `rateLimit.maxAttempts` | number | `5` | Max attempts per window |
| `rateLimit.windowMs` | number | `900000` | Rate limit window |

## Examples

### 1. Login Flow

```jsx
function LoginFlow() {
  const [user, setUser] = useState(null);
  
  return (
    <div>
      {!user ? (
        <OtpVerification
          onComplete={(userData) => setUser(userData)}
          purpose="login"
        />
      ) : (
        <Dashboard user={user} />
      )}
    </div>
  );
}
```

### 2. Registration Flow

```jsx
function RegistrationFlow() {
  const [formData, setFormData] = useState({});
  const [step, setStep] = useState('form');
  
  return (
    <div>
      {step === 'form' && (
        <RegistrationForm 
          onSubmit={(data) => {
            setFormData(data);
            setStep('verify');
          }}
        />
      )}
      
      {step === 'verify' && (
        <VerifyOtp
          email={formData.email}
          onSuccess={() => {
            // Create account
            createAccount(formData);
            setStep('complete');
          }}
        />
      )}
      
      {step === 'complete' && (
        <WelcomeMessage />
      )}
    </div>
  );
}
```

### 3. Password Reset

```jsx
function PasswordReset() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email');
  
  return (
    <div>
      {step === 'email' && (
        <SendOtp
          apiUrl="/api/password-reset/send"
          onSuccess={(data) => {
            setEmail(data.email);
            setStep('verify');
          }}
          label="Email for password reset"
        />
      )}
      
      {step === 'verify' && (
        <VerifyOtp
          email={email}
          apiUrl="/api/password-reset/verify"
          onSuccess={() => setStep('newPassword')}
        />
      )}
      
      {step === 'newPassword' && (
        <NewPasswordForm email={email} />
      )}
    </div>
  );
}
```

### 4. Two-Factor Authentication

```jsx
function TwoFactorSetup() {
  const user = useCurrentUser();
  
  return (
    <div>
      <h2>Enable Two-Factor Authentication</h2>
      <VerifyOtp
        email={user.email}
        apiUrl="/api/2fa/enable"
        onSuccess={() => {
          alert('2FA enabled successfully!');
          // Update user settings
        }}
        buttonText="Enable 2FA"
      />
    </div>
  );
}
```

## Need Help?

- 📖 [Full Documentation](https://docs.example.com)
- 🐛 [Report Issues](https://github.com/yourorg/otp-verification-system/issues)
- 💬 [Discussions](https://github.com/yourorg/otp-verification-system/discussions)
- ✉️ [Email Support](mailto:support@example.com)
