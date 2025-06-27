# OTP Verification System 📧🔐

A complete, production-ready OTP (One-Time Password) verification system with React frontend components and Express.js backend API. Designed to be easily integrated into any project.

## 🚀 Features

- **Email-based OTP verification**
- **React components ready for integration**
- **Express.js API endpoints**
- **Configurable and customizable**
- **Modern UI with Tailwind CSS**
- **TypeScript support ready**
- **Integration-friendly design**

## 📦 Package Structure

```
OTP_Verification_System/
├── client/                 # React frontend components
│   ├── src/
│   │   ├── components/     # Reusable OTP components
│   │   └── pages/         # Page components
├── server/                # Express.js backend API
├── lib/                   # Shared utilities and types
└── examples/              # Integration examples
```

## 🛠️ Quick Start

### Backend Setup

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Configure environment:**
```bash
# Create .env file
PORT=3300
EMAIL=your-email@gmail.com
PASSWORD=your-app-password
```

3. **Start server:**
```bash
npm run dev
```

### Frontend Integration

1. **Install React components:**
```bash
cd client
npm install
```

2. **Import and use components:**
```jsx
import { SendOtp, VerifyOtp } from './path/to/otp-components';

// In your app
<SendOtp 
  apiUrl="http://localhost:3300/sentotp"
  onSuccess={(data) => console.log('OTP sent:', data)}
  onError={(error) => console.log('Error:', error)}
/>
```

## 🔧 Integration Guide

### As a React Component Library

```jsx
import { OtpProvider, SendOtp, VerifyOtp } from 'otp-verification-system';

function App() {
  return (
    <OtpProvider config={{ apiBaseUrl: 'http://localhost:3300' }}>
      <SendOtp />
      <VerifyOtp />
    </OtpProvider>
  );
}
```

### As an Express.js Middleware

```javascript
import { otpMiddleware } from 'otp-verification-system/server';

app.use('/auth', otpMiddleware({
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
}));
```

## 📚 API Documentation

### POST /sentotp
Send OTP to email address.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully!",
  "data": {
    "email": "user@example.com"
  }
}
```

### POST /verifyotp
Verify OTP for email address.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully!",
  "data": {
    "email": "user@example.com"
  }
}
```

## 🎨 Customization

### Styling
- Built with Tailwind CSS
- Fully customizable themes
- CSS-in-JS support
- Custom component styling

### Configuration
```javascript
const config = {
  otpLength: 6,
  expiry: 5, // minutes
  emailTemplate: 'custom',
  apiEndpoints: {
    send: '/custom/send',
    verify: '/custom/verify'
  }
};
```

## 🔒 Security Features

- ✅ OTP expiration (5 minutes)
- ✅ Rate limiting ready
- ✅ Email validation
- ✅ Secure OTP generation
- ✅ CORS configuration
- ✅ Environment variable protection

## 🚀 Production Deployment

### Backend
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend
```bash
# Build React components
npm run build

# Publish to npm
npm publish
```

## 📖 Examples

See the `/examples` directory for:
- Next.js integration
- Express.js middleware usage
- React component customization
- TypeScript implementation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 💡 Use Cases

- **Authentication systems**
- **User registration flows**
- **Password reset functionality**
- **Two-factor authentication**
- **Email verification**
- **Secure transactions**

## 🆘 Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📚 Docs: [Documentation Site](https://docs.example.com)