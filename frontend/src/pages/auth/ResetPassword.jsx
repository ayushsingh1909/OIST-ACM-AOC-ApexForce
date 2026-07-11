import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/forgot-password", { replace: true });
    }
  }, [token, navigate]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: "", color: "" };
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
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[a-zA-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await resetPassword(token, formData.password);
      setIsDone(true);
    } catch (err) {
      console.error("Reset password failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4 py-8">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-outcrowd border border-slate-100 relative overflow-hidden transition-all duration-300">
        {!isDone ? (
          <>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-heading">
                Reset Password
              </h2>
              <p className="mt-3 text-sm font-medium text-slate-500 font-sans tracking-wide">Enter your new secure password below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <FiLock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="min. 6 chars with a letter and number"
                    className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 rounded-2xl border-2 text-slate-800 text-[15px] placeholder-slate-400 focus:outline-none transition-all ${errors.password ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 bg-rose-50/50" : "border-slate-100 hover:border-slate-200 focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-[#4F46E5]/20"}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors">
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-slate-400">Strength:</span>
                      <span className={`font-semibold ${strength.score === 1 ? "text-rose-500" : strength.score === 2 ? "text-amber-500" : "text-emerald-500"}`}>{strength.text}</span>
                    </div>
                    <div className="flex space-x-1.5 h-1">
                      <div className={`flex-1 rounded ${strength.score >= 1 ? strength.color : "bg-slate-200"}`}></div>
                      <div className={`flex-1 rounded ${strength.score >= 2 ? strength.color : "bg-slate-200"}`}></div>
                      <div className={`flex-1 rounded ${strength.score >= 3 ? strength.color : "bg-slate-200"}`}></div>
                    </div>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1"><FiAlertCircle className="w-3 h-3" /> {errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-sans">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <FiLock className="w-5 h-5" />
                  </span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 rounded-2xl border-2 text-slate-800 text-[15px] placeholder-slate-400 focus:outline-none transition-all ${errors.confirmPassword ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 bg-rose-50/50" : "border-slate-100 hover:border-slate-200 focus:border-[#4F46E5] focus:bg-white focus:ring-4 focus:ring-[#4F46E5]/20"}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors">
                    {showConfirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1"><FiAlertCircle className="w-3 h-3" /> {errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-6 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] hover:opacity-90 text-white font-bold transition-all duration-300 disabled:opacity-50 font-sans tracking-wide text-[15px] shadow-lg shadow-[#4F46E5]/25"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                    Resetting password...
                  </span>
                ) : "Reset Password"}
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
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3 font-heading">Password Reset!</h2>
            <p className="text-sm text-slate-500 mb-8 font-medium">
              Your password has been updated. You can now sign in with your new credentials.
            </p>
            <Link
              to="/login"
              className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] hover:opacity-90 text-white font-bold transition-all duration-300 shadow-lg shadow-[#4F46E5]/25 text-[15px]"
            >
              Go to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
