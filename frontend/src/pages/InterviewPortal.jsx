import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const ROLES = ["Full-Stack Developer", "Data Scientist", "DevOps Engineer", "Backend Developer", "Frontend Developer"];
const DEFAULT_SKILLS = {
  "Full-Stack Developer": ["React", "Node.js", "Express", "MongoDB", "SQL", "TypeScript", "Docker"],
  "Data Scientist": ["Python", "TensorFlow", "Pandas", "Scikit-Learn", "SQL", "Statistics"],
  "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD Pipelines", "Terraform", "Linux"],
  "Backend Developer": ["Node.js", "Java", "Python", "SQL", "REST APIs", "Redis", "System Design"],
  "Frontend Developer": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Tailwind CSS"]
};

const InterviewPortal = () => {
  // Navigation & Page States: 'onboarding', 'workspace', 'report', 'history_list'
  const [viewState, setViewState] = useState("onboarding");
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Onboarding States
  const [targetRole, setTargetRole] = useState("Full-Stack Developer");
  const [selectedSkills, setSelectedSkills] = useState(DEFAULT_SKILLS["Full-Stack Developer"]);
  const [customSkill, setCustomSkill] = useState("");
  const [starting, setStarting] = useState(false);

  // Live Workspace States
  const [activeSession, setActiveSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 minutes countdown

  // Report States
  const [sessionReport, setSessionReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Timer Effect
  useEffect(() => {
    if (viewState !== "workspace" || secondsRemaining <= 0) return;
    
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error("Interview session timer expired!");
          setViewState("onboarding");
          setActiveSession(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [viewState, secondsRemaining]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get("/interviews/history");
      if (response.data && response.data.success) {
        setHistoryList(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load interview history");
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRoleChange = (role) => {
    setTargetRole(role);
    setSelectedSkills(DEFAULT_SKILLS[role] || []);
  };

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const skill = customSkill.trim();
    if (!skill) return;
    if (selectedSkills.includes(skill)) {
      toast.error("Skill is already selected");
      return;
    }
    setSelectedSkills([...selectedSkills, skill]);
    setCustomSkill("");
  };

  // Start Interview
  const handleStart = async () => {
    setStarting(true);
    try {
      const response = await api.post("/interviews/start", {
        targetRole,
        skillStack: selectedSkills
      });
      if (response.data && response.data.success) {
        setActiveSession(response.data.data);
        setCurrentQuestionIndex(0);
        setAnswerText("");
        setSecondsRemaining(900); // 15 minutes
        setViewState("workspace");
        toast.success("Mock interview simulation started! Good luck.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start interview");
    } finally {
      setStarting(false);
    }
  };

  // Submit Answer & Move Forward
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!activeSession) return;

    const currentQuestion = activeSession.questions[currentQuestionIndex];
    if (!answerText.trim()) {
      toast.error("Please type your response before submitting.");
      return;
    }

    setSubmittingAnswer(true);
    try {
      const response = await api.post(`/interviews/${activeSession._id}/submit`, {
        questionId: currentQuestion._id,
        answerText: answerText.trim()
      });

      if (response.data && response.data.success) {
        setAnswerText("");
        toast.success("Answer recorded successfully!");

        if (response.data.data.status === "completed") {
          // Interview ended, fetch full report immediately
          handleViewReport(activeSession._id);
        } else {
          // Go to next question
          setCurrentQuestionIndex(response.data.data.nextQuestionIndex);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit answer");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // View Report
  const handleViewReport = async (sessionId) => {
    setLoadingReport(true);
    setViewState("report");
    try {
      const response = await api.get(`/interviews/${sessionId}/report`);
      if (response.data && response.data.success) {
        setSessionReport(response.data.data);
        fetchHistory(); // Refresh history log too
      }
    } catch (error) {
      toast.error("Failed to load interview report card");
      setViewState("onboarding");
    } finally {
      setLoadingReport(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:py-12">
      
      {/* Title */}
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent tracking-tight bg-gradient-to-r from-[#4F46E5] via-indigo-500 to-[#00D2C4] bg-clip-text text-transparent">
          AI Interview Simulation Portal
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
          Practice timed mock interviews tailored to your exact career role. Get graded instantly with custom latency-optimized lexical checks.
        </p>
      </div>

      {/* Nav switcher */}
      <div className="flex border-b border-slate-200 mb-8 max-w-md mx-auto justify-center bg-white rounded-2xl shadow-outcrowd p-1.5 border border-slate-200">
        <button
          onClick={() => { setViewState("onboarding"); setActiveSession(null); }}
          disabled={viewState === "workspace"}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            viewState === "onboarding"
              ? "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-[#4F46E5]/25 shadow-lg"
              : "text-slate-500 hover:text-slate-700 disabled:opacity-50"
          }`}
        >
          Setup Simulation
        </button>
        <button
          onClick={() => { setViewState("history_list"); setActiveSession(null); }}
          disabled={viewState === "workspace"}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            viewState === "history_list"
              ? "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-[#4F46E5]/25 shadow-lg"
              : "text-slate-500 hover:text-slate-700 disabled:opacity-50"
          }`}
        >
          Session Logs ({historyList.length})
        </button>
      </div>

      {/* View router */}
      <div className="max-w-4xl mx-auto">
        
        {/* Onboarding selection view */}
        {viewState === "onboarding" && (
          <div className="bg-white backdrop-blur-md rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Configure Target Job Role
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Role */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="target-role" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Choose Career Track</label>
                  <select
                    id="target-role"
                    value={targetRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-violet-500 font-medium"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Custom skill adder */}
                <form onSubmit={handleAddCustomSkill} className="space-y-2">
                  <label htmlFor="custom-skill" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Add Custom Skill</label>
                  <div className="flex gap-2">
                    <input
                      id="custom-skill"
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="e.g. AWS, Next.js"
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 font-medium"
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-lg shadow-[#4F46E5]/25 text-xs px-3 py-2 rounded-xl font-bold transition-all"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Stack tags checklist */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Tailor Tech Stack ({selectedSkills.length} selected)</label>
                <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto p-2 bg-slate-50/40 rounded-xl border border-slate-200">
                  {Object.values(DEFAULT_SKILLS).flat().concat(selectedSkills).filter((v, i, self) => self.indexOf(v) === i).map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                          isSelected
                            ? "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-[#4F46E5]/25 shadow-sm border border-violet-500"
                            : "bg-[#4F46E5]/5 text-[#4F46E5] border border-[#4F46E5]/20 hover:bg-[#4F46E5]/10"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full py-4 bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-lg shadow-[#4F46E5]/25 font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-violet-500/10 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {starting ? "Generating tailored question banks..." : "Launch 15-Min Live Simulation"}
            </button>
          </div>
        )}

        {/* Active Session workspace */}
        {viewState === "workspace" && activeSession && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd space-y-6">
            
            {/* Header info / Timer */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-violet-500/10 text-violet-400 rounded-md border border-violet-500/20 uppercase tracking-widest">
                  Question {currentQuestionIndex + 1} of {activeSession.questions.length}
                </span>
                <h3 className="text-slate-500 text-[11px] font-semibold mt-1">Role: {activeSession.targetRole}</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl text-rose-400 font-mono text-sm font-bold shadow-sm">
                <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(secondsRemaining)}
              </div>
            </div>

            {/* Question Text block */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                {activeSession.questions[currentQuestionIndex].category} • {activeSession.questions[currentQuestionIndex].difficulty}
              </span>
              <p className="text-sm md:text-base font-bold text-slate-900 leading-relaxed">
                {activeSession.questions[currentQuestionIndex].questionText}
              </p>
            </div>

            {/* Answer Text Area */}
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="workspace-textarea" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Answer</label>
                  <span className={`text-[10px] font-bold ${
                    answerText.length >= 150 ? "text-emerald-400" :
                    answerText.length >= 50 ? "text-amber-400" :
                    "text-rose-400"
                  }`}>
                    {answerText.length} characters (Aim for 150+)
                  </span>
                </div>
                <textarea
                  id="workspace-textarea"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your response... (Be structured. Try using transition words: 'Firstly', 'However', 'For example' and relevant technical jargon.)"
                  rows={8}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-4 focus:outline-none focus:border-violet-500 text-sm leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAnswer}
                className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-slate-900 font-bold text-sm tracking-wide rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingAnswer ? (
                  <>
                    <div className="w-4 h-4 border-2 border-violet-200 border-t-transparent rounded-full animate-spin"></div>
                    Running SLA latency scoring check...
                  </>
                ) : (
                  currentQuestionIndex === activeSession.questions.length - 1 ? "Finish Interview & Compile Report" : "Submit Answer & Next Question"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Analytics Report view */}
        {viewState === "report" && (
          <div className="space-y-6">
            
            {loadingReport ? (
              <div className="bg-white backdrop-blur-md rounded-2xl border border-slate-200 p-12 text-center shadow-xl flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 text-sm">Compiling lexical data points...</p>
              </div>
            ) : sessionReport ? (
              <div className="space-y-6">
                
                {/* Score summary panel */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  
                  {/* Radial progress */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="45" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                        <circle
                          cx="56"
                          cy="56"
                          r="45"
                          stroke="#8b5cf6"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 45}
                          strokeDashoffset={(2 * Math.PI * 45) - ((sessionReport.overallScore || 0) / 100) * (2 * Math.PI * 45)}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-3xl font-extrabold text-slate-900">{sessionReport.overallScore}%</span>
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Overall</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">{sessionReport.targetRole}</span>
                  </div>

                  {/* Summary Feedback */}
                  <div className="md:col-span-2 space-y-3">
                    <h3 className="text-sm font-bold text-violet-400 uppercase tracking-widest">Qualitative Summary Feedback</h3>
                    <p className="text-slate-350 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                      {sessionReport.feedback}
                    </p>
                    <div className="flex gap-4 pt-2">
                      <button
                        onClick={() => { setViewState("onboarding"); setSessionReport(null); }}
                        className="text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-xl transition-all"
                      >
                        Try New Session
                      </button>
                    </div>
                  </div>

                </div>

                {/* Questions Accordion log */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question breakdowns</h3>
                  
                  <div className="space-y-3">
                    {sessionReport.questions?.map((item, idx) => (
                      <div key={item._id} className="bg-white border border-slate-100 rounded-2xl shadow-outcrowd overflow-hidden">
                        
                        {/* Summary panel */}
                        <div className="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                              Q{idx + 1} • {item.category} • {item.difficulty}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{item.questionText.slice(0, 75)}...</span>
                          </div>
                          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                            item.score >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                            item.score >= 50 ? "bg-amber-500/10 text-amber-400" :
                            "bg-rose-500/10 text-rose-400"
                          }`}>
                            {item.score || 0} pts
                          </span>
                        </div>

                        {/* Detail content */}
                        <div className="p-4 space-y-4">
                          {/* Answer */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Submitted Response</span>
                            <p className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded-lg leading-relaxed whitespace-pre-line border border-slate-200">
                              {item.userAnswer}
                            </p>
                          </div>

                          {/* Missing concept / Gaps */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Missing Concepts / Technical Gaps</span>
                            {item.missingConcepts?.length === 0 ? (
                              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                None! Keyword relevance satisfied completely.
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {item.missingConcepts?.map((concept) => (
                                  <span key={concept} className="text-[10px] text-rose-400 font-bold bg-rose-500/5 border border-rose-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    {concept}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Feedback */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Evaluator Assessment Notes</span>
                            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                              {item.feedback}
                            </p>
                          </div>

                        </div>

                      </div>
                    ))}
                  </div>

                </div>

              </div>
            ) : null}

          </div>
        )}

        {/* History list view */}
        {viewState === "history_list" && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span>Past Simulation Attempts</span>
              <span className="text-xs text-slate-500 font-semibold">{historyList.length} items logged</span>
            </h2>

            {loadingHistory ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : historyList.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500">No mock interviews completed yet</p>
                <button onClick={() => setViewState("onboarding")} className="mt-3 text-xs text-violet-400 font-bold hover:underline">
                  Launch first simulation
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 font-medium">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
                      <th className="pb-3 pt-2 pl-2">Session Date</th>
                      <th className="pb-3 pt-2">Target Role</th>
                      <th className="pb-3 pt-2">Status</th>
                      <th className="pb-3 pt-2 text-center">Score</th>
                      <th className="pb-3 pt-2 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {historyList.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/20 transition-all">
                        <td className="py-3.5 pl-2 text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 font-semibold text-slate-900">{item.targetRole}</td>
                        <td className="py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            item.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                            "bg-amber-500/10 text-amber-400"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          {item.overallScore !== undefined ? (
                            <span className="font-extrabold text-slate-900 text-xs bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                              {item.overallScore}%
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3.5 pr-2 text-right">
                          <button
                            onClick={() => handleViewReport(item._id)}
                            className="text-xs text-violet-400 hover:text-violet-300 font-bold underline transition-all"
                          >
                            Open Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default InterviewPortal;
