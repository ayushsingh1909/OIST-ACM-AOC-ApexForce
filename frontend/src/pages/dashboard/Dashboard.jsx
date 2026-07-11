import React, { useEffect } from "react";
import gsap from "gsap";
import { useAuth } from "../../context/AuthContext";
import HeroScoreCard from "../../components/cards/HeroScoreCard";
import CourseCard from "../../components/cards/CourseCard";
import InteractiveListCard from "../../components/cards/InteractiveListCard";

const Dashboard = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Stagger reveal of main elements on load
    gsap.fromTo(".lms-stagger", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, stagger: 0.12, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="flex flex-col gap-10">
      
      {/* Header section */}
      <div className="space-y-2 lms-stagger">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500 font-sans tracking-wide">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight font-heading">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}! 
          <span className="inline-block ml-3 animate-bounce origin-bottom-right" style={{ animationDuration: '2s' }}>👋</span>
        </h2>
        <p className="text-slate-500 text-[15px] font-medium max-w-2xl">
          Here is your learning summary and recommended next steps for today. Let's keep the momentum going!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Progress (HeroScoreCard) */}
        <div className="lg:col-span-1 lms-stagger">
          <HeroScoreCard 
            title="LMS OVERALL MASTERY"
            score={68}
            classification="Developing"
            status="developing"
            subtitle="TOP 25% OF COHORT"
            rankText="STEADY GROWTH"
          />
        </div>

        {/* Right Column: Active Courses */}
        <div className="lg:col-span-2 flex flex-col gap-6 lms-stagger">
          <div className="flex justify-between items-end border-b border-slate-200/60 pb-3">
            <h3 className="text-lg font-bold text-slate-800 font-heading">Active Courses</h3>
            <span className="text-sm font-bold text-[#4F46E5] cursor-pointer hover:text-[#4F46E5]/80 transition-colors">View All</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CourseCard 
              topicName="React & Custom Hooks" 
              progress={75} 
              riskLevel="Low Risk" 
              overdueCount={0}
              onClick={() => {}}
            />
            <CourseCard 
              topicName="System Design Basics" 
              progress={40} 
              riskLevel="Medium Risk" 
              overdueCount={1}
              onClick={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section: Upcoming Quizzes / Assignments */}
      <div className="lms-stagger mt-4">
        <InteractiveListCard 
          title="Immediate Action Items"
          subtitle="Quizzes and assignments due within the next 7 days."
          headers={["Type", "Title", "Due Date", "Status"]}
          rows={[
            {
              id: "item1",
              cells: [
                <span className="text-xs font-bold text-[#4F46E5] bg-indigo-50 px-3 py-1 rounded-full">Quiz</span>,
                <span className="font-bold text-slate-800">Advanced Hooks Mastery</span>,
                <span className="text-slate-600 font-medium">Tomorrow, 11:59 PM</span>,
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Pending</span>
              ],
              details: "Focus on useEffect dependency arrays and memoization techniques (useMemo, useCallback)."
            },
            {
              id: "item2",
              cells: [
                <span className="text-xs font-bold text-[#00D2C4] bg-teal-50 px-3 py-1 rounded-full">Assignment</span>,
                <span className="font-bold text-slate-800">Build a Rate Limiter</span>,
                <span className="text-slate-600 font-medium">Oct 15, 2026</span>,
                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">Overdue</span>
              ],
              details: "Implement a token bucket rate limiter in Node.js with Redis. Ensure edge cases are documented."
            }
          ]}
        />
      </div>

    </div>
  );
};

export default Dashboard;
