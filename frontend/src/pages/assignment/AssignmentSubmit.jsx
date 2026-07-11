import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assignmentService } from "../../services/assignment.service";
import { FiGithub, FiUpload, FiSend } from "react-icons/fi";
import toast from "react-hot-toast";

const AssignmentSubmit = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [textContent, setTextContent] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textContent.trim() && !githubLink.trim() && files.length === 0) {
      toast.error("Provide text, a GitHub link, or upload files");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("textContent", textContent);
      formData.append("githubLink", githubLink);
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await assignmentService.submit(assignmentId, formData);
      toast.success("Assignment submitted and evaluated!");
      navigate(`/assignments/${res.data.submissionId}/feedback`, {
        state: { result: res.data },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Submit Assignment</h1>
      <p className="text-slate-500 mb-8">Provide your solution via text, files, or a GitHub repository link</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
            Solution Text
          </label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={12}
            placeholder="Describe your approach, include code snippets, architecture decisions..."
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
            GitHub Repository
          </label>
          <div className="relative">
            <FiGithub className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="url"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
            Attach Files
          </label>
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
            <FiUpload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="hidden"
              id="assignment-files"
            />
            <label
              htmlFor="assignment-files"
              className="inline-block px-4 py-2 bg-slate-100 text-sm text-slate-600 rounded-xl cursor-pointer hover:bg-slate-200 transition-all"
            >
              Choose Files
            </label>
            {files.length > 0 && (
              <div className="mt-3 text-sm text-emerald-400">
                {files.map((f) => f.name).join(", ")}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white font-semibold rounded-2xl shadow-lg shadow-[#4F46E5]/25 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
        >
          <FiSend className="w-4 h-4" />
          {submitting ? "Evaluating..." : "Submit & Evaluate"}
        </button>
      </form>
    </div>
  );
};

export default AssignmentSubmit;
