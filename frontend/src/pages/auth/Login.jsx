import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/";

  // Simple validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      // Toast message is already displayed by AuthContext
      console.error("Login request failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4 py-8">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-outcrowd border border-slate-100 relative overflow-hidden transition-all duration-300">

        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-heading">
            Welcome Back
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-500 font-sans tracking-wide">
            Sign in to continue to Mondly
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl border-2 text-slate-800 text-[15px] placeholder-slate-400 focus:outline-none transition-all ${
                  errors.email ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 bg-rose-50/50" : "border-slate-100 hover:border-slate-200 focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-[#4F46E5]/20"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider font-sans">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-[#4F46E5] hover:text-[#4F46E5]/80 font-sans transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <FiLock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 rounded-2xl border-2 text-slate-800 text-[15px] placeholder-slate-400 focus:outline-none transition-all ${
                  errors.password ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 bg-rose-50/50" : "border-slate-100 hover:border-slate-200 focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-[#4F46E5]/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-6 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] hover:opacity-90 text-slate-900 font-bold transition-all duration-300 disabled:opacity-50 font-sans tracking-wide text-[15px] shadow-lg shadow-[#4F46E5]/25"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                Authenticating...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[15px] text-slate-500 font-sans font-medium">
          New to Mondly?{" "}
          <Link
            to="/register"
            className="font-bold text-[#4F46E5] hover:text-[#4F46E5]/80 transition-colors ml-1"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
