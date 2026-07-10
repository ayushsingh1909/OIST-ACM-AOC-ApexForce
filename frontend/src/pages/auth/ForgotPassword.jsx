import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch (err) {
      console.error("Forgot password request failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-10 bg-[#FFFFFF] border border-black/10 relative overflow-hidden">
        {!isSent ? (
          <>
            <div className="text-center mb-10">
              <h2 className="text-5xl font-bold tracking-tighter text-[#000000]">
                Forgot Password
              </h2>
              <p className="mt-4 text-xs font-sans text-[#000000] tracking-wide">
                Enter your email address to receive a secure recovery link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-[#000000] uppercase tracking-widest mb-2 font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#000000]">
                    <FiMail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border text-[#000000] text-sm placeholder-[#000000]/30 focus:outline-none transition-all ${
                      error ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-black/20 focus:border-black focus:ring-1 focus:ring-black"
                    }`}
                  />
                </div>
                {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-4 bg-[#000000] hover:bg-[#000000]/80 text-white font-bold transition-all duration-300 disabled:opacity-50 font-sans tracking-wide text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                    Sending link...
                  </span>
                ) : (
                  "Send Recovery Link"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 font-sans">
            <div className="flex justify-center mb-4">
              <FiCheckCircle className="w-16 h-16 text-black" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#000000] mb-2">Check Your Email</h2>
            <p className="text-sm text-[#000000] mb-6">
              If an account matches <span className="font-bold underline decoration-1 underline-offset-2 text-[#000000]">{email}</span>, we have sent a secure password reset link to your inbox.
            </p>
            <p className="text-xs text-[#000000]/70 mb-6 border border-black/10 p-3">
              Note: During development, if SMTP credentials are not configured, you can copy the recovery link directly from the backend node console logs!
            </p>
            <button
              onClick={() => setIsSent(false)}
              className="px-6 py-3 border border-black hover:bg-black/5 text-[#000000] font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              Resend Link
            </button>
          </div>
        )}

        <div className="mt-8 text-center font-sans">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-bold text-[#000000] hover:text-[#000000]/70 uppercase tracking-widest transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
