// Integration-friendly SendOtp component
// Props:
// - apiUrl: string (API endpoint for sending OTP)
// - onSuccess: function (called with response data on success)
// - onError: function (called with error data on error)
// - label, placeholder: UI customization
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SendOtp = ({
  apiUrl = "http://localhost:3300/sentotp",
  onSuccess = () => {},
  onError = () => {},
  label = "Email",
  placeholder = "Enter your email address",
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!input.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(apiUrl, { email: input });
      if (res.data.success) {
        setSuccess(res.data.message || "OTP sent successfully!");
        setInput("");
        localStorage.setItem('otp_email', input);
        onSuccess(res.data);
        navigate("/verifyotp", { state: { email: input } });
      } else {
        setError(res.data.message || "Failed to send OTP. Please try again.");
        onError(res.data);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP. Please try again."
      );
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 bg-gray-700 h-screen">
      <div className="max-w-md w-full p-8 rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105 bg-white">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">Send OTP</h2>
        <p className="mb-6 text-gray-500 text-center">
          Enter your {label.toLowerCase()} to receive a one-time password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-gray-700 font-medium mb-1" htmlFor="otp-input">
            {label}
          </label>
          <input
            id="otp-input"
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
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
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendOtp;