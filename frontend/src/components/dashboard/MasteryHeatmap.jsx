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
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-3xl border border-slate-100 font-medium">
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
            className="relative p-5 bg-white border border-slate-100 rounded-3xl overflow-hidden group hover:border-[#4F46E5]/30 hover:shadow-outcrowd-hover transition-all duration-300"
          >
            <div
              className={`absolute inset-0 ${getColor(item.masteryScore)} transition-all`}
              style={{ opacity: getOpacity(item.masteryScore) * 0.08 }}
            />
            <div className="relative">
              <p className="text-[15px] font-bold text-slate-900 truncate mb-2">{item.topic}</p>
              <p className="text-3xl font-black text-slate-800">{item.masteryScore}%</p>
              <div className="flex gap-2 mt-3 text-[13px] font-medium text-slate-500">
                <span>Quiz: {item.quizAccuracy}%</span>
                <span>Assign: {item.assignmentScore}%</span>
              </div>
              <span
                className={`inline-block mt-3 px-3 py-1 text-xs font-bold rounded-full ${
                  item.risk === "high"
                    ? "bg-rose-100 text-rose-600"
                    : item.risk === "moderate"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {item.risk} risk
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-500 pt-2">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500/30" /> &lt;40%</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500/30" /> 40-65%</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-violet-500/30" /> 65-80%</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500/30" /> 80%+</span>
      </div>
    </div>
  );
};

export default MasteryHeatmap;
