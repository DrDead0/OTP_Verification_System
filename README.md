# 🔐 OTP Verification System

A modern, production-ready **One-Time Password (OTP) verification system** with React components and Express.js backend. Designed for seamless integration into any web application or framework.

> **Author:** [Ashish Chaurasiya](mailto:ashishchaurasiya128@gmail.com) | **Organization:** Zeroaxiis

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen)]()

---

## ✨ Features

- 📧 **Email-based OTP verification** with secure 6-digit codes
- ⚛️ **Ready-to-use React components** for instant integration
- 🚀 **Express.js API & middleware** for backend implementation
- 🔧 **Multi-framework support** (Next.js, Angular, Vue, PHP, Python, etc.)
- 🛡️ **Built-in security** with rate limiting, validation, and expiry
- 🎨 **Customizable UI & styling** to match your design
- 📱 **Responsive design** for all devices
- 🔒 **Production-ready** and battle-tested

---

## 📦 Project Structure

```
OTP_Verification_System/
├── client/                 # React Components
│   ├── SendOtp.jsx        # Email input & OTP sending
│   └── VerifyOtp.jsx      # OTP verification component
├── server/                # Express.js Backend
│   ├── index.js          # Main server
│   └── middleware/       # Reusable middleware
├── lib/                  # Shared utilities
├── examples/             # Integration examples
├── INTEGRATION.md        # Detailed framework guide
└── SECURITY.md          # Security guidelines
```

## 🚀 Quick Start

### Option 1: Standalone Server

```bash
# 1. Clone repository
git clone <repository-url>
cd OTP_Verification_System

# 2. Setup server
cd server
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your email credentials

# 4. Start server
npm start
# Server runs on http://localhost:3300
```

### Option 2: React Components

```jsx
import { SendOtp, VerifyOtp } from './client/src';

function App() {
  const [step, setStep] = useState('send');
  const [email, setEmail] = useState('');

  return (
    <>
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
          onSuccess={() => console.log('Verified!')}
          apiUrl="http://localhost:3300"
        />
      )}
    </>
  );
}
```

---

## 🔧 Framework Integration

### Next.js
```jsx
// pages/auth.js
import { SendOtp, VerifyOtp } from '../components/otp';

export default function Auth() {
  // Implementation here
}
```

### Angular
```typescript
// otp.service.ts
@Injectable()
export class OtpService {
  sendOtp(email: string) {
    return this.http.post('/api/sentotp', { email });
  }
}
```

### Vue.js
```vue
<template>
  <SendOtp @success="handleSuccess" />
</template>
```

### Express.js Middleware
```javascript
import { createOtpRoutes } from './middleware/otp-middleware.js';

app.use('/api', createOtpRoutes({
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
}));
```

**📖 For complete integration guides:** [View INTEGRATION.md](INTEGRATION.md)

---

## 📋 API Reference

### Send OTP
```http
POST /sentotp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "email": "user@example.com"
}
```

### Verify OTP
```http
POST /verifyotp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "email": "user@example.com"
}
```

---

## ⚙️ Configuration

### Email Setup (Gmail)
1. **Enable 2FA** on your Google account
2. **Generate App Password:**
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" → Generate password
3. **Configure environment:**

```env
EMAIL=your-email@gmail.com
PASSWORD=generated-app-password
NODE_ENV=production
PORT=3300
```

### Component Customization
```jsx
<SendOtp
  placeholder="Enter your email address"
  buttonText="Send Verification Code"
  className="custom-send-otp"
  onSuccess={(data) => console.log(data)}
  onError={(error) => console.error(error)}
/>

<VerifyOtp
  email="user@example.com"
  otpLength={6}
  autoSubmit={true}
  className="custom-verify-otp"
  onSuccess={(data) => console.log(data)}
/>
```

---

## 🚀 Production Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/ .
RUN npm install --production
EXPOSE 3300
CMD ["npm", "start"]
```

### Environment Variables
```env
NODE_ENV=production
EMAIL=production-email@domain.com
PASSWORD=production-app-password
PORT=3300
CORS_ORIGIN=https://yourdomain.com
```

---

## �️ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Email not sending** | Verify Gmail app password and 2FA |
| **CORS errors** | Configure CORS_ORIGIN in environment |
| **Port conflicts** | Change PORT in `.env` file |
| **OTP expired** | Default expiry is 5 minutes |
| **Rate limiting** | Wait 15 minutes or adjust limits |

### Debug Mode
```env
NODE_ENV=development
DEBUG=true
```

---

## 🔒 Security

This system includes:
- ✅ **Rate limiting** (5 attempts per 15 minutes)
- ✅ **OTP expiry** (5 minutes default)
- ✅ **Email validation** and sanitization
- ✅ **CORS protection**
- ✅ **Input validation** on all endpoints

**Report security issues privately:** [ashishchaurasiya128@gmail.com](mailto:ashishchaurasiya128@gmail.com)

---

## 📞 Support & Contact

### 🔒 Security Issues
**Email:** [ashishchaurasiya128@gmail.com](mailto:ashishchaurasiya128@gmail.com)  
⚠️ **Do NOT report security issues publicly**

### 🐛 Bug Reports & Feature Requests
Create an issue on GitHub: [Report Here](https://github.com/zeroaxiis/OTP_Verification_System/issues)

---

## 👨‍💻 Contributors

**Author:** [Ashish Chaurasiya](mailto:ashishchaurasiya128@gmail.com)  
**Organization:** [Zeroaxiis](https://github.com/zeroaxiis)  
**Contributors:** DarkDeity666  

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## ⭐ Show Your Support

If this project helped you, please ⭐ **star this repository** on GitHub!

**Built with ❤️ by [Ashish Chaurasiya](mailto:ashishchaurasiya128@gmail.com)**
