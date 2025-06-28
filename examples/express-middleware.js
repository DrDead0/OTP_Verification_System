
import express from 'express';
import { otpMiddleware, createOtpRoutes } from '../server/middleware/otp-middleware.js';

const app = express();


app.use('/auth', otpMiddleware({
  emailConfig: {
    service: 'gmail',
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  otpConfig: {
    length: 6,
    expiryMinutes: 5
  },
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000 
  }
}));


app.post('/api/login/send-otp', async (req, res) => {
  const { email } = req.body;
  
  try {
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    
    const otpResult = await req.sendOtp(email);
    
    if (otpResult.success) {
      
      await LoginAttempt.create({
        userId: user.id,
        type: 'otp_sent',
        ip: req.ip,
        timestamp: new Date()
      });
      
      res.json(otpResult);
    } else {
      res.status(400).json(otpResult);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/login/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    
    const verifyResult = await req.verifyOtp(email, otp);
    
    if (verifyResult.success) {
      
      const user = await User.findOne({ email });
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      
      await LoginAttempt.create({
        userId: user.id,
        type: 'login_success',
        ip: req.ip,
        timestamp: new Date()
      });
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      });
    } else {
      res.status(400).json(verifyResult);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


app.post('/api/forgot-password/send-otp', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      
      return res.json({
        success: true,
        message: 'If this email exists, you will receive an OTP'
      });
    }
    
    const otpResult = await req.sendOtp(email);
    res.json({
      success: true,
      message: 'If this email exists, you will receive an OTP'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/forgot-password/verify-and-reset', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  try {
    const verifyResult = await req.verifyOtp(email, otp);
    
    if (verifyResult.success) {
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      
      await User.updateOne(
        { email },
        { password: hashedPassword }
      );
      
      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } else {
      res.status(400).json(verifyResult);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


app.post('/api/enable-2fa', authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    const otpResult = await req.sendOtp(user.email);
    
    if (otpResult.success) {
      res.json({
        success: true,
        message: 'OTP sent to your email for 2FA setup'
      });
    } else {
      res.status(400).json(otpResult);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/confirm-2fa', authenticateUser, async (req, res) => {
  const { otp } = req.body;
  const user = req.user;
  
  try {
    const verifyResult = await req.verifyOtp(user.email, otp);
    
    if (verifyResult.success) {
      
      await User.updateOne(
        { _id: user.id },
        { twoFactorEnabled: true }
      );
      
      res.json({
        success: true,
        message: '2FA enabled successfully'
      });
    } else {
      res.status(400).json(verifyResult);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
