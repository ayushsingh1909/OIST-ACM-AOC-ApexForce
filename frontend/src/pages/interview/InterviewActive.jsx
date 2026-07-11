import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiClock, FiCheckSquare, FiAlertCircle, FiChevronRight } from "react-icons/fi";
import interviewService from "../../services/interview.service";

const InterviewActive = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [saveStatus, setSaveStatus] = useState("Draft saved");

  // Refs
  const timerRef = useRef(null);
  const totalTimeSpentRef = useRef(0);
  const timeLimitRef = useRef(0);

  // Load session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await interviewService.getSession(id);
        if (response.success) {
          const sessData = response.data;
          
          if (sessData.status === "Completed") {
            toast.success("This interview session is already completed!");
            navigate(`/interview/session/${id}/report`);
            return;
          }

          setSession(sessData);
          timeLimitRef.current = sessData.timeLimitPerQuestion;
          
          // Load draft from localStorage if exists
          const draftKey = `interview_draft_${id}_q${sessData.currentQuestionIndex}`;
          const savedDraft = localStorage.getItem(draftKey);
          if (savedDraft) {
            setAnswerText(savedDraft);
          } else {
            setAnswerText("");
          }

          resetTimer(sessData.timeLimitPerQuestion);
        }
      } catch (err) {
        toast.error("Failed to load interview session details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Handle draft auto-saving to localStorage
  useEffect(() => {
    if (!session) return;
    const draftKey = `interview_draft_${id}_q${session.currentQuestionIndex}`;
    
    setSaveStatus("Saving...");
    const timeout = setTimeout(() => {
      localStorage.setItem(draftKey, answerText);
      setSaveStatus("Draft saved");
    }, 800);

    return () => clearTimeout(timeout);
  }, [answerText, session, id]);

  const resetTimer = (limitSeconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setTimeSpent(0);
    totalTimeSpentRef.current = 0;

    if (limitSeconds > 0) {
      setTimeLeft(limitSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit answer on timer expiration
            handleAutoSubmit();
            return 0;
          }
          totalTimeSpentRef.current += 1;
          setTimeSpent(totalTimeSpentRef.current);
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(0);
      timerRef.current = setInterval(() => {
        totalTimeSpentRef.current += 1;
        setTimeSpent(totalTimeSpentRef.current);
      }, 1000);
    }
  };

  const handleAutoSubmit = () => {
    toast.error("Time expired! Automatically submitting your answer.", { duration: 4000 });
    submitCurrentAnswer(true);
  };

  const submitCurrentAnswer = async (isAuto = false) => {
    if (submitting) return;
    setSubmitting(true);

    const cleanAnswer = answerText.trim();
    if (!isAuto && !cleanAnswer) {
      toast.error("Please enter your answer before proceeding.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await interviewService.submitAnswer(id, {
        answerText: cleanAnswer,
        timeSpent: totalTimeSpentRef.current
      });

      if (response.success) {
        // Clear draft from localStorage
        const draftKey = `interview_draft_${id}_q${session.currentQuestionIndex}`;
        localStorage.removeItem(draftKey);

        const nextIndex = response.data.nextQuestionIndex;
        const sessionStatus = response.data.sessionStatus;

        if (sessionStatus === "Evaluating" || nextIndex >= session.questions.length) {
          // Go to complete
          handleCompleteSession();
        } else {
          // Progress to next question
          setSession((prev) => ({
            ...prev,
            currentQuestionIndex: nextIndex
          }));
          setAnswerText("");
          resetTimer(timeLimitRef.current);
          toast.success("Response recorded!");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred submitting your answer.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSession = async () => {
    setLoading(true);
    try {
      const response = await interviewService.completeSession(id);
      if (response.success) {
        toast.success("Interview completed! Generating evaluation report...");
        navigate(`/interview/session/${id}/report`);
      }
    } catch (err) {
      toast.error("Failed to compile final evaluation.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const wordCount = answerText ? answerText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = answerText ? answerText.length : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500">Loading interview session details...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <FiAlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Session Not Found</h2>
        <p className="text-slate-500 mb-4">The requested interview session could not be fetched.</p>
        <button onClick={() => navigate("/interview")} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-[#4F46E5]/25 font-semibold">
          Return to Onboarding
        </button>
      </div>
    );
  }

  const activeQuestion = session.questions[session.currentQuestionIndex];

  // Progress calculations
  const progressPercent = Math.round(((session.currentQuestionIndex) / session.questions.length) * 100);

  // Time formatter
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Session Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <span>Simulation Progress</span>
          <span>Question {session.currentQuestionIndex + 1} of {session.questions.length}</span>
        </div>
        <div className="w-full h-1.5 bg-white border border-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent === 0 ? 10 : progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Main Work Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Question Card */}
          <div className="p-6 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                {activeQuestion.vertical} Category
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                activeQuestion.difficulty === "Easy" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                activeQuestion.difficulty === "Medium" ? "border-amber-500/20 bg-amber-500/10 text-amber-400" :
                "border-rose-500/20 bg-rose-500/10 text-rose-400"
              }`}>
                {activeQuestion.difficulty}
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed">
              {activeQuestion.questionText}
            </h3>
          </div>

          {/* Textarea Answer Pad */}
          <div className="relative p-6 bg-slate-50 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl flex flex-col min-h-[350px]">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Answer Input Pad
              </label>
              <span className={`text-xs transition-colors ${saveStatus === "Saving..." ? "text-violet-400" : "text-slate-500"}`}>
                {saveStatus}
              </span>
            </div>
            
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={submitting}
              placeholder="Provide your detailed conceptual or architectural response here. Include code keywords, method parameters, and explanations where applicable..."
              className="flex-1 w-full bg-transparent border-0 resize-none text-slate-900 placeholder-slate-650 text-sm md:text-base leading-relaxed focus:ring-0 focus:outline-none min-h-[220px]"
            />

            {/* Bottom Bar inside Textarea */}
            <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-4 mt-4">
              <div className="flex gap-4 text-xs font-semibold text-slate-500">
                <span>Words: <strong className="text-slate-350">{wordCount}</strong></span>
                <span>Characters: <strong className="text-slate-350">{charCount}</strong></span>
              </div>
              <button
                onClick={() => submitCurrentAnswer(false)}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 text-slate-900 text-sm font-bold shadow-lg shadow-violet-600/10 transition-all cursor-pointer group"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Recording...
                  </>
                ) : (
                  <>
                    {session.currentQuestionIndex === session.questions.length - 1 ? "Submit & Complete" : "Save & Continue"}
                    <FiChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info & Timer */}
        <div className="space-y-6">
          {/* Timer Card */}
          <div className="p-6 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl text-center shadow-xl">
            <FiClock className="w-7 h-7 text-violet-400 mx-auto mb-3" />
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {timeLimitRef.current > 0 ? "Remaining Time" : "Time Elapsed"}
            </div>
            <div className={`text-2xl md:text-3xl font-extrabold font-mono tracking-tight transition-colors ${
              timeLimitRef.current > 0 && timeLeft < 20 ? "text-rose-500 animate-pulse" : "text-slate-900"
            }`}>
              {timeLimitRef.current > 0 ? formatTime(timeLeft) : formatTime(timeSpent)}
            </div>
            {timeLimitRef.current > 0 && (
              <p className="text-[10px] text-slate-500 mt-2">
                Answer will auto-submit when the countdown reaches 0:00.
              </p>
            )}
          </div>

          {/* Tips Card */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-455 space-y-3 leading-relaxed">
            <h4 className="font-bold text-slate-350 flex items-center gap-1">
              <FiCheckSquare className="text-violet-400" /> Evaluation Tips
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-500">
              <li>Use domain-specific vocabulary associated with the question.</li>
              <li>Address structural details, methods, and trade-offs to boost depth scores.</li>
              <li>Ensure clear formatting by breaking your answer into logical paragraphs.</li>
              <li>Practice state-saving checks if you lose internet connection.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewActive;
