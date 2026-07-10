import React, { useEffect, useState, useCallback } from "react";
import {
  FiUsers, FiSearch, FiEdit2, FiToggleLeft, FiToggleRight,
  FiChevronLeft, FiChevronRight, FiAlertCircle, FiRefreshCw,
  FiUser, FiShield, FiEye,
} from "react-icons/fi";
import { listUsers, updateUserRole, toggleUserStatus } from "../../services/admin.service";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const roleBadge = (role) => {
  const map = {
    admin:   "bg-rose-400/10 text-rose-400 border-rose-400/30",
    student: "bg-violet-400/10 text-violet-400 border-violet-400/30",
    judge:   "bg-amber-400/10 text-amber-400 border-amber-400/30",
  };
  return map[role] || "bg-slate-400/10 text-slate-400 border-slate-400/30";
};

const statusBadge = (isActive) =>
  isActive
    ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
    : "bg-slate-400/10 text-slate-400 border-slate-400/30";

// ─────────────────────────────────────────────
// Edit Role Modal
// ─────────────────────────────────────────────
const EditRoleModal = ({ user, onClose, onSave }) => {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (role === user.role) { onClose(); return; }
    setSaving(true);
    try {
      await updateUserRole(user._id, role);
      toast.success(`Role updated to "${role}" for ${user.name}`);
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
            <FiShield className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Update Role</h3>
            <p className="text-xs text-slate-400">{user.name} · {user.email}</p>
          </div>
        </div>
        <div className="space-y-2 mb-5">
          {["student", "admin", "judge"].map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                role === r ? "bg-violet-600/20 border-violet-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${role === r ? "bg-violet-400" : "bg-slate-600"}`} />
              <span className="capitalize">{r}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 text-sm rounded-xl hover:bg-slate-800">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl font-medium disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listUsers({
        page, limit: 15,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(result.data.users);
      setPagination(result.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    setTogglingId(user._id);
    try {
      await toggleUserStatus(user._id, !user.isActive);
      toast.success(`User ${!user.isActive ? "activated" : "deactivated"} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle user status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-400/30">Admin</span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">User Management</h1>
          <p className="text-slate-400 mt-1 text-sm">View, edit roles, and manage account status for all platform users.</p>
        </div>
        <button onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text" placeholder="Search name or email…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
          />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
          <option value="judge">Judge</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchUsers} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-slate-800/50 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <span>User</span>
          <span className="hidden sm:block">Role</span>
          <span className="hidden sm:block">Status</span>
          <span className="hidden sm:block">Joined</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <FiUsers className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {users.map(user => (
              <div key={user._id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-slate-800/30 transition-colors">
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-violet-400">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                {/* Role */}
                <span className={`hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full border capitalize ${roleBadge(user.role)}`}>
                  {user.role}
                </span>
                {/* Status */}
                <span className={`hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full border ${statusBadge(user.isActive)}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
                {/* Joined */}
                <span className="hidden sm:block text-xs text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingUser(user)}
                    title="Edit role"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-violet-500/20 flex items-center justify-center transition-colors group">
                    <FiEdit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user)}
                    disabled={togglingId === user._id}
                    title={user.isActive ? "Deactivate" : "Activate"}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-500/20 flex items-center justify-center transition-colors group disabled:opacity-50">
                    {user.isActive
                      ? <FiToggleRight className="w-4 h-4 text-emerald-400" />
                      : <FiToggleLeft className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-slate-500">
            Showing {users.length} of {pagination.total} users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-colors">
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="flex items-center px-3 text-xs text-slate-400">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-colors">
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {editingUser && (
        <EditRoleModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserManagement;
