const MasteryHeatmap = ({ data = [] }) => {
  const getColor = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 65) return "bg-violet-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getOpacity = (score) => {
    return Math.max(0.3, score / 100);
  };

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-2xl">
        Complete quizzes and assignments to build your mastery heatmap
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {data.map((item) => (
          <div
            key={item.topic}
            className="relative p-4 bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden group hover:border-violet-500/30 transition-all"
          >
            <div
              className={`absolute inset-0 ${getColor(item.masteryScore)} transition-all`}
              style={{ opacity: getOpacity(item.masteryScore) * 0.15 }}
            />
            <div className="relative">
              <p className="text-sm font-semibold text-white truncate mb-2">{item.topic}</p>
              <p className="text-2xl font-bold text-white">{item.masteryScore}%</p>
              <div className="flex gap-2 mt-2 text-xs text-slate-500">
                <span>Quiz: {item.quizAccuracy}%</span>
                <span>Assign: {item.assignmentScore}%</span>
              </div>
              <span
                className={`inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                  item.risk === "high"
                    ? "bg-rose-500/10 text-rose-400"
                    : item.risk === "moderate"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {item.risk} risk
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/40" /> &lt;40%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/40" /> 40-65%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-500/40" /> 65-80%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/40" /> 80%+</span>
      </div>
    </div>
  );
};

export default MasteryHeatmap;
