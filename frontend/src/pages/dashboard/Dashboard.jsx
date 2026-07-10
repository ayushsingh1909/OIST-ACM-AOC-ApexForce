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
      <div className="space-y-1.5 lms-stagger">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#000000] uppercase tracking-widest font-sans">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <h2 className="text-5xl font-bold tracking-tighter text-[#000000] leading-tight">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}.
        </h2>
        <p className="text-[#555555] text-xs">
          Here is your learning summary and recommended next steps for today.
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
          <div className="flex justify-between items-end border-b border-black/10 pb-2">
            <h3 className="text-sm font-bold text-[#000000] uppercase font-sans tracking-widest">Active Topics (Courses)</h3>
            <span className="text-[10px] font-bold text-[#000000] uppercase tracking-widest cursor-pointer font-sans underline decoration-1 underline-offset-2">View All</span>
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
                <span className="text-[10px] font-bold font-sans text-black border border-black/10 px-2 py-0.5 uppercase tracking-wider">Quiz</span>,
                <span className="font-semibold text-black">Advanced Hooks Mastery</span>,
                "Tomorrow, 11:59 PM",
                <span className="text-[10px] font-bold font-sans text-black border border-black/10 px-2 py-0.5 uppercase tracking-wider bg-black/5">Pending</span>
              ],
              details: "Focus on useEffect dependency arrays and memoization techniques (useMemo, useCallback)."
            },
            {
              id: "item2",
              cells: [
                <span className="text-[10px] font-bold font-sans text-black border border-black/10 px-2 py-0.5 uppercase tracking-wider">Assignment</span>,
                <span className="font-semibold text-black">Build a Rate Limiter</span>,
                "Oct 15, 2026",
                <span className="text-[10px] font-bold font-sans text-[#B30006] border border-[#B30006]/20 px-2 py-0.5 uppercase tracking-wider bg-[#B30006]/5">Overdue</span>
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
