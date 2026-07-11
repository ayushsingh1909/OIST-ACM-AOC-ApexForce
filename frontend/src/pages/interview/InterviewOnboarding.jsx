import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiChevronRight, FiBriefcase, FiSliders, FiClock, FiPlus, FiX } from "react-icons/fi";
import interviewService from "../../services/interview.service";

const InterviewOnboarding = () => {
  const navigate = useNavigate();
  const [rolesConfig, setRolesConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedRole, setSelectedRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [timeLimit, setTimeLimit] = useState(120); // default 2 minutes (120s)
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await interviewService.getRoles();
        if (response.success) {
          setRolesConfig(response.data);
          const firstRole = Object.keys(response.data)[0];
          setSelectedRole(firstRole);
          setSkills(response.data[firstRole].defaultSkills);
        }
      } catch (err) {
        toast.error("Failed to load interview role configurations.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleRoleChange = (roleName) => {
    setSelectedRole(roleName);
    if (rolesConfig && rolesConfig[roleName]) {
      setSkills(rolesConfig[roleName].defaultSkills);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = newSkill.trim();
    if (!cleanSkill) return;
    if (skills.some(s => s.toLowerCase() === cleanSkill.toLowerCase())) {
      toast.error("Skill is already added.");
      return;
    }
    setSkills([...skills, cleanSkill]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleStartSimulation = async () => {
    if (!selectedRole) {
      toast.error("Please select a target job role.");
      return;
    }
    setStarting(true);
    try {
      const response = await interviewService.startSession({
        role: selectedRole,
        skillStack: skills,
        difficulty,
        timeLimitPerQuestion: Number(timeLimit)
      });
      if (response.success && response.data.sessionId) {
        toast.success("Simulation initiated!");
        navigate(`/interview/session/${response.data.sessionId}`);
      } else {
        toast.error("Failed to start interview session.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred starting the interview.");
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500">Loading simulator configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-violet-500/20 bg-violet-500/10 text-violet-400 mb-4 animate-pulse">
          Module 6: Interview Simulation
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          AI Interview Simulator
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
          Practice adaptive real-world interview assessments tailored specifically to your target roles. Get graded on logical structure, technical depth, and keyword density.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step Cards - left / middle col */}
        <div className="md:col-span-2 space-y-6">
          {/* Role Selection */}
          <div className="p-6 bg-white backdrop-blur-xl border border-slate-100 rounded-3xl shadow-outcrowd">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <FiBriefcase className="text-violet-400" /> Select Target Job Role
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rolesConfig &&
                Object.keys(rolesConfig).map((roleName) => (
                  <button
                    key={roleName}
                    type="button"
                    onClick={() => handleRoleChange(roleName)}
                    className={`p-4 text-left rounded-xl border transition-all ${
                      selectedRole === roleName
                        ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/5 text-slate-900"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-350 hover:text-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-sm">{roleName}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {rolesConfig[roleName].defaultSkills.slice(0, 4).join(", ")}...
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Skill Customizer */}
          <div className="p-6 bg-white backdrop-blur-xl border border-slate-100 rounded-3xl shadow-outcrowd">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <FiSliders className="text-violet-400" /> Customize Skill Stack
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              These skill tags feed into the adaptivity algorithm to structure targeted questions.
            </p>

            <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add custom skill (e.g. AWS S3, GraphQL, Redis)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:border-violet-500 focus:outline-none placeholder-slate-600"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all"
              >
                <FiPlus className="w-4 h-4" /> Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-955 border border-slate-200 text-xs text-slate-600 font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <div className="text-sm text-slate-500 py-2">No skills selected. Add skills above.</div>
              )}
            </div>
          </div>
        </div>

        {/* Configurations - right col */}
        <div className="space-y-6">
          <div className="p-6 bg-white backdrop-blur-xl border border-slate-100 rounded-3xl shadow-outcrowd">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <FiClock className="text-violet-400" /> Simulation Settings
            </h2>

            {/* Difficulty */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Easy", "Medium", "Hard"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      difficulty === lvl
                        ? "border-violet-500 bg-violet-500/10 text-violet-300"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Constraint */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Time Limit Per Question
              </label>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:border-violet-500 focus:outline-none"
              >
                <option value={60}>60 Seconds (Fast Pace)</option>
                <option value={120}>120 Seconds (Standard)</option>
                <option value={180}>180 Seconds (Detailed)</option>
                <option value={0}>Unlimited (Practice Mode)</option>
              </select>
            </div>

            {/* Summary details */}
            <div className="border-t border-slate-200 pt-4 mb-6 text-xs text-slate-500 space-y-2">
              <div className="flex justify-between">
                <span>Structure:</span>
                <span className="text-slate-900 font-medium">4 Core Verticals</span>
              </div>
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="text-slate-900 font-medium">4 Questions</span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="text-slate-900 font-medium">Free-Text Answers</span>
              </div>
            </div>

            <button
              onClick={handleStartSimulation}
              disabled={starting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-slate-900 font-bold text-sm shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Assembling Questions...
                </>
              ) : (
                <>
                  Start Simulation <FiChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
          <button
            onClick={() => navigate("/interview/history")}
            className="w-full py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white/60 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-all text-center"
          >
            View Historical Interviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewOnboarding;
