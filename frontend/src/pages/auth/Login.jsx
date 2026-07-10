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
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-10 bg-[#FFFFFF] border border-black/10 relative overflow-hidden">

        <div className="text-center mb-10">
          <h2 className="text-5xl font-bold tracking-tighter text-[#000000]">
            Welcome Back
          </h2>
          <p className="mt-4 text-xs font-sans text-[#000000] tracking-wide">
            Sign in to continue to AI Career Intelligence Engine
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border text-[#000000] text-sm placeholder-[#000000]/30 focus:outline-none transition-all ${
                  errors.email ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-black/20 focus:border-black focus:ring-1 focus:ring-black"
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
              <label className="block text-[10px] font-bold text-[#000000] uppercase tracking-widest font-sans">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[10px] font-bold text-[#000000] hover:text-[#000000]/70 uppercase tracking-widest font-sans underline decoration-1 underline-offset-2 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#000000]">
                <FiLock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-[#FFFFFF] border text-[#000000] text-sm placeholder-[#000000]/30 focus:outline-none transition-all ${
                  errors.password ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-black/20 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#000000] hover:text-[#000000]/70"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
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
            className="w-full py-4 mt-4 bg-[#000000] hover:bg-[#000000]/80 text-white font-bold transition-all duration-300 disabled:opacity-50 font-sans tracking-wide text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                Authenticating...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#000000] font-sans">
          New to ACIE?{" "}
          <Link
            to="/register"
            className="font-bold text-[#000000] hover:text-[#000000]/70 underline decoration-1 underline-offset-2 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
