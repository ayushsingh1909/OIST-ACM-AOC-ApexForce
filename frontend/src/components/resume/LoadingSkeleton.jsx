const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col items-center gap-4">
      <div className="w-44 h-44 rounded-full bg-slate-200" />
      <div className="h-6 w-48 bg-slate-200 rounded-lg" />
      <div className="h-4 w-64 bg-slate-200 rounded-lg" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-slate-200 rounded-xl" />
      ))}
    </div>
    <div className="space-y-3">
      <div className="h-4 w-full bg-slate-200 rounded" />
      <div className="h-4 w-5/6 bg-slate-200 rounded" />
      <div className="h-4 w-4/6 bg-slate-200 rounded" />
    </div>
    <p className="text-center text-sm text-violet-400 font-medium">
      Analyzing resume — extracting skills, projects, and experience...
    </p>
  </div>
);

export default LoadingSkeleton;
