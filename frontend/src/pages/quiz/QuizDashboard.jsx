import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { quizService } from "../../services/quiz.service";
import { FiPlay, FiClock, FiTarget, FiTrendingUp } from "react-icons/fi";
import toast from "react-hot-toast";

const QuizDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          quizService.getStats(),
          quizService.getHistory(),
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data?.history || []);
      } catch {
        /* first visit */
      }
    };
    load();
  }, []);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await quizService.startQuiz();
      navigate(`/quiz/${res.data.attemptId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start quiz");
      setStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Adaptive Quiz Engine</h1>
        <p className="text-slate-400">Personalized questions based on your weaknesses and past mistakes</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <FiTrendingUp className="w-6 h-6 text-violet-400 mb-2" />
          <p className="text-2xl font-bold text-white">{stats?.avgAccuracy ?? 0}%</p>
          <p className="text-xs text-slate-500">Avg Accuracy</p>
        </div>
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <FiTarget className="w-6 h-6 text-indigo-400 mb-2" />
          <p className="text-2xl font-bold text-white">{stats?.totalAttempts ?? 0}</p>
          <p className="text-xs text-slate-500">Quizzes Taken</p>
        </div>
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <FiClock className="w-6 h-6 text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">15 min</p>
          <p className="text-xs text-slate-500">Time Limit</p>
        </div>
      </div>

      <div className="p-8 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 rounded-2xl mb-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Ready for your adaptive quiz?</h2>
        <p className="text-slate-400 mb-6 text-sm">10 questions tailored to your weak topics and difficulty level</p>
        <button
          onClick={handleStart}
          disabled={starting}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
        >
          <FiPlay className="w-5 h-5" />
          {starting ? "Generating..." : "Start Quiz"}
        </button>
      </div>

      {stats?.topicAccuracy?.length > 0 && (
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Topic Accuracy</h3>
          <div className="space-y-3">
            {stats.topicAccuracy.map((t) => (
              <div key={t.topic}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{t.topic}</span>
                  <span className="text-violet-400 font-medium">{t.accuracy}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${t.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Quizzes</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((q) => (
              <Link
                key={q._id}
                to={`/quiz/${q._id}/results`}
                className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-violet-500/30 transition-all"
              >
                <div>
                  <p className="text-sm text-white">{new Date(q.completedAt).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500">{q.correctCount}/{q.totalQuestions} correct</p>
                </div>
                <span className="text-lg font-bold text-violet-400">{q.accuracy}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDashboard;
