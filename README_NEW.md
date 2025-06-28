# 🔐 OTP Verification System

A complete, production-ready **One-Time Password (OTP) verification system** with React components and Express.js backend. Built for easy integration into any web application, framework, or project.

**Created by: [Ashish Chaurasiya](mailto:ashishchaurasiya128@gmail.com)**

---

## 🚀 Features

✅ **Email-based OTP verification**  
✅ **Ready-to-use React components**  
✅ **Express.js middleware & API**  
✅ **Multi-framework support** (Next.js, Angular, Vue, etc.)  
✅ **TypeScript support**  
✅ **Customizable UI & styling**  
✅ **Rate limiting & security**  
✅ **Production-ready**  
✅ **Easy integration**  

---

## 📦 Project Structure

```
OTP_Verification_System/
├── 📁 client/                    # React component library
│   ├── src/
│   │   ├── components/
│   │   │   ├── SendOtp.jsx       # Email input & OTP sending
│   │   │   └── VerifyOtp.jsx     # OTP verification component
│   │   └── index.js              # Main exports
│   └── package.json
├── 📁 server/                    # Express.js backend
│   ├── middleware/
│   │   └── otp-middleware.js     # Reusable middleware
│   ├── index.js                  # Main server
│   └── package.json
├── 📁 lib/                       # Shared utilities
│   ├── utils.js                  # Helper functions
│   └── types.js                  # Constants & types
├── 📁 examples/                  # Integration examples
│   ├── nextjs-integration.js     # Next.js example
│   ├── express-middleware.js     # Express example
│   └── react-customization.jsx   # React examples
├── 📄 types.d.ts                 # TypeScript definitions
├── 📄 INTEGRATION.md              # Detailed integration guide
├── 📄 SECURITY.md                 # Security guidelines
└── 📄 README.md                   # This file
```

---

## ⚡ Quick Start

### 🎯 Option 1: Use as Standalone Server

1. **Clone the repository**
```bash
git clone <repository-url>
cd OTP_Verification_System
```

2. **Setup Environment Variables**
```bash
# Create .env file in server directory
cd server
cp .env.example .env
```

3. **Configure Email Settings** (in `server/.env`)
```env
EMAIL=your-email@gmail.com
PASSWORD=your-app-password
NODE_ENV=production
```

4. **Install Dependencies & Start Server**
```bash
# Install server dependencies
cd server
npm install
# or
pnpm install

# Start the server
npm start
# Server runs on http://localhost:3300
```

### 🎯 Option 2: Use as Component Library

1. **Install the client package**
```bash
npm install ./client
# or copy the client folder to your project
```

2. **Import & Use React Components**
```jsx
import { SendOtp, VerifyOtp } from './client/src';

function MyApp() {
  const [step, setStep] = useState('send');
  const [email, setEmail] = useState('');

  return (
    <div>
      {step === 'send' && (
        <SendOtp
          onSuccess={(data) => {
            setEmail(data.email);
            setStep('verify');
          }}
          apiUrl="http://localhost:3300"
        />
      )}
      
      {step === 'verify' && (
        <VerifyOtp
          email={email}
          onSuccess={(data) => {
            console.log('Verified!', data);
          }}
          apiUrl="http://localhost:3300"
        />
      )}
    </div>
  );
}
```

---

## 🔧 Framework Integration Guide

### 🟢 **Next.js Integration**

#### Method 1: API Routes + Components

1. **Install components in your Next.js project:**
```bash
# Copy client folder to your project
cp -r ./client ./your-nextjs-app/components/otp-system
```

2. **Create API routes** (`pages/api/auth/` or `app/api/auth/`):

**`pages/api/auth/send-otp.js`** (Pages Router)
```javascript
import { createOtpRoutes } from '../../../path/to/server/middleware/otp-middleware.js';

const otpRoutes = createOtpRoutes({
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Use the OTP middleware logic
    return otpRoutes(req, res);
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
```

**`app/api/auth/send-otp/route.js`** (App Router)
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
    // For demo, using memory store
    global.otpStore = global.otpStore || {};
    global.otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
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
      html: `Your OTP is: <strong>${otp}</strong>`
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

3. **Use in your Next.js pages:**
```jsx
// pages/auth.js or app/auth/page.js
import { useState } from 'react';
import { SendOtp, VerifyOtp } from '../components/otp-system/src';

export default function AuthPage() {
  const [step, setStep] = useState('send');
  const [email, setEmail] = useState('');

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Email Verification</h1>
      
      {step === 'send' && (
        <SendOtp
          apiUrl="/api/auth/send-otp"
          onSuccess={(data) => {
            setEmail(data.email);
            setStep('verify');
          }}
        />
      )}
      
      {step === 'verify' && (
        <VerifyOtp
          email={email}
          apiUrl="/api/auth/verify-otp"
          onSuccess={(data) => {
            router.push('/dashboard');
          }}
        />
      )}
    </div>
  );
}
```

#### Method 2: External Server

Simply run the OTP server separately and connect to it:

```jsx
<SendOtp apiUrl="http://localhost:3300" />
<VerifyOtp apiUrl="http://localhost:3300" />
```

---

### 🔵 **Angular Integration**

1. **Create Angular Services:**

**`otp.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OtpResponse {
  success: boolean;
  message: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private apiUrl = 'http://localhost:3300'; // or your API URL

  constructor(private http: HttpClient) {}

  sendOtp(email: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.apiUrl}/sentotp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.apiUrl}/verifyotp`, { email, otp });
  }
}
```

2. **Create Angular Components:**

**`send-otp.component.ts`**
```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OtpService } from './otp.service';

@Component({
  selector: 'app-send-otp',
  template: `
    <form [formGroup]="otpForm" (ngSubmit)="sendOtp()">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Email Address</label>
        <input 
          type="email" 
          formControlName="email"
          class="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter your email"
        />
        <div *ngIf="otpForm.get('email')?.errors?.['required'] && otpForm.get('email')?.touched" 
             class="text-red-500 text-sm mt-1">
          Email is required
        </div>
      </div>
      
      <button 
        type="submit" 
        [disabled]="otpForm.invalid || loading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {{ loading ? 'Sending...' : 'Send OTP' }}
      </button>
      
      <div *ngIf="message" class="mt-4 p-3 rounded" 
           [class.bg-green-100]="success" 
           [class.bg-red-100]="!success">
        {{ message }}
      </div>
    </form>
  `
})
export class SendOtpComponent {
  otpForm: FormGroup;
  loading = false;
  message = '';
  success = false;

  constructor(private fb: FormBuilder, private otpService: OtpService) {
    this.otpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendOtp() {
    if (this.otpForm.valid) {
      this.loading = true;
      const email = this.otpForm.value.email;
      
      this.otpService.sendOtp(email).subscribe({
        next: (response) => {
          this.success = true;
          this.message = response.message;
          this.loading = false;
          // Emit success event or navigate
        },
        error: (error) => {
          this.success = false;
          this.message = error.error.message || 'Failed to send OTP';
          this.loading = false;
        }
      });
    }
  }
}
```

3. **Use in your app:**
```typescript
// app.component.ts
export class AppComponent {
  currentStep = 'send';
  email = '';

  onOtpSent(email: string) {
    this.email = email;
    this.currentStep = 'verify';
  }

  onOtpVerified() {
    // Handle successful verification
    console.log('OTP verified successfully!');
  }
}
```

---

### 🟡 **Vue.js Integration**

1. **Create Vue Components:**

**`SendOtp.vue`**
```vue
<template>
  <form @submit.prevent="sendOtp" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-2">Email Address</label>
      <input 
        v-model="email"
        type="email" 
        required
        class="w-full px-3 py-2 border rounded-lg"
        placeholder="Enter your email"
      />
    </div>
    
    <button 
      type="submit" 
      :disabled="loading || !isValidEmail"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {{ loading ? 'Sending...' : 'Send OTP' }}
    </button>
    
    <div v-if="message" :class="messageClass" class="p-3 rounded">
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.email);
    },
    messageClass() {
      return this.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

2. **Use in your Vue app:**
```vue
<template>
  <div class="max-w-md mx-auto mt-8">
    <h1 class="text-2xl font-bold mb-6">Email Verification</h1>
    
    <SendOtp 
      v-if="step === 'send'"
      @success="handleOtpSent"
      :api-url="apiUrl"
    />
    
    <VerifyOtp 
      v-if="step === 'verify'"
      :email="email"
      @success="handleOtpVerified"
      :api-url="apiUrl"
    />
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
      // Redirect or show success page
    }
  }
};
</script>
```

---

### 🟠 **Express.js Middleware Integration**

For integrating into existing Express.js applications:

**Method 1: Use the provided middleware**
```javascript
// app.js
import express from 'express';
import { createOtpRoutes, rateLimitMiddleware } from './path/to/server/middleware/otp-middleware.js';

const app = express();

// Add rate limiting
app.use('/api/otp', rateLimitMiddleware({ maxAttempts: 5, windowMs: 15 * 60 * 1000 }));

// Add OTP routes
const otpRoutes = createOtpRoutes({
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  otpLength: 6,
  expiryMinutes: 5
});

app.use('/api/otp', otpRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**Method 2: Custom integration**
```javascript
// routes/auth.js
import express from 'express';
import { generateOTP, validateEmail } from '../path/to/lib/utils.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// In-memory store (use database in production)
const otpStore = new Map();

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, { otp, expiresAt });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`
    });

    res.json({ success: true, message: 'OTP sent successfully', email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const stored = otpStore.get(email);
    if (!stored) {
      return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    otpStore.delete(email);
    res.json({ success: true, message: 'OTP verified successfully', email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

export default router;
```

---

### 🟤 **Vanilla JavaScript Integration**

For projects without frameworks:

**`otp-client.js`**
```javascript
class OTPSystem {
  constructor(apiUrl = 'http://localhost:3300') {
    this.apiUrl = apiUrl;
  }

  async sendOtp(email) {
    const response = await fetch(`${this.apiUrl}/sentotp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }

    return await response.json();
  }

  async verifyOtp(email, otp) {
    const response = await fetch(`${this.apiUrl}/verifyotp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify OTP');
    }

    return await response.json();
  }
}

// Usage
const otpSystem = new OTPSystem();
let currentEmail = '';

document.getElementById('send-otp-btn').addEventListener('click', async () => {
  const email = document.getElementById('email-input').value;
  
  try {
    const result = await otpSystem.sendOtp(email);
    currentEmail = email;
    document.getElementById('send-form').style.display = 'none';
    document.getElementById('verify-form').style.display = 'block';
    alert(result.message);
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('verify-otp-btn').addEventListener('click', async () => {
  const otp = document.getElementById('otp-input').value;
  
  try {
    const result = await otpSystem.verifyOtp(currentEmail, otp);
    alert('OTP verified successfully!');
    // Redirect or show success
  } catch (error) {
    alert(error.message);
  }
});
```

**`index.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        .container { max-width: 400px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <div id="send-form">
            <h2>Enter Your Email</h2>
            <div class="form-group">
                <label for="email-input">Email Address:</label>
                <input type="email" id="email-input" placeholder="your@email.com" required>
            </div>
            <button id="send-otp-btn">Send OTP</button>
        </div>

        <div id="verify-form" class="hidden">
            <h2>Verify OTP</h2>
            <div class="form-group">
                <label for="otp-input">Enter 6-digit OTP:</label>
                <input type="text" id="otp-input" maxlength="6" placeholder="123456" required>
            </div>
            <button id="verify-otp-btn">Verify OTP</button>
        </div>
    </div>

    <script src="otp-client.js"></script>
</body>
</html>
```

---

### 🔧 **PHP Integration** (Backend API consumption)

**`OTPClient.php`**
```php
<?php
class OTPClient {
    private $apiUrl;

    public function __construct($apiUrl = 'http://localhost:3300') {
        $this->apiUrl = $apiUrl;
    }

    public function sendOtp($email) {
        $data = json_encode(['email' => $email]);
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => $data
            ]
        ]);

        $response = file_get_contents($this->apiUrl . '/sentotp', false, $context);
        
        if ($response === FALSE) {
            throw new Exception('Failed to send OTP');
        }

        return json_decode($response, true);
    }

    public function verifyOtp($email, $otp) {
        $data = json_encode(['email' => $email, 'otp' => $otp]);
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => $data
            ]
        ]);

        $response = file_get_contents($this->apiUrl . '/verifyotp', false, $context);
        
        if ($response === FALSE) {
            throw new Exception('Failed to verify OTP');
        }

        return json_decode($response, true);
    }
}

// Usage
try {
    $otpClient = new OTPClient();
    
    if ($_POST['action'] === 'send') {
        $result = $otpClient->sendOtp($_POST['email']);
        echo json_encode($result);
    } elseif ($_POST['action'] === 'verify') {
        $result = $otpClient->verifyOtp($_POST['email'], $_POST['otp']);
        echo json_encode($result);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
```

---

### 🐍 **Python Integration** (Django/Flask)

**Django Example:**

**`otp_client.py`**
```python
import requests
import json

class OTPClient:
    def __init__(self, api_url='http://localhost:3300'):
        self.api_url = api_url

    def send_otp(self, email):
        response = requests.post(
            f'{self.api_url}/sentotp',
            json={'email': email},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code != 200:
            raise Exception(response.json().get('message', 'Failed to send OTP'))
        
        return response.json()

    def verify_otp(self, email, otp):
        response = requests.post(
            f'{self.api_url}/verifyotp',
            json={'email': email, 'otp': otp},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code != 200:
            raise Exception(response.json().get('message', 'Failed to verify OTP'))
        
        return response.json()
```

**`views.py` (Django)**
```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .otp_client import OTPClient

otp_client = OTPClient()

@csrf_exempt
@require_http_methods(["POST"])
def send_otp(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        result = otp_client.send_otp(email)
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def verify_otp(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')
        
        result = otp_client.verify_otp(email, otp)
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
```

---

## 🔐 Environment Configuration

### Required Environment Variables

Create a `.env` file in the `server` directory:

```env
# Email Configuration
EMAIL=your-email@gmail.com
PASSWORD=your-app-specific-password

# Server Configuration  
NODE_ENV=production
PORT=3300

# Optional: Database URL (for persistent OTP storage)
DATABASE_URL=your-database-url

# Optional: Redis URL (for OTP caching)
REDIS_URL=your-redis-url
```

### Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in your `.env` file

### Other Email Providers

**Outlook/Hotmail:**
```env
EMAIL=your-email@outlook.com
PASSWORD=your-password
EMAIL_SERVICE=outlook
```

**Custom SMTP:**
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
EMAIL_SECURE=true
```

---

## 🎨 Customization Guide

### Styling the React Components

The components accept `className` props for custom styling:

```jsx
<SendOtp 
  className="my-custom-send-form"
  buttonClassName="my-custom-button"
  inputClassName="my-custom-input"
/>

<VerifyOtp 
  className="my-custom-verify-form"
  theme={{
    primaryColor: '#3B82F6',
    borderRadius: '8px',
    spacing: '1rem'
  }}
/>
```

### Custom Email Templates

Modify the email template in `server/middleware/otp-middleware.js`:

```javascript
const emailHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Your Verification Code</h2>
    <p>Your OTP is: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
    <p>This code will expire in 5 minutes.</p>
    <p>If you didn't request this code, please ignore this email.</p>
  </div>
`;
```

### API Response Customization

Modify responses in `lib/utils.js`:

```javascript
export const createResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
    // Add your custom fields
    version: '1.0.0'
  };
};
```

---

## 🚀 Production Deployment

### Environment Setup

1. **Use a production database** instead of memory storage
2. **Set up Redis** for OTP caching (optional)
3. **Configure proper CORS** settings
4. **Enable HTTPS** in production
5. **Set up monitoring** and logging

### Docker Deployment

**`Dockerfile`**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm install --production

COPY server/ .
COPY lib/ ./lib/

EXPOSE 3300

CMD ["npm", "start"]
```

**`docker-compose.yml`**
```yaml
version: '3.8'

services:
  otp-server:
    build: .
    ports:
      - "3300:3300"
    environment:
      - EMAIL=${EMAIL}
      - PASSWORD=${PASSWORD}
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/otp {
        proxy_pass http://localhost:3300;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔧 API Reference

### Send OTP Endpoint

**`POST /sentotp`**

Request:
```json
{
  "email": "user@example.com"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "email": "user@example.com"
}
```

Response (Error):
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

### Verify OTP Endpoint

**`POST /verifyotp`**

Request:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "email": "user@example.com"
}
```

Response (Error):
```json
{
  "success": false,
  "error": "Invalid OTP"
}
```

---

## 🛡️ Security Best Practices

1. **Rate Limiting**: Implement proper rate limiting (included)
2. **HTTPS Only**: Always use HTTPS in production
3. **Environment Variables**: Never commit sensitive data
4. **OTP Expiry**: Keep OTP expiry time reasonable (5-10 minutes)
5. **Input Validation**: Always validate inputs on both client and server
6. **Secure Headers**: Add security headers to your server
7. **Database Storage**: Use database instead of memory for production

---

## 🐛 Troubleshooting

### Common Issues

**1. Email not sending**
- Check email credentials in `.env`
- Verify Gmail app password is correct
- Check if 2FA is enabled on Gmail account

**2. CORS errors**
- Ensure CORS is properly configured
- Check if frontend URL is allowed in CORS settings

**3. OTP expiry**
- Default expiry is 5 minutes
- Check server time synchronization

**4. Port conflicts**
- Default port is 3300
- Change PORT in `.env` if needed

### Debug Mode

Enable debug mode by setting:
```env
NODE_ENV=development
DEBUG=true
```

---

## 📞 Support & Contributing

### 🔒 Security Issues
If you discover any **security vulnerabilities**, please email **[ashishchaurasiya128@gmail.com](mailto:ashishchaurasiya128@gmail.com)** directly. 

**⚠️ DO NOT report security issues through GitHub issues for safety reasons.**

### 🐛 Bug Reports & Feature Requests
For non-security related issues, please use [GitHub Issues](https://github.com/your-repo/issues).

### 👨‍💻 Author
**Ashish Chaurasiya**
- Email: [ashishchaurasiya128@gmail.com](mailto:ashishchaurasiya128@gmail.com)
- GitHub: [@ashishchaurasiya](https://github.com/ashishchaurasiya)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⭐ Show Your Support

If this project helped you, please consider giving it a ⭐ on GitHub!

---

**Built with ❤️ by [Ashish Chaurasiya](mailto:ashishchaurasiya128@gmail.com)**
