import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Predefined target roles matching backend dictionary
const TARGET_ROLES = [
  "Full-Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Backend Developer",
  "Frontend Developer",
  "Product Manager"
];

const ResumeIntelligence = () => {
  const { user } = useAuth();
  
  // State variables
  const [targetRole, setTargetRole] = useState("Full-Stack Developer");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [showTextArea, setShowTextArea] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch analysis history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get("/resume/history");
      if (response.data && response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setUploadedFile(file);
        setResumeText(""); // Clear text area if file is chosen
        toast.success(`PDF "${file.name}" staged successfully!`);
      } else {
        toast.error("Only PDF files are supported");
      }
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setUploadedFile(file);
        setResumeText(""); // Clear text area if file is chosen
        toast.success(`PDF "${file.name}" staged successfully!`);
      } else {
        toast.error("Only PDF files are supported");
      }
    }
  };

  // Submit Handler
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!uploadedFile && !resumeText.trim()) {
      toast.error("Please upload a PDF file or paste your resume text first.");
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      let response;
      if (uploadedFile) {
        // Multipart payload for file upload
        const formData = new FormData();
        formData.append("resume", uploadedFile);
        formData.append("targetRole", targetRole);

        response = await api.post("/resume/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      } else {
        // JSON payload for plain text resume
        response = await api.post("/resume/upload", {
          resumeText,
          targetRole
        });
      }

      if (response.data && response.data.success) {
        setAnalysisResult(response.data.data);
        toast.success("Resume analyzed successfully!");
        fetchHistory(); // Refresh history
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "An error occurred during resume analysis";
      toast.error(errMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setAnalysisResult(item);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  // Calculate circular SVG progress values
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((analysisResult?.strengthScore || 0) / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:py-12">
      {/* Header */}
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent tracking-tight bg-gradient-to-r from-[#4F46E5] via-indigo-500 to-[#00D2C4] bg-clip-text text-transparent">
          Resume Intelligence Module
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
          Evaluate your resume strength, map your skills to target roles, and discover critical gaps to boost your interview readiness.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form & History */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Target Role & Selection */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Select Target Role
            </h2>
            <div className="space-y-3">
              <label htmlFor="role-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Job Category</label>
              <select
                id="role-select"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload and Paste Area */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Input Resume
            </h2>

            {/* Drag & Drop PDF upload */}
            {!showTextArea ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver ? "border-violet-400 bg-violet-500/10" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="resume-file" className="cursor-pointer space-y-3 block">
                  <div className="mx-auto w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-500">
                    <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">Drag & drop resume PDF</span>
                    <p className="text-xs text-slate-500 mt-1">or click to browse from device</p>
                  </div>
                </label>
                
                {uploadedFile && (
                  <div className="mt-4 p-2 bg-violet-500/10 border border-violet-500/30 rounded-lg flex items-center justify-between text-left">
                    <span className="text-xs font-semibold text-violet-300 truncate max-w-[180px]">{uploadedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 px-2"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Collapsible Raw Text input
              <div className="space-y-2">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your plain text resume here (include Education, Skills, Projects, and Work Experience)..."
                  rows={8}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:outline-none focus:border-violet-500 text-xs transition-all font-mono leading-relaxed"
                />
                {resumeText && (
                  <button
                    type="button"
                    onClick={() => setResumeText("")}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                  >
                    Clear Text
                  </button>
                )}
              </div>
            )}

            {/* Expand / Collapse toggle */}
            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowTextArea(!showTextArea);
                  setUploadedFile(null);
                  setResumeText("");
                }}
                className="text-violet-400 hover:text-violet-300 font-semibold transition-all"
              >
                {showTextArea ? "← Upload PDF instead" : "Or Paste Plain Text Resume"}
              </button>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || (!uploadedFile && !resumeText.trim())}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg ${
                loading || (!uploadedFile && !resumeText.trim())
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200"
                  : "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-lg shadow-[#4F46E5]/25 shadow-violet-500/20 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-violet-200 border-t-transparent rounded-full animate-spin"></span>
                  Analyzing Resume...
                </span>
              ) : (
                "Scan & Analyze Resume"
              )}
            </button>
          </div>

          {/* History Sidebar */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scan History
              </span>
              <span className="text-xs text-slate-500 font-semibold">{history.length} runs</span>
            </h2>

            {loadingHistory ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500">No previous resume analysis scans</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                {history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleSelectHistoryItem(item)}
                    className="p-3 bg-slate-50 border border-slate-200 hover:border-violet-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.fileName || "Plain Text Scan"}</p>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{item.targetRole}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        item.strengthScore >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                        item.strengthScore >= 50 ? "bg-amber-500/10 text-amber-400" :
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        {item.strengthScore}
                      </span>
                      <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-all transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Processing & Analysis Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Loading Scanner Screen */}
          {loading && (
            <div className="bg-white backdrop-blur-md rounded-2xl border border-slate-200 p-12 text-center shadow-xl min-h-[450px] flex flex-col justify-center items-center space-y-6">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Scanner ring */}
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 border-t-violet-400 animate-spin"></div>
                {/* Dynamic radar scanner */}
                <div className="w-20 h-20 bg-gradient-to-tr from-violet-500 to-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-10 h-10 text-slate-900 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 animate-pulse">Running Resume Analyzer</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Extracting text buffers, matching keywords against target dictionary, evaluating project complexity and structure scores...
                </p>
              </div>
            </div>
          )}

          {/* Normal State: Welcome / Request Scan */}
          {!loading && !analysisResult && (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-outcrowd min-h-[500px] flex flex-col justify-center items-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500">
                <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Resume Loaded</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Stage a PDF resume or input plain text on the left, then trigger the scanner to see your comprehensive strength breakdown dashboard.
              </p>
            </div>
          )}

          {/* Active Dashboard */}
          {!loading && analysisResult && (
            <div className="space-y-6">
              
              {/* Score Meter & Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  
                  {/* Radial Progress Score */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl border border-slate-200 min-w-[180px]">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background track circle */}
                        <circle
                          cx="72"
                          cy="72"
                          r={radius}
                          className="stroke-slate-100"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Foreground animated progress stroke */}
                        <circle
                          cx="72"
                          cy="72"
                          r={radius}
                          stroke={`url(#gradient-${analysisResult.strengthScore})`}
                          strokeWidth="10"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id={`gradient-${analysisResult.strengthScore}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="50%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#22d3ee" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Text in the center */}
                      <div className="absolute text-center">
                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                          {analysisResult.strengthScore}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Strength</span>
                      </div>
                    </div>
                    <span className="mt-3 text-xs text-slate-500 text-center font-medium">
                      Target Role: <br />
                      <strong className="text-violet-400">{analysisResult.targetRole}</strong>
                    </span>
                  </div>

                  {/* Score Breakdown (Weights formula bars) */}
                  <div className="flex-1 w-full space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Metrics Breakdown</h3>
                    
                    {/* Skill Relevance */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Skill Relevance (40%)</span>
                        <span className="text-violet-400">{analysisResult.scoreBreakdown?.skillRelevance || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-violet-400 to-indigo-400 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${analysisResult.scoreBreakdown?.skillRelevance || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Project Depth */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Project Depth (30%)</span>
                        <span className="text-violet-400">{analysisResult.scoreBreakdown?.projectDepth || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-violet-400 to-indigo-400 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${analysisResult.scoreBreakdown?.projectDepth || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Experience Indicators */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Experience Indicators (20%)</span>
                        <span className="text-violet-400">{analysisResult.scoreBreakdown?.experienceIndicators || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-violet-400 to-indigo-400 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${analysisResult.scoreBreakdown?.experienceIndicators || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Structure Score */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Structure Score (10%)</span>
                        <span className="text-violet-400">{analysisResult.scoreBreakdown?.structureScore || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-violet-400 to-indigo-400 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${analysisResult.scoreBreakdown?.structureScore || 0}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* Skills Mapping: Extracted vs Missing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Extracted Skills */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Extracted Skills ({analysisResult.extractedSkills?.length || 0})
                  </h3>
                  {analysisResult.extractedSkills?.length === 0 ? (
                    <p className="text-xs text-slate-500">No skills recognized in resume text.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.extractedSkills?.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing Skills Warning Block */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Missing Skills Gaps ({analysisResult.missingSkills?.length || 0})
                  </h3>
                  {analysisResult.missingSkills?.length === 0 ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs text-emerald-400 font-semibold">Perfect alignment! All required standard skills detected.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingSkills?.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Recommendations & Dynamic Suggestions */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Resume Improvement Recommendations
                </h3>
                <ul className="space-y-3">
                  {analysisResult.improvementSuggestions?.map((suggestion, index) => (
                    <li key={index} className="flex gap-3 text-xs md:text-sm text-slate-600 leading-relaxed items-start p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                      <span className="flex-shrink-0 w-5 h-5 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                        !
                      </span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extracted Projects & Experiences details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Detected Projects Card list */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Detected Projects ({analysisResult.detectedProjects?.length || 0})
                  </h3>
                  {analysisResult.detectedProjects?.length === 0 ? (
                    <p className="text-xs text-slate-500">No project headings or details were identified.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {analysisResult.detectedProjects?.map((proj, idx) => (
                        <li key={idx} className="p-3 bg-slate-50/80 border border-slate-200 rounded-2xl flex items-center gap-3">
                          <span className="w-6 h-6 bg-violet-500/10 text-violet-400 rounded-lg flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs md:text-sm font-semibold text-slate-700">{proj}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Experience Indicators detail */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Experience Indicators
                    </h3>
                    <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-center space-y-2">
                      <div className="text-3xl font-extrabold text-violet-400">
                        {analysisResult.detectedExperienceYears} {analysisResult.detectedExperienceYears === 1 ? 'Year' : 'Years'}
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Extracted Experience Duration</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-4 leading-relaxed bg-slate-50/30 p-3 rounded-xl border border-slate-200/40">
                    Calculated by parsing career history, dates, or direct experience declarations. Max indicator points are achieved at 5+ years of experience.
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ResumeIntelligence;
