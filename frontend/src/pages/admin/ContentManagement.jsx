import React, { useEffect, useState, useCallback } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiAlertCircle,
  FiRefreshCw, FiBook, FiMap, FiCheck,
} from "react-icons/fi";
import {
  listQuestions, createQuestion, updateQuestion, deleteQuestion,
  listRoleSkillMappings, createRoleSkillMapping, updateRoleSkillMapping, deleteRoleSkillMapping,
} from "../../services/admin.service";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
// Tab Switcher
// ─────────────────────────────────────────────
const tabs = [
  { id: "questions",    label: "Question Bank",     icon: FiBook },
  { id: "role-skills",  label: "Role-Skill Mappings", icon: FiMap },
];

// ─────────────────────────────────────────────
// Question Form Modal
// ─────────────────────────────────────────────
const defaultQuestion = {
  text: "", type: "quiz", topic: "", targetRole: "", difficulty: "Medium",
  options: "", correctAnswer: "", expectedKeywords: "", idealResponseHint: "",
};

const QuestionModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial ? {
    ...initial,
    options: initial.options?.join(", ") || "",
    expectedKeywords: initial.expectedKeywords?.join(", ") || "",
  } : defaultQuestion);
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        options: form.options.split(",").map(s => s.trim()).filter(Boolean),
        expectedKeywords: form.expectedKeywords.split(",").map(s => s.trim()).filter(Boolean),
      };
      if (initial) {
        await updateQuestion(initial._id, payload);
        toast.success("Question updated");
      } else {
        await createQuestion(payload);
        toast.success("Question created");
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">{initial ? "Edit Question" : "New Question"}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "text", label: "Question Text", type: "textarea" },
            { name: "topic", label: "Topic", type: "text" },
            { name: "targetRole", label: "Target Role", type: "text" },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea name={f.name} value={form[f.name]} onChange={handle} rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
              ) : (
                <input type="text" name={f.name} value={form[f.name]} onChange={handle}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" />
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
              <select name="type" value={form.type} onChange={handle}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500">
                <option value="quiz">Quiz</option>
                <option value="interview">Interview</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Difficulty</label>
              <select name="difficulty" value={form.difficulty} onChange={handle}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500">
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
          </div>
          {form.type === "quiz" ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Options (comma-separated)</label>
                <input type="text" name="options" value={form.options} onChange={handle}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Correct Answer</label>
                <input type="text" name="correctAnswer" value={form.correctAnswer} onChange={handle}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Expected Keywords (comma-separated)</label>
                <input type="text" name="expectedKeywords" value={form.expectedKeywords} onChange={handle}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Ideal Response Hint</label>
                <textarea name="idealResponseHint" value={form.idealResponseHint} onChange={handle} rows={2}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
              </div>
            </>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 text-sm rounded-xl hover:bg-slate-800">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl font-medium disabled:opacity-50">
              {saving ? "Saving…" : initial ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Role-Skill Mapping Form Modal
// ─────────────────────────────────────────────
const MappingModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(initial
    ? { role: initial.role, skills: initial.skills?.join(", ") || "", topics: initial.topics?.join(", ") || "", description: initial.description || "" }
    : { role: "", skills: "", topics: "", description: "" });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        role: form.role,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        topics: form.topics.split(",").map(s => s.trim()).filter(Boolean),
        description: form.description,
      };
      if (initial) {
        await updateRoleSkillMapping(initial._id, payload);
        toast.success("Mapping updated");
      } else {
        await createRoleSkillMapping(payload);
        toast.success("Mapping created");
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save mapping");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">{initial ? "Edit Mapping" : "New Role-Skill Mapping"}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Role Name</label>
            <input type="text" name="role" value={form.role} onChange={handle} required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Required Skills (comma-separated)</label>
            <textarea name="skills" value={form.skills} onChange={handle} rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Study Topics (comma-separated)</label>
            <textarea name="topics" value={form.topics} onChange={handle} rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (optional)</label>
            <input type="text" name="description" value={form.description} onChange={handle}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 text-sm rounded-xl hover:bg-slate-800">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl font-medium disabled:opacity-50">
              {saving ? "Saving…" : initial ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("questions");
  const [questions, setQuestions] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalState, setModalState] = useState({ open: false, item: null });
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "questions") {
        const res = await listQuestions({ search: search || undefined, type: typeFilter || undefined, limit: 30 });
        setQuestions(res.data.questions || []);
      } else {
        const res = await listRoleSkillMappings();
        setMappings(res.data.mappings || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load content.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question permanently?")) return;
    setDeletingId(id);
    try {
      await deleteQuestion(id);
      toast.success("Question deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete question");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMapping = async (id) => {
    if (!window.confirm("Delete this role-skill mapping?")) return;
    setDeletingId(id);
    try {
      await deleteRoleSkillMapping(id);
      toast.success("Mapping deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete mapping");
    } finally {
      setDeletingId(null);
    }
  };

  const difficultyColor = {
    Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    Medium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    Hard: "text-rose-400 bg-rose-400/10 border-rose-400/30",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-400/30">Admin</span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Content Management</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage the question bank and role-skill mappings across the platform.</p>
        </div>
        <button
          onClick={() => setModalState({ open: true, item: null })}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors">
          <FiPlus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-5 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(""); setTypeFilter(""); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
              activeTab === tab.id ? "bg-violet-600 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {activeTab === "questions" && (
          <>
            <div className="relative flex-1 min-w-48">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text" placeholder="Search topics…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500">
              <option value="">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="interview">Interview</option>
            </select>
          </>
        )}
        <button onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-700 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : activeTab === "questions" ? (
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              <FiBook className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No questions found. Add one to get started.</p>
            </div>
          ) : questions.map(q => (
            <div key={q._id} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate font-medium">{q.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">{q.topic}</span>
                  <span className="text-slate-700">·</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${difficultyColor[q.difficulty] || ""}`}>{q.difficulty}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded border bg-slate-700/50 text-slate-400 border-slate-700">{q.type}</span>
                  {!q.isActive && <span className="text-xs text-slate-600">inactive</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setModalState({ open: true, item: q })}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-violet-500/20 flex items-center justify-center group">
                  <FiEdit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400" />
                </button>
                <button onClick={() => handleDeleteQuestion(q._id)} disabled={deletingId === q._id}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-500/20 flex items-center justify-center group disabled:opacity-50">
                  <FiTrash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {mappings.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              <FiMap className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No mappings yet. Create one to define role requirements.</p>
            </div>
          ) : mappings.map(m => (
            <div key={m._id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white mb-2">{m.role}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {m.skills?.slice(0, 8).map((s, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-400/20">{s}</span>
                    ))}
                    {m.skills?.length > 8 && <span className="text-xs text-slate-500">+{m.skills.length - 8} more</span>}
                  </div>
                  <p className="text-xs text-slate-500">{m.topics?.length || 0} study topics</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setModalState({ open: true, item: m })}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-violet-500/20 flex items-center justify-center group">
                    <FiEdit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400" />
                  </button>
                  <button onClick={() => handleDeleteMapping(m._id)} disabled={deletingId === m._id}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-500/20 flex items-center justify-center group disabled:opacity-50">
                    <FiTrash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modalState.open && activeTab === "questions" && (
        <QuestionModal
          initial={modalState.item}
          onClose={() => setModalState({ open: false, item: null })}
          onSave={fetchData}
        />
      )}
      {modalState.open && activeTab === "role-skills" && (
        <MappingModal
          initial={modalState.item}
          onClose={() => setModalState({ open: false, item: null })}
          onSave={fetchData}
        />
      )}
    </div>
  );
};

export default ContentManagement;
