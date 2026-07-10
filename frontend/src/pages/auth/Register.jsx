import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase } from "react-icons/fi";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password rules helper
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: "Weak", color: "bg-slate-800" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[a-zA-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    
    if (score === 1) return { score: 1, text: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 2, text: "Moderate", color: "bg-amber-500" };
    return { score: 3, text: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }
      if (!/[a-zA-Z]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one letter";
      }
      if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "Password must contain at least one number";
      }
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
      await register(formData);
      navigate("/");
    } catch (err) {
      console.error("Registration failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4 py-8">
      <div className="w-full max-w-md p-10 bg-[#FFFFFF] border border-black/10 relative overflow-hidden">

        <div className="text-center mb-10">
          <h2 className="text-5xl font-bold tracking-tighter text-[#000000]">
            Create Account
          </h2>
          <p className="mt-4 text-xs font-sans text-[#000000] tracking-wide">
            Join the ACIE preparation-to-placement ecosystem
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold text-[#000000] uppercase tracking-widest mb-2 font-sans">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#000000]">
                <FiUser className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border text-[#000000] text-sm placeholder-[#000000]/30 focus:outline-none transition-all ${
                  errors.name ? "border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-black/20 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
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
                placeholder="john@example.com"
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
            <label className="block text-[10px] font-bold text-[#000000] uppercase tracking-widest mb-2 font-sans">
              Password
            </label>
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
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-slate-400">Password Strength:</span>
                  <span
                    className={`font-semibold ${
                      strength.score === 1
                        ? "text-rose-500"
                        : strength.score === 2
                        ? "text-amber-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {strength.text}
                  </span>
                </div>
                <div className="flex space-x-1.5 h-1">
                  <div
                    className={`flex-1 rounded ${
                      strength.score >= 1 ? strength.color : "bg-slate-800"
                    }`}
                  ></div>
                  <div
                    className={`flex-1 rounded ${
                      strength.score >= 2 ? strength.color : "bg-slate-800"
                    }`}
                  ></div>
                  <div
                    className={`flex-1 rounded ${
                      strength.score >= 3 ? strength.color : "bg-slate-800"
                    }`}
                  ></div>
                </div>
              </div>
            )}
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
                Creating account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#000000] font-sans">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[#000000] hover:text-[#000000]/70 underline decoration-1 underline-offset-2 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
