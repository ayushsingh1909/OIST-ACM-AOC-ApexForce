import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const ASSIGNMENT_TYPES = ["Coding", "Mini Project", "Case Study", "Analytical", "Debugging", "System Design"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const Assignments = () => {
  // Navigation & Listing States
  const [activeTab, setActiveTab] = useState("pending"); // pending, completed, generate
  const [assignments, setAssignments] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Generator Panel States
  const [genTopic, setGenTopic] = useState("");
  const [genType, setGenType] = useState("Coding");
  const [genDiff, setGenDiff] = useState("Medium");
  const [generating, setGenerating] = useState(false);

  // Submission Workspace States
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionMode, setSubmissionMode] = useState("Code"); // Code, File, Text, GitHub
  const [codeContent, setCodeContent] = useState("");
  const [textContent, setTextContent] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Feedback Screen States
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoadingList(true);
    try {
      const response = await api.get("/assignments");
      if (response.data && response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load assignments");
      console.error(error);
    } finally {
      setLoadingList(false);
    }
  };

  // Generate Assignment
  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const payload = {
        assignmentType: genType,
        difficulty: genDiff
      };
      if (genTopic.trim()) {
        payload.topicName = genTopic.trim();
      }

      const response = await api.post("/assignments/generate", payload);
      if (response.data && response.data.success) {
        toast.success("New assignment generated successfully!");
        setGenTopic("");
        fetchAssignments();
        setActiveTab("pending"); // Switch to pending list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate assignment");
    } finally {
      setGenerating(false);
    }
  };

  // Submit Assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    // Validate inputs based on mode
    if (submissionMode === "Code" && !codeContent.trim()) {
      toast.error("Please write some code in the editor workspace");
      return;
    }
    if (submissionMode === "Text" && !textContent.trim()) {
      toast.error("Please write your text solution first");
      return;
    }
    if (submissionMode === "GitHub" && (!githubLink.trim() || !githubLink.includes("github.com"))) {
      toast.error("Please enter a valid GitHub repository URL");
      return;
    }
    if (submissionMode === "File" && !uploadedFile) {
      toast.error("Please select or drag-and-drop a ZIP or PDF file");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (submissionMode === "File") {
        const formData = new FormData();
        formData.append("submissionMode", "File");
        formData.append("file", uploadedFile);
        
        response = await api.post(`/assignments/${selectedAssignment._id}/submit`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        const payload = {
          submissionMode,
          content: submissionMode === "Code" ? codeContent : textContent,
          githubLink: submissionMode === "GitHub" ? githubLink : undefined
        };
        response = await api.post(`/assignments/${selectedAssignment._id}/submit`, payload);
      }

      if (response.data && response.data.success) {
        toast.success("Assignment submitted and evaluated successfully!");
        
        // Save evaluation data for feedback view
        setEvaluationReport(response.data.data);
        setShowFeedbackModal(true);

        // Reset workspace
        setSelectedAssignment(null);
        setCodeContent("");
        setTextContent("");
        setGithubLink("");
        setUploadedFile(null);

        fetchAssignments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit assignment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Drag & Drop File Handlers
  const [dragOver, setDragOver] = useState(false);
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => {
    setDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validTypes = ["application/zip", "application/x-zip-compressed", "application/pdf"];
      if (validTypes.includes(file.type) || file.name.endsWith(".zip") || file.name.endsWith(".pdf")) {
        setUploadedFile(file);
        toast.success(`Staged file: ${file.name}`);
      } else {
        toast.error("Only ZIP or PDF files are supported");
      }
    }
  };

  const pendingList = assignments.filter((a) => a.status === "pending");
  const completedList = assignments.filter((a) => a.status === "completed");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:py-12">
      
      {/* Header */}
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#4F46E5] via-indigo-500 to-[#00D2C4] bg-clip-text text-transparent">
          Adaptive Assignment Workspace
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">
          Accelerate your skills by tackling specialized coding tasks, system designs, case studies, or projects generated for your needs.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border border-slate-200 mb-8 max-w-md mx-auto justify-center bg-slate-50 rounded-xl p-1.5">
        <button
          onClick={() => { setActiveTab("pending"); setSelectedAssignment(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "pending"
              ? "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-lg shadow-[#4F46E5]/25"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          Active Assignments ({pendingList.length})
        </button>
        <button
          onClick={() => { setActiveTab("completed"); setSelectedAssignment(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "completed"
              ? "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-lg shadow-[#4F46E5]/25"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          History ({completedList.length})
        </button>
        <button
          onClick={() => { setActiveTab("generate"); setSelectedAssignment(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "generate"
              ? "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-lg shadow-[#4F46E5]/25"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          Request Assignment
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Category List */}
        <div className="lg:col-span-1">
          {activeTab === "generate" ? (
            /* Generate Request Panel */
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd space-y-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Configure Assignment
              </h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="topic" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Focus Topic</label>
                  <input
                    id="topic"
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder="e.g. React Hooks, SQL Joins (or leave blank to auto-detect weakest)"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-violet-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="type" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Assessment Type</label>
                  <select
                    id="type"
                    value={genType}
                    onChange={(e) => setGenType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-violet-500 font-medium"
                  >
                    {ASSIGNMENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="diff" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Initial Difficulty</label>
                  <select
                    id="diff"
                    value={genDiff}
                    onChange={(e) => setGenDiff(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-violet-500 font-medium"
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={generating}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg ${
                    generating
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-[#4F46E5]/25 active:scale-[0.98]"
                  }`}
                >
                  {generating ? "Generating..." : "Generate AI Assignment"}
                </button>
              </form>
            </div>
          ) : (
            /* Assignment Lists Tab (Pending or Completed) */
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                <span>{activeTab === "pending" ? "Active Tasks" : "Graded Workspace"}</span>
                <span className="text-xs text-slate-500 font-semibold">
                  {activeTab === "pending" ? pendingList.length : completedList.length} items
                </span>
              </h2>

              {loadingList ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : activeTab === "pending" ? (
                /* Active / Pending list */
                pendingList.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-500">No active assignments remaining</p>
                    <button onClick={() => setActiveTab("generate")} className="mt-3 text-xs text-violet-400 font-bold hover:underline">
                      Create one now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {pendingList.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => setSelectedAssignment(item)}
                        className={`p-4 bg-slate-50 border rounded-xl cursor-pointer transition-all ${
                          selectedAssignment?._id === item._id
                            ? "border-violet-500 bg-violet-50/50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          item.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                          item.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                          "bg-rose-500/10 text-rose-400"
                        }`}>
                          {item.difficulty}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900 mt-2 truncate">{item.title}</h3>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5">
                          <span>Focus: {item.topicName}</span>
                          <span className="font-semibold text-slate-500">{item.assignmentType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Completed List */
                completedList.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-500">No completed assignments found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {completedList.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => {
                          setEvaluationReport({
                            status: "completed",
                            submission: item.submission,
                            evaluation: item.evaluation,
                            masteryUpdate: {
                              topicName: item.topicName,
                              oldMasteryScore: 0, // Mock history values
                              newMasteryScore: item.evaluation?.score || 0
                            }
                          });
                          setShowFeedbackModal(true);
                        }}
                        className="p-4 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-violet-500 transition-all">{item.title}</h3>
                          <span className="text-[10px] text-slate-500 block mt-1">Topic: {item.topicName} | {item.assignmentType}</span>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-1.5">
                          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                            item.evaluation?.score >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                            item.evaluation?.score >= 50 ? "bg-amber-500/10 text-amber-400" :
                            "bg-rose-500/10 text-rose-400"
                          }`}>
                            {item.evaluation?.score || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Right Side: Submission & Workspace */}
        <div className="lg:col-span-2">
          
          {/* Workspace Area */}
          {selectedAssignment ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-outcrowd space-y-6">
              
              {/* Assignment Details */}
              <div className="border-b border-slate-200 pb-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-md border border-violet-500/20">{selectedAssignment.assignmentType}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    selectedAssignment.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                    selectedAssignment.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                    "bg-rose-500/10 text-rose-400"
                  }`}>{selectedAssignment.difficulty}</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-snug">{selectedAssignment.title}</h2>
                <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono leading-relaxed whitespace-pre-line">
                  <strong className="text-slate-600 block mb-1 underline">Problem Description:</strong>
                  {selectedAssignment.problemStatement}
                </div>
              </div>

              {/* Submission Mode Selectors */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Submission Mode</h3>
                
                <div className="flex flex-wrap gap-2">
                  {["Code", "Text", "GitHub", "File"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSubmissionMode(mode)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        submissionMode === mode
                          ? "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white border-transparent shadow-md"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {mode === "Code" && "Embedded Code"}
                      {mode === "Text" && "Text Answer"}
                      {mode === "GitHub" && "GitHub Repo URL"}
                      {mode === "File" && "File Upload (ZIP/PDF)"}
                    </button>
                  ))}
                </div>

                {/* Submission Inputs */}
                <div className="mt-4">
                  
                  {/* Code input */}
                  {submissionMode === "Code" && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-xs">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-slate-500 text-[10px] font-bold">
                        <span>EMBEDDED CODE EDITOR MOCKUP</span>
                        <span>JavaScript (ES6)</span>
                      </div>
                      <div className="flex bg-white min-h-[250px]">
                        {/* Mock line numbers */}
                        <div className="bg-slate-50 px-2 py-3 border-r border-slate-200 text-slate-400 text-right select-none w-10">
                          {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>
                        <textarea
                          value={codeContent}
                          onChange={(e) => setCodeContent(e.target.value)}
                          placeholder="// Write your code implementation here..."
                          className="flex-1 bg-transparent text-slate-900 p-3 outline-none resize-none leading-relaxed custom-scrollbar font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Text input */}
                  {submissionMode === "Text" && (
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Write your long-form text answer, case study breakdown, or analysis report here..."
                      rows={10}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-4 focus:outline-none focus:border-violet-500 text-xs font-mono leading-relaxed"
                    />
                  )}

                  {/* GitHub input */}
                  {submissionMode === "GitHub" && (
                    <div className="space-y-1">
                      <label htmlFor="git-url" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">GitHub Repository Link</label>
                      <input
                        id="git-url"
                        type="url"
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                        placeholder="https://github.com/username/repository"
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-violet-500 font-mono"
                      />
                    </div>
                  )}

                  {/* File Upload input */}
                  {submissionMode === "File" && (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        dragOver ? "border-violet-400 bg-violet-500/10" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="file"
                        id="zip-file"
                        accept=".zip,.pdf"
                        onChange={(e) => {
                          if (e.target.files.length > 0) setUploadedFile(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                      <label htmlFor="zip-file" className="cursor-pointer space-y-3 block">
                        <div className="mx-auto w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-500">
                          <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-900">Drag & drop project ZIP / PDF</span>
                          <p className="text-xs text-slate-500 mt-1">or browse files from device</p>
                        </div>
                      </label>
                      
                      {uploadedFile && (
                        <div className="mt-4 p-2 bg-violet-500/10 border border-violet-500/30 rounded-lg flex items-center justify-between text-left max-w-sm mx-auto">
                          <span className="text-xs font-semibold text-violet-600 truncate pr-2">{uploadedFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setUploadedFile(null)}
                            className="text-xs font-bold text-rose-400 hover:text-rose-300"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg ${
                  submitting
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-[#4F46E5]/25 active:scale-[0.98]"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-violet-200 border-t-transparent rounded-full animate-spin"></span>
                    Evaluating submission logic...
                  </span>
                ) : (
                  "Submit Deliverables to AI Engine"
                )}
              </button>

            </div>
          ) : (
            /* Idle workspace placeholder */
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-outcrowd min-h-[500px] flex flex-col justify-center items-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500">
                <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Interactive Workspace</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Select an active assignment from the list on the left to review its prompt, configure your submission mode, and send your code/deliverables for AI validation.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Evaluation Feedback Modal */}
      {showFeedbackModal && evaluationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 custom-scrollbar">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  AI Evaluation Report
                </h3>
                <span className="text-xs text-slate-500 mt-1 block">Topic Focus: {evaluationReport.masteryUpdate?.topicName}</span>
              </div>
              <button
                onClick={() => { setShowFeedbackModal(false); setEvaluationReport(null); }}
                className="text-slate-500 hover:text-slate-900 text-xs font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
              >
                Close Report
              </button>
            </div>

            {/* Score Ring & Mastery updates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              
              {/* Score circle */}
              <div className="flex flex-col items-center justify-center py-2">
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
                      strokeDashoffset={(2 * Math.PI * 45) - ((evaluationReport.evaluation?.score || 0) / 100) * (2 * Math.PI * 45)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold text-slate-900">{evaluationReport.evaluation?.score}</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Score</span>
                  </div>
                </div>
              </div>

              {/* Mastery recalculation metrics */}
              <div className="flex flex-col justify-center space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Learning Profile Update</h4>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Topic Mastery progression</span>
                  <span className="text-violet-400">
                    {evaluationReport.masteryUpdate?.oldMasteryScore}% → {evaluationReport.masteryUpdate?.newMasteryScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Overall risk assessment</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    evaluationReport.masteryUpdate?.newRiskLevel === "low" ? "bg-emerald-500/10 text-emerald-400" :
                    evaluationReport.masteryUpdate?.newRiskLevel === "moderate" ? "bg-amber-500/10 text-amber-400" :
                    "bg-rose-500/10 text-rose-400"
                  }`}>
                    {evaluationReport.masteryUpdate?.newRiskLevel || "high"}
                  </span>
                </div>
              </div>

            </div>

            {/* Concept Coverage Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Concept Coverage Report</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {evaluationReport.evaluation?.conceptCoverage?.map((concept) => (
                  <div
                    key={concept._id || concept.concept}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <span className="text-xs text-slate-600 font-semibold">{concept.concept}</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                      concept.covered
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {concept.covered ? "✓" : "✗"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mistake breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categorized Mistake Breakdown</h4>
              {evaluationReport.evaluation?.mistakeBreakdown?.length === 0 ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-xs text-emerald-400 font-semibold">No critical execution mistakes detected in this run.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {evaluationReport.evaluation?.mistakeBreakdown?.map((mistake) => (
                    <div key={mistake._id || mistake.category} className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex flex-col gap-1">
                      <span className="text-xs font-bold text-rose-400">{mistake.category}</span>
                      <p className="text-xs text-slate-500 leading-relaxed">{mistake.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Improvement Recommendations list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Actionable Improvement Suggestions</h4>
              <ul className="space-y-2">
                {evaluationReport.evaluation?.improvementSuggestions?.map((suggestion, idx) => (
                  <li key={idx} className="flex gap-2 text-xs md:text-sm text-slate-600 leading-relaxed items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Assignments;
