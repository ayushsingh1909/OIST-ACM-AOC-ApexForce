import { useState, useCallback } from "react";
import { FiUploadCloud, FiFileText, FiCheck, FiX } from "react-icons/fi";
import ScoreGauge from "./ScoreGauge";
import LoadingSkeleton from "./LoadingSkeleton";
import { resumeService } from "../../services/resume.service";
import toast from "react-hot-toast";

const TARGET_ROLES = [
  "Full-Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
];

const ResumeUpload = () => {
  const [mode, setMode] = useState("upload");
  const [targetRole, setTargetRole] = useState("Full-Stack Developer");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await resumeService.getHistory();
      setHistory(res.data || []);
    } catch {
      /* history optional on first visit */
    }
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      let response;
      if (mode === "upload" && file) {
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("targetRole", targetRole);
        response = await resumeService.upload(formData);
      } else if (mode === "text" && resumeText.trim()) {
        response = await resumeService.uploadText(resumeText, targetRole);
      } else {
        toast.error("Please upload a PDF or paste resume text");
        setLoading(false);
        return;
      }
      setResult(response.data);
      toast.success("Resume analyzed successfully!");
      loadHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
      setMode("upload");
    } else {
      toast.error("Only PDF files are supported");
    }
  };

  const breakdownLabels = {
    skillRelevance: "Skill Relevance",
    projectDepth: "Project Depth",
    experienceIndicators: "Experience",
    structureScore: "Structure",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Resume Intelligence</h1>
        <p className="text-slate-400">Upload your resume for AI-powered scoring and personalized feedback</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="flex gap-2 mb-4">
            {["upload", "text"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                  mode === m
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {m === "upload" ? "PDF Upload" : "Paste Text"}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Target Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {mode === "upload" ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging ? "border-violet-500 bg-violet-500/5" : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <FiUploadCloud className="w-12 h-12 mx-auto text-slate-500 mb-3" />
              <p className="text-slate-300 font-medium mb-1">Drop your PDF resume here</p>
              <p className="text-xs text-slate-500 mb-4">or click to browse (max 5MB)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="resume-file"
              />
              <label
                htmlFor="resume-file"
                className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 rounded-lg cursor-pointer transition-all"
              >
                Browse Files
              </label>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-400">
                  <FiCheck className="w-4 h-4" /> {file.name}
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={10}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
            />
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl min-h-[400px]">
          {loading ? (
            <LoadingSkeleton />
          ) : result ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <ScoreGauge score={result.strengthScore} />
                <p className="mt-3 text-lg font-semibold text-white">Resume Strength Score</p>
                <p className="text-sm text-slate-400">Target: {result.targetRole}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(result.scoreBreakdown || {}).map(([key, value]) => (
                  <div key={key} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase">{breakdownLabels[key] || key}</p>
                    <p className="text-xl font-bold text-white">{value}%</p>
                  </div>
                ))}
              </div>

              {result.missingSkills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-rose-400 mb-2">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill) => (
                      <span key={skill} className="px-2 py-1 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.extractedSkills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2">Detected Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.extractedSkills.map((skill) => (
                      <span key={skill} className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.improvementSuggestions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-violet-400 mb-2">Suggestions</h3>
                  <ul className="space-y-2">
                    {result.improvementSuggestions.map((s, i) => (
                      <li key={i} className="text-sm text-slate-300 flex gap-2">
                        <span className="text-violet-400">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <FiFileText className="w-16 h-16 mb-4 opacity-30" />
              <p>Upload or paste your resume to see analysis results</p>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4">Analysis History</h2>
          <div className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                <div>
                  <p className="text-sm font-medium text-white">{item.fileName}</p>
                  <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()} · {item.targetRole}</p>
                </div>
                <span className="text-lg font-bold text-violet-400">{item.strengthScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
