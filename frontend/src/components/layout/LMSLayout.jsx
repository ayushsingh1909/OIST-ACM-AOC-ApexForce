import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { FiMenu } from "react-icons/fi";

const LMSLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] flex font-sans relative overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Mobile Header (Hamburger Menu) */}
      <div className="md:hidden w-full bg-[#FFFFFF] border-b border-black/10 px-6 py-4 flex items-center justify-between absolute top-0 left-0 z-30">
        <span className="font-bold text-sm tracking-tight font-sans uppercase text-[#000000]">ACIE</span>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-[#000000]">
          <FiMenu className="w-5 h-5" />
        </button>
      </div>

      <main className="flex-grow p-6 md:p-12 mt-16 md:mt-0 max-w-6xl mx-auto flex flex-col gap-10 overflow-y-auto h-screen relative">
        {children}
      </main>
    </div>
  );
};

export default LMSLayout;
