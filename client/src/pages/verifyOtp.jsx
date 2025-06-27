import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyOtp = ({
  label = "OTP",
  placeholder = "Enter the OTP you received",
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('otp_email') || "";
  const navigate = useNavigate();

  console.log("Email being used for verification:", email);
  console.log("Email for validation:", JSON.stringify(email), "Length:", email.length);

  if (!email) {
    setTimeout(() => navigate('/'), 100); // Redirect to send OTP page
    return (
      <div className="flex items-center justify-center h-screen bg-gray-700">
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-red-500">No email found. Please request a new OTP.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }
    if (!email) {
      setError("No email found. Please request a new OTP.");
      return;
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const trimmedEmail = email.trim();
    console.log("Email for validation:", JSON.stringify(trimmedEmail), "Length:", trimmedEmail.length);
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3300/verifyotp", { email: email, otp: otp });
      if (res.data.success) {
        setSuccess("OTP verified successfully!");
        setOtp("");
        localStorage.removeItem('otp_email');
      } else {
        setError(res.data.message || "Failed to verify OTP. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 bg-gray-700 h-screen">
      <div className="max-w-md w-full p-8 rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105 bg-white">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">Verify OTP</h2>
        <p className="mb-2 text-gray-600 text-center">Verifying for: <strong>{email}</strong></p>
        <p className="mb-6 text-gray-500 text-center">Enter the OTP sent to your device to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-gray-700 font-medium mb-1" htmlFor="otp-verify-input">{label}</label>
          <input
            id="otp-verify-input"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
            value={otp}
            onChange={e => setOtp(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;