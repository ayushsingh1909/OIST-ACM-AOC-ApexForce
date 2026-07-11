import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAccessToken } from "../../services/api";
import { FiClock, FiAlertTriangle } from "react-icons/fi";

const WARNING_BEFORE_MS = 2 * 60 * 1000;
const SESSION_DURATION_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"];

const SessionTimeoutWatcher = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (warningShownRef.current) {
      warningShownRef.current = false;
      setShowWarning(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const extendSession = useCallback(() => {
    resetActivity();
    setShowWarning(false);
    warningShownRef.current = false;
  }, [resetActivity]);

  useEffect(() => {
    if (!user || !getAccessToken()) return;

    const onActivity = () => resetActivity();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity));

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = SESSION_DURATION_MS - elapsed;

      if (remaining <= 0) {
        handleLogout();
        return;
      }

      if (remaining <= WARNING_BEFORE_MS && !warningShownRef.current) {
        warningShownRef.current = true;
        setShowWarning(true);
      }

      if (showWarning || warningShownRef.current) {
        setRemainingSeconds(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
      clearInterval(interval);
    };
  }, [user, resetActivity, handleLogout, showWarning]);

  if (!showWarning) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-3xl shadow-outcrowd border border-amber-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/10 rounded-xl">
            <FiAlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Session Expiring Soon</h3>
            <p className="text-sm text-slate-500">Your session will end due to inactivity</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 py-4 mb-4 bg-slate-50 rounded-xl border border-slate-200">
          <FiClock className="w-5 h-5 text-amber-400" />
          <span className="text-2xl font-mono font-bold text-amber-400">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={extendSession}
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-slate-900 font-semibold rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all"
          >
            Stay Signed In
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWatcher;
