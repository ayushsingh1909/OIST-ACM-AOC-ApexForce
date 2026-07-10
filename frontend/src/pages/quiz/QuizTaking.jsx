import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizService } from "../../services/quiz.service";
import { FiFlag, FiChevronLeft, FiChevronRight, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";

const QuizTaking = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quizService.getAttempt(attemptId);
        const data = res.data;
        setAttempt(data);
        setTimeLeft(data.timeLimitMinutes * 60);

        const initialAnswers = {};
        const initialFlags = {};
        for (const q of data.questions) {
          initialAnswers[q.questionId] = q.userAnswer || "";
          initialFlags[q.questionId] = q.isFlagged || false;
        }
        setAnswers(initialAnswers);
        setFlagged(initialFlags);
      } catch (err) {
        toast.error("Failed to load quiz");
        navigate("/quiz");
      }
    };
    load();
  }, [attemptId, navigate]);

  const handleSubmit = useCallback(async () => {
    if (submitting || !attempt) return;
    setSubmitting(true);
    try {
      for (const q of attempt.questions) {
        await quizService.saveAnswer(attemptId, {
          questionId: q.questionId,
          userAnswer: answers[q.questionId] || "",
          isFlagged: flagged[q.questionId],
        });
      }
      const res = await quizService.submitQuiz(attemptId);
      navigate(`/quiz/${attemptId}/results`, { state: { results: res.data } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Submit failed");
      setSubmitting(false);
    }
  }, [attempt, attemptId, answers, flagged, navigate, submitting]);

  useEffect(() => {
    if (!attempt || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [attempt, handleSubmit]);

  const saveAnswer = useCallback(async (questionId, userAnswer, isFlagged) => {
    try {
      await quizService.saveAnswer(attemptId, { questionId, userAnswer, isFlagged });
    } catch {
      /* silent — will save on submit */
    }
  }, [attemptId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    saveAnswer(questionId, value, flagged[questionId]);
  };

  const toggleFlag = (questionId) => {
    const newFlag = !flagged[questionId];
    setFlagged((prev) => ({ ...prev, [questionId]: newFlag }));
    saveAnswer(questionId, answers[questionId], newFlag);
  };

  if (!attempt) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const question = attempt.questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 120;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiClock className={`w-5 h-5 ${isUrgent ? "text-rose-400" : "text-slate-400"}`} />
          <span className={`text-xl font-mono font-bold ${isUrgent ? "text-rose-400" : "text-white"}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
        <span className="text-sm text-slate-400">
          Question {currentIndex + 1} of {attempt.questions.length}
        </span>
      </div>

      <div className="h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"
          style={{ width: `${((currentIndex + 1) / attempt.questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="px-2 py-1 text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg">
            {question.topic} · {question.difficulty}
          </span>
          <button
            onClick={() => toggleFlag(question.questionId)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-all ${
              flagged[question.questionId]
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "text-slate-500 hover:text-amber-400"
            }`}
          >
            <FiFlag className="w-3 h-3" />
            {flagged[question.questionId] ? "Flagged" : "Flag for Review"}
          </button>
        </div>

        <p className="text-lg text-white mb-6 leading-relaxed">{question.questionText}</p>

        {question.type === "short-answer" ? (
          <input
            type="text"
            value={answers[question.questionId] || ""}
            onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        ) : (
          <div className="space-y-2">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswerChange(question.questionId, opt)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  answers[question.questionId] === opt
                    ? "border-violet-500 bg-violet-500/10 text-white"
                    : "border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {attempt.questions.map((q, i) => (
          <button
            key={q.questionId}
            onClick={() => setCurrentIndex(i)}
            className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all ${
              i === currentIndex
                ? "bg-violet-600 text-white"
                : answers[q.questionId]
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : flagged[q.questionId]
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-slate-800 text-slate-500"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
        >
          <FiChevronLeft /> Previous
        </button>

        {currentIndex < attempt.questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="flex items-center gap-1 px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
          >
            Next <FiChevronRight />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTaking;
