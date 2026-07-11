import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiUser, FiLogOut, FiHome, FiFileText, FiHelpCircle, FiClipboard, FiGrid, FiActivity, FiTrendingUp, FiShield } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  if (!user) return null;

  const navItems = [
    { to: "/", label: "Dashboard", icon: FiHome },
    { to: "/resume", label: "Resume", icon: FiFileText },
    { to: "/quiz", label: "Quiz", icon: FiHelpCircle },
    { to: "/assignments", label: "Assignments", icon: FiClipboard },
    { to: "/interviews", label: "Interview", icon: FiActivity },
    { to: "/career-dashboard", label: "Readiness", icon: FiGrid },
    { to: "/growth-trend", label: "Growth Trend", icon: FiTrendingUp },
  ];

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          <FiGrid className="w-5 h-5 text-violet-400" />
          ACIE
        </Link>
        <div className="hidden md:flex flex-wrap items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition-all ${
                location.pathname === to || (to !== "/" && location.pathname.startsWith(to))
                  ? "bg-violet-600/20 text-violet-600"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="/profile"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl transition-all"
        >
          <FiUser className="w-4 h-4" />
          <span className="hidden sm:inline">{user.name}</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <FiLogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
