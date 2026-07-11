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
    <div className="flex items-center justify-center min-h-[85vh] px-4 py-8">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-outcrowd border border-slate-100 relative overflow-hidden transition-all duration-300">
        {!isSent ? (
          <>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-heading">
                Forgot Password
              </h2>
              <p className="mt-3 text-sm font-medium text-slate-500 font-sans tracking-wide">
                Enter your email address to receive a secure recovery link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <FiMail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="you@example.com"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl border-2 text-slate-800 text-[15px] placeholder-slate-400 focus:outline-none transition-all ${
                      error ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 bg-rose-50/50" : "border-slate-100 hover:border-slate-200 focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-[#4F46E5]/20"
                    }`}
                  />
                </div>
                {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-6 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] hover:opacity-90 text-slate-900 font-bold transition-all duration-300 disabled:opacity-50 font-sans tracking-wide text-[15px] shadow-lg shadow-[#4F46E5]/25"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
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
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3 font-heading">Check Your Email</h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              If an account matches <span className="font-bold text-slate-800">{email}</span>, we have sent a secure password reset link to your inbox.
            </p>
            <p className="text-xs text-slate-500 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
              Note: During development, if SMTP credentials are not configured, you can copy the recovery link directly from the backend node console logs!
            </p>
            <button
              onClick={() => setIsSent(false)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-sm"
            >
              Resend Link
            </button>
          </div>
        )}

        <div className="mt-8 text-center font-sans">
          <Link
            to="/login"
            className="inline-flex items-center text-[15px] font-bold text-[#4F46E5] hover:text-[#4F46E5]/80 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
