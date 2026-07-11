import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import {
  FiLayers, FiBookOpen, FiCheckSquare, FiFileText,
  FiMic, FiTrendingUp, FiFile, FiSettings, FiLogOut,
  FiMenu, FiX
} from "react-icons/fi";
import { useReducedMotion } from "../../animations/useReducedMotion";
import { useAuth } from "../../context/AuthContext";

const SidebarLink = ({ icon: Icon, label, to, collapsed, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
        isActive
          ? "bg-[#00D2C4]/10 text-[#00D2C4] font-bold shadow-sm"
          : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
      }`}
      title={collapsed ? label : undefined}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#00D2C4] rounded-r-full shadow-[0_0_10px_rgba(0,210,196,0.5)]"></div>
      )}
      <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-[#00D2C4]" : "text-slate-400 group-hover:text-[#00D2C4]"}`} />
      {!collapsed && (
        <span className="text-[15px] font-medium tracking-tight whitespace-nowrap">
          {label}
        </span>
      )}
    </Link>
  );
};

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isReduced = useReducedMotion();
  const sidebarRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isReduced) return;
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    gsap.to(sidebar, {
      width: collapsed ? "80px" : "260px",
      duration: 0.45,
      ease: "power3.inOut"
    });
  }, [collapsed, isReduced]);

  const navItems = [
    { to: "/", label: "Dashboard", icon: FiLayers },
    { to: "/courses", label: "Courses", icon: FiBookOpen },
    { to: "/quiz", label: "Quizzes", icon: FiCheckSquare },
    { to: "/assignments", label: "Assignments", icon: FiFileText },
    { to: "/interviews", label: "Interviews", icon: FiMic },
    { to: "/readiness", label: "Readiness", icon: FiTrendingUp },
    { to: "/resume", label: "Resume Scan", icon: FiFile },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        style={{ width: "280px" }}
        className="hidden md:flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-outcrowd h-screen sticky top-0 z-40 transition-shadow select-none overflow-hidden flex-shrink-0"
      >
        <div className="p-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#00D2C4] rounded-2xl flex items-center justify-center text-white font-bold font-heading text-lg shadow-lg shadow-[#00D2C4]/20 flex-shrink-0">
              A
            </div>
            {!collapsed && (
              <span className="font-bold text-xl tracking-tight font-heading text-slate-900 whitespace-nowrap">
                Mondly
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
            title="Toggle Sidebar"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-6 py-2 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="p-6 flex flex-col gap-2">
          <SidebarLink icon={FiSettings} label="Settings" to="/profile" collapsed={collapsed} />
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 transition-all rounded-2xl group hover:bg-rose-50 text-rose-500 w-full text-left"
            title={collapsed ? "Sign Out" : undefined}
          >
            <FiLogOut className="w-5 h-5 flex-shrink-0 text-rose-400 group-hover:text-rose-500 transition-colors" />
            {!collapsed && (
              <span className="text-[15px] font-medium tracking-tight whitespace-nowrap">
                Sign Out
              </span>
            )}
          </button>
          
          <div className="flex items-center gap-3 mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100/50 shadow-sm overflow-hidden transition-all hover:shadow-md hover:bg-white cursor-pointer">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center font-bold text-sm text-indigo-600 font-heading flex-shrink-0">
              {user?.name?.substring(0, 2).toUpperCase() || "ST"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate tracking-tight">{user?.name || "Student"}</p>
                <span className="text-xs font-medium text-slate-500 tracking-wide">Learner</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 md:hidden flex justify-start">
          <div className="w-[280px] bg-white h-full flex flex-col p-6 shadow-2xl relative overflow-y-auto rounded-r-3xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-10 mt-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#00D2C4] rounded-2xl flex items-center justify-center text-white font-bold font-heading text-lg shadow-lg shadow-[#00D2C4]/20 flex-shrink-0">
                A
              </div>
              <span className="font-bold text-xl tracking-tight font-heading text-slate-900">
                Mondly
              </span>
            </div>
            
            <nav className="flex-grow flex flex-col gap-2">
              {navItems.map((item) => (
                <SidebarLink key={item.to} {...item} collapsed={false} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>

            <div className="mt-8 flex flex-col gap-2 pt-6">
              <SidebarLink icon={FiSettings} label="Settings" to="/profile" collapsed={false} onClick={() => setMobileOpen(false)} />
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group hover:bg-rose-50 text-rose-500 w-full text-left"
              >
                <FiLogOut className="w-5 h-5 flex-shrink-0 text-rose-400 group-hover:text-rose-500" />
                <span className="text-[15px] font-medium tracking-tight">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
