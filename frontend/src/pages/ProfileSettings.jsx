import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiLogOut,
  FiShield,
} from "react-icons/fi";

const ProfileSettings = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("info");

  const [infoForm, setInfoForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [infoErrors, setInfoErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const validateInfo = () => {
    const newErrors = {};
    if (!infoForm.name.trim() || infoForm.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!infoForm.email || !/\S+@\S+\.\S+/.test(infoForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setInfoErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    } else if (!/[a-zA-Z]/.test(passwordForm.newPassword)) {
      newErrors.newPassword = "Must contain at least one letter";
    } else if (!/[0-9]/.test(passwordForm.newPassword)) {
      newErrors.newPassword = "Must contain at least one number";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!validateInfo()) return;
    setIsSubmittingInfo(true);
    try {
      await updateProfile({ name: infoForm.name, email: infoForm.email });
    } catch (err) {
      console.error("Info update failed", err);
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setIsSubmittingPassword(true);
    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Password update failed", err);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleColor =
    user?.role === "admin"
      ? "text-amber-500 bg-amber-50 border-amber-200"
      : "text-violet-600 bg-violet-50 border-violet-200";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Profile Header */}
      <div className="p-6 bg-white backdrop-blur-xl border border-slate-100 rounded-3xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-600/20">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span
              className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 text-xs font-semibold border rounded-full ${roleColor}`}
            >
              <FiShield className="w-3 h-3" />
              {user?.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : "User"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-500 border border-rose-200 hover:bg-rose-50 rounded-xl transition-all"
          >
            <FiLogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["info", "password"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all capitalize ${
              activeTab === tab
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20"
                : "text-slate-500 bg-white border border-slate-200 hover:text-slate-700"
            }`}
          >
            {tab === "info" ? "Personal Info" : "Change Password"}
          </button>
        ))}
      </div>

      {/* Personal Info Form */}
      {activeTab === "info" && (
        <div className="p-6 bg-white backdrop-blur-xl border border-slate-100 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Personal Information
          </h2>
          <form onSubmit={handleInfoSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FiUser className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={infoForm.name}
                  onChange={(e) => {
                    setInfoForm({ ...infoForm, name: e.target.value });
                    if (infoErrors.name)
                      setInfoErrors({ ...infoErrors, name: "" });
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-violet-500 transition-all ${
                    infoErrors.name ? "border-rose-500" : "border-slate-200"
                  }`}
                />
              </div>
              {infoErrors.name && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {infoErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FiMail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={infoForm.email}
                  onChange={(e) => {
                    setInfoForm({ ...infoForm, email: e.target.value });
                    if (infoErrors.email)
                      setInfoErrors({ ...infoErrors, email: "" });
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-violet-500 transition-all ${
                    infoErrors.email ? "border-rose-500" : "border-slate-200"
                  }`}
                />
              </div>
              {infoErrors.email && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {infoErrors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmittingInfo}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingInfo ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Saving...
                </span>
              ) : (
                <>
                  <FiSave className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Change Password Form */}
      {activeTab === "password" && (
        <div className="p-6 bg-white backdrop-blur-xl border border-slate-100 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Change Password
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {[
              {
                key: "currentPassword",
                label: "Current Password",
                show: showCurrent,
                toggle: () => setShowCurrent(!showCurrent),
              },
              {
                key: "newPassword",
                label: "New Password",
                show: showNew,
                toggle: () => setShowNew(!showNew),
              },
              {
                key: "confirmPassword",
                label: "Confirm New Password",
                show: showConfirm,
                toggle: () => setShowConfirm(!showConfirm),
              },
            ].map(({ key, label, show, toggle }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {label}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FiLock className="w-5 h-5" />
                  </span>
                  <input
                    type={show ? "text" : "password"}
                    value={passwordForm[key]}
                    onChange={(e) => {
                      setPasswordForm({
                        ...passwordForm,
                        [key]: e.target.value,
                      });
                      if (passwordErrors[key])
                        setPasswordErrors({ ...passwordErrors, [key]: "" });
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-violet-500 transition-all ${
                      passwordErrors[key]
                        ? "border-rose-500"
                        : "border-slate-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {show ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordErrors[key] && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">
                    {passwordErrors[key]}
                  </p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingPassword ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Updating...
                </span>
              ) : (
                <>
                  <FiLock className="w-4 h-4" /> Update Password
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
