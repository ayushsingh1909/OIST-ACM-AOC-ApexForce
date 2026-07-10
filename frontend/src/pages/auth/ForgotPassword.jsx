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
      <div className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {!isSent ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Forgot Password
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Enter your email address to receive a secure recovery link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
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
                    className={`w-full pl-10 pr-4 py-3 bg-slate-950/50 border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all ${
                      error ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-violet-500"
                    }`}
                  />
                </div>
                {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/30 hover:shadow-violet-600/40 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
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
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <FiCheckCircle className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-sm text-slate-400 mb-6">
              If an account matches <span className="font-semibold text-violet-400">{email}</span>, we have sent a secure password reset link to your inbox.
            </p>
            <p className="text-xs text-slate-500 mb-6">
              Note: During development, if SMTP credentials are not configured, you can copy the recovery link directly from the backend node console logs!
            </p>
            <button
              onClick={() => setIsSent(false)}
              className="px-6 py-2 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all text-sm font-medium"
            >
              Resend Link
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-violet-400 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
