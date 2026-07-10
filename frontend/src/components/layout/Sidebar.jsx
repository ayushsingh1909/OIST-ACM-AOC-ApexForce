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
      className={`flex items-center gap-3 px-3 py-2.5 transition-all group ${
        isActive
          ? "bg-[#000000] text-[#FFFFFF] font-bold"
          : "hover:bg-black/5 text-[#555555] hover:text-[#000000]"
      }`}
      title={collapsed ? label : undefined}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#FFFFFF]" : "text-[#555555] group-hover:text-[#000000] transition-colors"}`} />
      {!collapsed && (
        <span className="text-xs font-mono tracking-tight whitespace-nowrap">
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
        style={{ width: "260px" }}
        className="hidden md:flex flex-col bg-white border-r border-[#111111]/10 h-screen sticky top-0 z-40 transition-shadow select-none overflow-hidden flex-shrink-0"
      >
        <div className="p-6 flex items-center justify-between border-b border-black/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#000000] flex items-center justify-center text-white font-bold font-sans flex-shrink-0">
              A
            </div>
            {!collapsed && (
              <span className="font-bold text-sm tracking-tight font-sans uppercase text-[#000000] whitespace-nowrap">
                ACIE LMS
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-black/5 text-[#555555] flex-shrink-0"
            title="Toggle Sidebar"
          >
            <FiMenu className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="p-4 border-t border-black/10 flex flex-col gap-2 bg-[#FFFFFF]">
          <SidebarLink icon={FiSettings} label="Settings" to="/profile" collapsed={collapsed} />
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 transition-all group hover:bg-black/5 text-[#B30006] w-full text-left"
            title={collapsed ? "Sign Out" : undefined}
          >
            <FiLogOut className="w-4 h-4 flex-shrink-0 text-[#B30006]/70 group-hover:text-[#B30006]" />
            {!collapsed && (
              <span className="text-xs font-mono tracking-tight whitespace-nowrap">
                Sign Out
              </span>
            )}
          </button>
          
          <div className="flex items-center gap-3 mt-2 p-2 border border-black/10 bg-white overflow-hidden">
            <div className="w-8 h-8 bg-[#000000]/5 flex items-center justify-center font-bold text-xs text-[#000000] font-sans flex-shrink-0">
              {user?.name?.substring(0, 2).toUpperCase() || "ST"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#000000] truncate tracking-tight">{user?.name || "Student"}</p>
                <span className="text-[9px] font-sans font-bold text-[#555555] uppercase tracking-widest">Student</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-[#111111]/40 backdrop-blur-sm z-50 md:hidden flex justify-start">
          <div className="w-[260px] bg-white h-full flex flex-col p-6 border-r border-[#111111]/10 relative overflow-y-auto">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-2 text-[#111111]"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-[#635BFF] flex items-center justify-center rounded-lg text-white font-bold font-mono">
                A
              </div>
              <span className="font-bold text-sm tracking-tight font-mono uppercase text-[#111111]">
                ACIE LMS
              </span>
            </div>
            
            <nav className="flex-grow flex flex-col gap-1">
              {navItems.map((item) => (
                <SidebarLink key={item.to} {...item} collapsed={false} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>

            <div className="mt-8 flex flex-col gap-2 pt-4 border-t border-[#111111]/5">
              <SidebarLink icon={FiSettings} label="Settings" to="/profile" collapsed={false} onClick={() => setMobileOpen(false)} />
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group hover:bg-[#FAFAFA] text-[#B30006] w-full text-left"
              >
                <FiLogOut className="w-4 h-4 flex-shrink-0 text-[#B30006]/70 group-hover:text-[#B30006]" />
                <span className="text-xs font-mono tracking-tight">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
