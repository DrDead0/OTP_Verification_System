import { configDotenv } from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
const app = express();
configDotenv();
app.use(bodyParser.json());

const otpStore = new Map()
const randomOTP = ()=>{
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

// console.log(randomOTP());
app.post('/sentotp', async (res, req) => {
    const {email} = req.body;
    if(!email){
        return res.status(400).json({success:false, message:"Email is required..!"});
    }
    const otp = randomOTP();

    const expireAt = Date.now()+5*60*1000 // 5 minutes from now
    otpStore.set(email, {otp, expireAt});
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Hello,</h2>
                <p>Your One-Time Password (OTP) is:</p>
                <div style="font-size: 2em; font-weight: bold; color: #2d8cf0; margin: 16px 0;">
                    ${otp}
                </div>
                <p>This OTP is valid for <strong>5 minutes</strong>.</p>
                <p style="color: #b00;">Do not share this code with anyone.</p>
                <hr>
                <small>If you did not request this code, please ignore this email.</small>
            </div>
            `,
            text: `Hello,

                    Your One-Time Password (OTP) is: ${otp}

                    OTP is valid for 5 minutes.

                    don't share this code with anyone.

                    did not request this code, please ignore this email.`
    };

    try{
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        return res.status(200).json({success:true, message:"OTP sent successfully..!"});
    }catch(error){
        res.status(500).json({success:false, message:"Failed to send OTP. Please try again later."});
        console.error("Error sending OTP:", error);
    }
});


app.post('/verifyotp', (req, res) => {
    const {email, otp} = req.body;
    if(!email || !otp){
        return res.status(400).json({success:false, message:"Email and OTP are required..!"});
    } 

    if(!/^\d{6}$/.test(otp)){
        return res.status(400).json({success:false, message:"Invalid OTP format. OTP must be 6 digits."});
    }

    const storeData = otpStore.get(email);
    if(!storeData){
        return res.status(400).json({success:false, message:"OTP not found for this email. Please request a new OTP."});
    }
    const {otp: storedOtp, expireAt} = storeData;
    if(Date.now() > expireAt){
        otpStore.delete(email);
        return res.status(400).json({success:false, message:"OTP has expired. Please request a new OTP."});
    }
    if(otpStore === otp){
        otpStore.delete(email);
        return res.status(200).json({success:true, message:"OTP verified successfully..!"});
    }else{
        return res.status(400).json({success:false, message:"Invalid OTP. Please try again."});
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});