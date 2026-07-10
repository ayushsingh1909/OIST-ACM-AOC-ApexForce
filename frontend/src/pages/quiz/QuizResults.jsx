import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiCheck, FiX, FiArrowLeft } from "react-icons/fi";

const QuizResults = () => {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results;

  if (!results) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 mb-4">Results not available for this attempt.</p>
        <button onClick={() => navigate("/quiz")} className="text-violet-400 hover:text-violet-300">
          Back to Quiz Dashboard
        </button>
      </div>
    );
  }

  const getAccuracyColor = (acc) => {
    if (acc >= 80) return "text-emerald-400";
    if (acc >= 60) return "text-violet-400";
    return "text-rose-400";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/quiz")}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-all"
      >
        <FiArrowLeft /> Back to Quizzes
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 mb-4">
          <span className={`text-4xl font-extrabold ${getAccuracyColor(results.accuracy)}`}>
            {results.accuracy}%
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Quiz Complete!</h1>
        <p className="text-slate-400">
          {results.correctCount} of {results.totalQuestions} questions correct
        </p>
      </div>

      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Topic-by-Topic Accuracy</h2>
        <div className="space-y-4">
          {results.topicBreakdown?.map((tb) => (
            <div key={tb.topic}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{tb.topic}</span>
                <span className={`font-semibold ${getAccuracyColor(tb.accuracy)}`}>
                  {tb.correct}/{tb.total} ({tb.accuracy}%)
                </span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    tb.accuracy >= 80
                      ? "bg-emerald-500"
                      : tb.accuracy >= 60
                        ? "bg-violet-500"
                        : "bg-rose-500"
                  }`}
                  style={{ width: `${tb.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">Question Review</h2>
        <div className="space-y-4">
          {results.questions?.map((q, i) => (
            <div
              key={q.questionId}
              className={`p-4 rounded-xl border ${
                q.isCorrect
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-rose-500/20 bg-rose-500/5"
              }`}
            >
              <div className="flex items-start gap-3">
                {q.isCorrect ? (
                  <FiCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <FiX className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm text-slate-500 mb-1">Q{i + 1} · {q.topic}</p>
                  <p className="text-white mb-2">{q.questionText}</p>
                  <p className="text-sm">
                    <span className="text-slate-500">Your answer: </span>
                    <span className={q.isCorrect ? "text-emerald-400" : "text-rose-400"}>
                      {q.userAnswer || "(no answer)"}
                    </span>
                  </p>
                  {!q.isCorrect && (
                    <p className="text-sm mt-1">
                      <span className="text-slate-500">Correct: </span>
                      <span className="text-emerald-400">{q.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/quiz")}
          className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all"
        >
          Take Another Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
