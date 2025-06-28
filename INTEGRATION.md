# 🔧 Complete Integration Guide

This guide provides detailed instructions for integrating the OTP Verification System into various frameworks and platforms.

**Created by: [Ashish Chaurasiya](mailto:ashishchaurasiya128@gmail.com)**

---

## 📋 Table of Contents

1. [Next.js Integration](#nextjs)
2. [Angular Integration](#angular)
3. [Vue.js Integration](#vuejs)
4. [Express.js Integration](#expressjs)
5. [Vanilla JavaScript](#vanilla)
6. [PHP Integration](#php)
7. [Python/Django Integration](#python)
8. [Production Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🟢 Next.js Integration {#nextjs}

### Method 1: API Routes + React Components

1. **Install the components:**
```bash
cp -r ./client ./your-nextjs-app/components/otp-system
```

2. **Create API Routes:**

For **App Router** (`app/api/auth/send-otp/route.js`):
```javascript
import { NextResponse } from 'next/server';
import { generateOTP, validateEmail } from '../../../../lib/utils.js';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const otp = generateOTP();
    
    // Store OTP (use database in production)
    global.otpStore = global.otpStore || {};
    global.otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    // Send email
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP is: <strong>${otp}</strong></p><p>Expires in 5 minutes.</p>`
    });

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      email 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
```

For **Pages Router** (`pages/api/auth/send-otp.js`):
```javascript
import { generateOTP, validateEmail } from '../../../lib/utils.js';
import nodemailer from 'nodemailer';

const otpStore = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { email } = req.body;
    
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const otp = generateOTP();
    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP is: <strong>${otp}</strong></p><p>Expires in 5 minutes.</p>`
    });

    res.json({ success: true, message: 'OTP sent successfully', email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}
```

3. **Use in your pages:**
```jsx
// app/auth/page.js or pages/auth.js
'use client'; // for App Router

import { useState } from 'react';
import { SendOtp, VerifyOtp } from '../components/otp-system/src';

export default function AuthPage() {
  const [step, setStep] = useState('send');
  const [email, setEmail] = useState('');

  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">Email Verification</h1>
      
      {step === 'send' && (
        <SendOtp
          apiUrl="/api/auth/send-otp"
          onSuccess={(data) => {
            setEmail(data.email);
            setStep('verify');
          }}
          onError={(error) => {
            console.error('Send OTP failed:', error);
          }}
        />
      )}
      
      {step === 'verify' && (
        <VerifyOtp
          email={email}
          apiUrl="/api/auth/verify-otp"
          onSuccess={(data) => {
            // Redirect to dashboard or show success
            window.location.href = '/dashboard';
          }}
          onError={(error) => {
            console.error('Verification failed:', error);
          }}
        />
      )}
    </div>
  );
}
```

### Method 2: External Server

Simply connect to the standalone OTP server:

```jsx
<SendOtp apiUrl="http://localhost:3300/sentotp" />
<VerifyOtp apiUrl="http://localhost:3300/verifyotp" />
```

---

## 🔵 Angular Integration {#angular}

### 1. Create the OTP Service

**`src/app/services/otp.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface OtpResponse {
  success: boolean;
  message: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private apiUrl = 'http://localhost:3300';

  constructor(private http: HttpClient) {}

  sendOtp(email: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.apiUrl}/sentotp`, { email })
      .pipe(catchError(this.handleError));
  }

  verifyOtp(email: string, otp: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.apiUrl}/verifyotp`, { email, otp })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error.message || error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
```

### 2. Create Components

**`src/app/components/send-otp/send-otp.component.ts`**
```typescript
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OtpService } from '../../services/otp.service';

@Component({
  selector: 'app-send-otp',
  template: `
    <form [formGroup]="otpForm" (ngSubmit)="sendOtp()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Email Address</label>
        <input 
          type="email" 
          formControlName="email"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
          [class.border-red-500]="otpForm.get('email')?.invalid && otpForm.get('email')?.touched"
        />
        <div *ngIf="otpForm.get('email')?.errors?.['required'] && otpForm.get('email')?.touched" 
             class="text-red-500 text-sm mt-1">
          Email is required
        </div>
        <div *ngIf="otpForm.get('email')?.errors?.['email'] && otpForm.get('email')?.touched" 
             class="text-red-500 text-sm mt-1">
          Please enter a valid email
        </div>
      </div>
      
      <button 
        type="submit" 
        [disabled]="otpForm.invalid || loading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Sending...' : 'Send OTP' }}
      </button>
      
      <div *ngIf="message" 
           class="mt-4 p-3 rounded text-sm"
           [class.bg-green-100]="success" 
           [class.text-green-800]="success"
           [class.bg-red-100]="!success"
           [class.text-red-800]="!success">
        {{ message }}
      </div>
    </form>
  `,
  styles: [`
    .space-y-4 > * + * {
      margin-top: 1rem;
    }
  `]
})
export class SendOtpComponent {
  @Output() otpSent = new EventEmitter<string>();
  
  otpForm: FormGroup;
  loading = false;
  message = '';
  success = false;

  constructor(
    private fb: FormBuilder, 
    private otpService: OtpService
  ) {
    this.otpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendOtp() {
    if (this.otpForm.valid) {
      this.loading = true;
      this.message = '';
      const email = this.otpForm.value.email;
      
      this.otpService.sendOtp(email).subscribe({
        next: (response) => {
          this.success = true;
          this.message = response.message;
          this.loading = false;
          this.otpSent.emit(email);
        },
        error: (error) => {
          this.success = false;
          this.message = error.message;
          this.loading = false;
        }
      });
    }
  }
}
```

### 3. Use in your app

**`src/app/app.component.ts`**
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="max-w-md mx-auto mt-8 p-6">
      <h1 class="text-2xl font-bold mb-6">Email Verification</h1>
      
      <app-send-otp 
        *ngIf="currentStep === 'send'" 
        (otpSent)="onOtpSent($event)">
      </app-send-otp>
      
      <app-verify-otp 
        *ngIf="currentStep === 'verify'" 
        [email]="email" 
        (otpVerified)="onOtpVerified($event)">
      </app-verify-otp>
      
      <div *ngIf="currentStep === 'success'" class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl text-green-600">✓</span>
        </div>
        <h2 class="text-xl font-bold mb-2">Verification Complete!</h2>
        <p class="text-gray-600">Your email has been successfully verified.</p>
      </div>
    </div>
  `
})
export class AppComponent {
  currentStep = 'send';
  email = '';

  onOtpSent(email: string) {
    this.email = email;
    this.currentStep = 'verify';
  }

  onOtpVerified(data: any) {
    console.log('OTP verified successfully!', data);
    this.currentStep = 'success';
  }
}
```

---

## 🟡 Vue.js Integration {#vuejs}

### 1. Create Vue Components

**`src/components/SendOtp.vue`**
```vue
<template>
  <form @submit.prevent="sendOtp" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-2">Email Address</label>
      <input 
        v-model="email"
        type="email" 
        required
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-500': !isValidEmail && email }"
        placeholder="Enter your email"
      />
      <div v-if="!isValidEmail && email" class="text-red-500 text-sm mt-1">
        Please enter a valid email address
      </div>
    </div>
    
    <button 
      type="submit" 
      :disabled="loading || !isValidEmail"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ loading ? 'Sending...' : 'Send OTP' }}
    </button>
    
    <div v-if="message" :class="messageClass" class="p-3 rounded text-sm">
      {{ message }}
    </div>
  </form>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SendOtp',
  props: {
    apiUrl: {
      type: String,
      default: 'http://localhost:3300'
    }
  },
  emits: ['success', 'error'],
  data() {
    return {
      email: '',
      loading: false,
      message: '',
      success: false
    };
  },
  computed: {
    isValidEmail() {
      if (!this.email) return true; // Don't show error for empty email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.email);
    },
    messageClass() {
      return this.success 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800';
    }
  },
  methods: {
    async sendOtp() {
      if (!this.isValidEmail) return;
      
      this.loading = true;
      this.message = '';
      
      try {
        const response = await axios.post(`${this.apiUrl}/sentotp`, {
          email: this.email
        });
        
        this.success = true;
        this.message = response.data.message;
        this.$emit('success', { email: this.email });
        
      } catch (error) {
        this.success = false;
        this.message = error.response?.data?.message || 'Failed to send OTP';
        this.$emit('error', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
```

### 2. Use in your Vue app

**`src/App.vue`**
```vue
<template>
  <div class="max-w-md mx-auto mt-8 p-6">
    <h1 class="text-2xl font-bold mb-6">Email Verification</h1>
    
    <SendOtp 
      v-if="step === 'send'"
      @success="handleOtpSent"
      @error="handleError"
      :api-url="apiUrl"
    />
    
    <VerifyOtp 
      v-if="step === 'verify'"
      :email="email"
      @success="handleOtpVerified"
      @error="handleError"
      :api-url="apiUrl"
    />
    
    <div v-if="step === 'success'" class="text-center">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl text-green-600">✓</span>
      </div>
      <h2 class="text-xl font-bold mb-2">Verification Complete!</h2>
      <p class="text-gray-600">Your email has been successfully verified.</p>
    </div>
  </div>
</template>

<script>
import SendOtp from './components/SendOtp.vue';
import VerifyOtp from './components/VerifyOtp.vue';

export default {
  name: 'App',
  components: {
    SendOtp,
    VerifyOtp
  },
  data() {
    return {
      step: 'send',
      email: '',
      apiUrl: 'http://localhost:3300'
    };
  },
  methods: {
    handleOtpSent(data) {
      this.email = data.email;
      this.step = 'verify';
    },
    handleOtpVerified(data) {
      console.log('OTP verified successfully!', data);
      this.step = 'success';
    },
    handleError(error) {
      console.error('Error:', error);
    }
  }
};
</script>
```

---

## 🟠 Express.js Integration {#expressjs}

### Method 1: Use the Provided Middleware

```javascript
// app.js
import express from 'express';
import { createOtpRoutes, rateLimitMiddleware } from './path/to/server/middleware/otp-middleware.js';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add rate limiting
app.use('/api/otp', rateLimitMiddleware({ 
  maxAttempts: 5, 
  windowMs: 15 * 60 * 1000 
}));

// Add OTP routes
const otpRoutes = createOtpRoutes({
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  otpLength: 6,
  expiryMinutes: 5,
  enableCleanupRoute: process.env.NODE_ENV === 'development'
});

app.use('/api/otp', otpRoutes);

// Your existing routes
app.get('/', (req, res) => {
  res.send('API is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Method 2: Custom Implementation

```javascript
// routes/auth.js
import express from 'express';
import { generateOTP, validateEmail, validateOTP } from '../lib/utils.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// In-memory store (use database in production)
const otpStore = new Map();

// Email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

// Rate limiting map
const rateLimitMap = new Map();

// Rate limiting middleware
const rateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userLimit = rateLimitMap.get(ip);
    
    if (now > userLimit.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userLimit.count >= maxAttempts) {
      return res.status(429).json({
        error: 'Too many attempts. Please try again later.',
        resetTime: new Date(userLimit.resetTime).toISOString()
      });
    }
    
    userLimit.count++;
    next();
  };
};

// Send OTP endpoint
router.post('/send-otp', rateLimit(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store OTP
    otpStore.set(email, { otp, expiresAt });
    
    // Send email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Verification Code</h2>
          <p>Your OTP is: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully', 
      email 
    });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', rateLimit(10, 15 * 60 * 1000), (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.error });
    }
    
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      return res.status(400).json({ error: otpValidation.error });
    }
    
    // Get stored OTP
    const stored = otpStore.get(email);
    if (!stored) {
      return res.status(400).json({ 
        error: 'OTP not found. Please request a new one.' 
      });
    }
    
    // Check expiry
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ 
        error: 'OTP has expired. Please request a new one.' 
      });
    }
    
    // Verify OTP
    if (stored.otp !== otp) {
      return res.status(400).json({ 
        error: 'Invalid OTP. Please try again.' 
      });
    }
    
    // Success - remove OTP
    otpStore.delete(email);
    
    res.json({ 
      success: true, 
      message: 'OTP verified successfully', 
      email 
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Cleanup expired OTPs (optional)
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 60 * 1000); // Run every minute

export default router;
```

**Use the router in your main app:**
```javascript
// app.js
import authRoutes from './routes/auth.js';

app.use('/api/auth', authRoutes);
```

---

## 🟤 Vanilla JavaScript Integration {#vanilla}

For projects without frameworks, create a simple HTML/JS implementation:

**`index.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            max-width: 400px;
            width: 100%;
            margin: 20px;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
            font-size: 24px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #555;
        }
        
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        
        input:focus {
            outline: none;
            border-color: #007bff;
        }
        
        input.error {
            border-color: #dc3545;
        }
        
        button {
            width: 100%;
            padding: 12px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            font-weight: 500;
        }
        
        button:hover:not(:disabled) {
            background: #0056b3;
        }
        
        button:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        
        .message {
            margin-top: 15px;
            padding: 12px;
            border-radius: 6px;
            font-size: 14px;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .hidden {
            display: none;
        }
        
        .otp-input {
            text-align: center;
            font-size: 24px;
            letter-spacing: 8px;
            font-weight: bold;
        }
        
        .back-button {
            background: #6c757d;
            margin-top: 10px;
        }
        
        .back-button:hover {
            background: #5a6268;
        }
        
        .loading {
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Send OTP Form -->
        <div id="send-form">
            <h1>Enter Your Email</h1>
            <form>
                <div class="form-group">
                    <label for="email-input">Email Address</label>
                    <input 
                        type="email" 
                        id="email-input" 
                        placeholder="your@email.com" 
                        required
                    >
                </div>
                <button type="submit" id="send-otp-btn">Send OTP</button>
                <div id="send-message" class="message hidden"></div>
            </form>
        </div>

        <!-- Verify OTP Form -->
        <div id="verify-form" class="hidden">
            <h1>Verify OTP</h1>
            <p id="email-display" style="text-align: center; margin-bottom: 20px; color: #666; font-size: 14px;"></p>
            <form>
                <div class="form-group">
                    <label for="otp-input">Enter 6-digit OTP</label>
                    <input 
                        type="text" 
                        id="otp-input" 
                        maxlength="6" 
                        placeholder="123456" 
                        class="otp-input"
                        pattern="[0-9]{6}"
                        required
                    >
                </div>
                <button type="submit" id="verify-otp-btn">Verify OTP</button>
                <button type="button" id="back-btn" class="back-button">Change Email</button>
                <div id="verify-message" class="message hidden"></div>
            </form>
        </div>

        <!-- Success Screen -->
        <div id="success-screen" class="hidden">
            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; background: #d4edda; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <span style="font-size: 40px; color: #28a745;">✓</span>
                </div>
                <h1 style="color: #28a745; margin-bottom: 10px;">Success!</h1>
                <p style="color: #666; margin-bottom: 30px;">Your email has been verified successfully.</p>
                <button onclick="location.reload()" style="background: #28a745;">Continue</button>
            </div>
        </div>
    </div>

    <script src="otp-client.js"></script>
</body>
</html>
```

**`otp-client.js`**
```javascript
class OTPSystem {
    constructor(apiUrl = 'http://localhost:3300') {
        this.apiUrl = apiUrl;
        this.currentEmail = '';
        this.init();
    }

    init() {
        // Get DOM elements
        this.sendForm = document.getElementById('send-form');
        this.verifyForm = document.getElementById('verify-form');
        this.successScreen = document.getElementById('success-screen');
        
        this.emailInput = document.getElementById('email-input');
        this.otpInput = document.getElementById('otp-input');
        
        this.sendBtn = document.getElementById('send-otp-btn');
        this.verifyBtn = document.getElementById('verify-otp-btn');
        this.backBtn = document.getElementById('back-btn');
        
        this.sendMessage = document.getElementById('send-message');
        this.verifyMessage = document.getElementById('verify-message');
        this.emailDisplay = document.getElementById('email-display');

        // Add event listeners
        this.sendForm.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendOtp();
        });

        this.verifyForm.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyOtp();
        });

        this.backBtn.addEventListener('click', () => {
            this.showSendForm();
        });

        // Auto-format OTP input
        this.otpInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // Email validation on input
        this.emailInput.addEventListener('input', (e) => {
            this.validateEmailInput();
        });
    }

    validateEmailInput() {
        const email = this.emailInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.emailInput.classList.add('error');
            this.sendBtn.disabled = true;
        } else {
            this.emailInput.classList.remove('error');
            this.sendBtn.disabled = !email;
        }
    }

    async sendOtp() {
        const email = this.emailInput.value.trim();
        
        if (!email) {
            this.showMessage(this.sendMessage, 'Please enter your email address', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showMessage(this.sendMessage, 'Please enter a valid email address', 'error');
            return;
        }

        this.setLoading(this.sendBtn, true);
        this.hideMessage(this.sendMessage);

        try {
            const response = await fetch(`${this.apiUrl}/sentotp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            this.currentEmail = email;
            this.showMessage(this.sendMessage, data.message, 'success');
            
            setTimeout(() => {
                this.showVerifyForm();
            }, 1500);

        } catch (error) {
            this.showMessage(this.sendMessage, error.message, 'error');
        } finally {
            this.setLoading(this.sendBtn, false);
        }
    }

    async verifyOtp() {
        const otp = this.otpInput.value.trim();
        
        if (!otp) {
            this.showMessage(this.verifyMessage, 'Please enter the OTP', 'error');
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            this.showMessage(this.verifyMessage, 'Please enter a valid 6-digit OTP', 'error');
            return;
        }

        this.setLoading(this.verifyBtn, true);
        this.hideMessage(this.verifyMessage);

        try {
            const response = await fetch(`${this.apiUrl}/verifyotp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: this.currentEmail, 
                    otp: otp 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify OTP');
            }

            this.showMessage(this.verifyMessage, data.message, 'success');
            
            setTimeout(() => {
                this.showSuccessScreen();
            }, 1500);

        } catch (error) {
            this.showMessage(this.verifyMessage, error.message, 'error');
        } finally {
            this.setLoading(this.verifyBtn, false);
        }
    }

    showSendForm() {
        this.sendForm.classList.remove('hidden');
        this.verifyForm.classList.add('hidden');
        this.successScreen.classList.add('hidden');
        this.emailInput.focus();
        this.clearForm();
    }

    showVerifyForm() {
        this.sendForm.classList.add('hidden');
        this.verifyForm.classList.remove('hidden');
        this.successScreen.classList.add('hidden');
        this.emailDisplay.textContent = `Code sent to ${this.currentEmail}`;
        this.otpInput.focus();
    }

    showSuccessScreen() {
        this.sendForm.classList.add('hidden');
        this.verifyForm.classList.add('hidden');
        this.successScreen.classList.remove('hidden');
    }

    clearForm() {
        this.emailInput.value = '';
        this.otpInput.value = '';
        this.hideMessage(this.sendMessage);
        this.hideMessage(this.verifyMessage);
        this.emailInput.classList.remove('error');
        this.sendBtn.disabled = true;
    }

    showMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.classList.remove('hidden');
    }

    hideMessage(element) {
        element.classList.add('hidden');
    }

    setLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize the OTP system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new OTPSystem();
});
```

---

## 📞 Support & Troubleshooting {#troubleshooting}

### Common Issues

**1. CORS Errors**
```javascript
// Fix CORS in your server
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourapp.com'],
  credentials: true
}));
```

**2. Email Not Sending**
- Check Gmail app password
- Verify 2FA is enabled
- Check environment variables

**3. Rate Limiting Issues**
```javascript
// Adjust rate limits in middleware
rateLimitMiddleware({ 
  maxAttempts: 10,  // Increase if needed
  windowMs: 15 * 60 * 1000 
})
```

**4. OTP Expiry**
```javascript
// Adjust expiry time
const otpRoutes = createOtpRoutes({
  expiryMinutes: 10  // Increase to 10 minutes
});
```

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=true
```

---

## 📞 Support

### 🔒 Security Issues
Email: **[ashishchaurasiya128@gmail.com](mailto:ashishchaurasiya128@gmail.com)**

### 🐛 Bug Reports
Use GitHub Issues for non-security related problems.

---

**Created with ❤️ by [Ashish Chaurasiya](mailto:ashishchaurasiya128@gmail.com)**
