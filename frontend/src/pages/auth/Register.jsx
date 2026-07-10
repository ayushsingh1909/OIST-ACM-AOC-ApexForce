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
      <div className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Join the ACIE preparation-to-placement ecosystem
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <FiUser className="w-5 h-5" />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all ${
                  errors.name ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-violet-500"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all ${
                  errors.email ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-violet-500"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Account Role
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <FiBriefcase className="w-5 h-5" />
              </span>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none"
              >
                <option value="student">Student Account</option>
                <option value="admin">Administrator</option>
              </select>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                ▼
              </span>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <FiLock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/50 border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all ${
                  errors.password ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-violet-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
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
            className="w-full py-3 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/30 hover:shadow-violet-600/40 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                Creating account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
