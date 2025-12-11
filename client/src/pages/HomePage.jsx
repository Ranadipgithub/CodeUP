import React from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useNavigate } from 'react-router';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#4ADE80] selection:text-black overflow-x-hidden relative flex flex-col">
      {/* Import Inter font for closer match */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .glow-green { box-shadow: 0 0 20px rgba(74, 222, 128, 0.5); }
        `}
      </style>

      {/* Background Curtain Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="h-full w-full opacity-10" viewBox="0 0 1440 900" preserveAspectRatio="none">
           {/* Vertical wavy lines simulating the background texture */}
           <path d="M200,0 C250,300 150,600 200,900" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
           <path d="M1240,0 C1190,300 1290,600 1240,900" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
           <path d="M1300,0 C1250,400 1350,500 1300,900" fill="none" stroke="white" strokeWidth="1" opacity="0.2" />
        </svg>
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]"></div>
      </div>

      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 Q 50 50 100 0" stroke="white" strokeWidth="0.5" fill="none" />
          <path d="M20 100 Q 60 60 100 20" stroke="white" strokeWidth="0.5" fill="none" />
          <path d="M-20 100 Q 40 40 80 -20" stroke="white" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      {/* --- Navbar Container (Full Width Border) --- */}
      

      {/* --- Hero Section --- */}
      <main className="relative z-10 grow flex items-center justify-center">
        <div className="max-w-[1300px] w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
          {/* Left Content */}
          <div className="space-y-8 max-w-xl">
            <h1 className="text-[4rem] md:text-[5.5rem] font-bold leading-[1.05] tracking-tight text-white">
              Build Code & <br />
              Your Future
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-lg font-light">
              Build your future with us by building code. Whether you're a beginner or an experienced developer, CodeUp provides a dynamic learning experience
            </p>
            <button onClick={() => navigate('/problems')} className="bg-[#4ADE80] text-black px-9 py-4 rounded font-bold text-lg hover:bg-[#3ec46d] transition-transform active:scale-95 glow-green mt-4">
              Get Started Now
            </button>
          </div>

          {/* Right Content (Visuals) */}
          <div className="relative h-[600px] w-full flex justify-center items-center perspective-1000">
            
            {/* 1. Code Editor Window */}
            <div className="absolute top-20 left-4 md:left-10 z-20 bg-[#1A1A1A] rounded-lg shadow-2xl w-[340px] p-5 border border-gray-800 -rotate-3 transform transition-transform hover:rotate-0 duration-500">
              
              {/* Floating Search Bar */}
              <div className="absolute -top-7 right-[-30px] bg-[#2A2A2A] pl-4 pr-1 py-1 rounded-md flex items-center justify-between gap-3 shadow-xl border border-gray-700 w-48">
                 <span className="text-gray-400 text-xs font-mono">training in codeup</span>
                 <div className="bg-[#1e5c38] w-7 h-7 rounded flex items-center justify-center">
                  <Search size={14} className="text-white" />
                 </div>
              </div>

              {/* Window Controls */}
              <div className="flex gap-2 mb-6 opacity-60">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
              </div>

              {/* Code Content */}
              <div className="font-mono text-[10px] leading-6 text-gray-500">
                <div className="flex gap-4">
                  <span className="select-none opacity-30 w-2 text-right">1</span> 
                  <span>
                    <span className="text-[#4ADE80]">const</span> <span className="text-blue-300">codeContent</span> = `
                  </span>
                </div>
                <div className="flex gap-4">
                   <span className="select-none opacity-30 w-2 text-right">2</span>
                   <span className="text-[#1e5c38] italic">//Welcome to CodeUp!</span>
                </div>
                <div className="flex gap-4">
                   <span className="select-none opacity-30 w-2 text-right">3</span>
                   <span>
                      <span className="text-purple-400">public class</span> <span className="text-yellow-200">Main</span> {'{'}
                   </span>
                </div>
                <div className="flex gap-4">
                   <span className="select-none opacity-30 w-2 text-right">4</span>
                   <span className="pl-2">
                      <span className="text-purple-400">public static void</span> <span className="text-blue-300">main</span>(String[] args) {'{'}
                   </span>
                </div>
                 <div className="flex gap-4">
                   <span className="select-none opacity-30 w-2 text-right">5</span>
                   <span className="pl-4">
                      System.out.println(<span className="text-orange-300">"Hello, World!"</span>);
                   </span>
                </div>
                <div className="flex gap-4">
                   <span className="select-none opacity-30 w-2 text-right">6</span>
                   <span className="pl-2">{'}'}</span>
                </div>
                <div className="flex gap-4">
                   <span className="select-none opacity-30 w-2 text-right">7</span>
                   <span>{'}'}</span>
                </div>
                 <div className="flex gap-4">
                   <span className="select-none opacity-30 w-2 text-right">8</span>
                   <span>`;</span>
                </div>
              </div>

              {/* Green Cursor Arrow */}
              <div className="absolute bottom-12 right-[-15px] z-30 drop-shadow-lg">
                <svg width="35" height="35" viewBox="0 0 24 24" fill="#4ADE80" stroke="none">
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                </svg>
              </div>
            </div>

            {/* 2. Vertical Pattern Strip (Right Side) */}
            <div className="absolute right-0 md:-right-10 top-20 h-80 w-28 bg-[#0a0a0a] border-l border-white/5 z-10 flex flex-col items-center justify-center overflow-hidden" 
                 style={{ transform: 'perspective(800px) rotateY(-25deg) scale(0.9)', boxShadow: '-10px 0 30px rgba(0,0,0,0.8)' }}>
               <div className="flex flex-col gap-0 w-full">
                 {/* CSS Pattern */}
                 {Array.from({ length: 8 }).map((_, i) => (
                   <div key={i} className="flex justify-center w-full h-10 relative">
                      <div className="w-0 h-0 border-l-20 border-l-transparent border-r-20 border-r-transparent border-t-20 border-t-[#4ADE80] opacity-80 translate-y-2"></div>
                      <div className="absolute w-0 h-0 border-l-20 border-l-transparent border-r-20 border-r-transparent border-t-20 border-t-[#1e5c38] -translate-y-2.5 scale-75"></div>
                   </div>
                 ))}
               </div>
            </div>

            {/* 3. Salary Card */}
            <div className="absolute bottom-16 left-10 md:left-20 bg-[#1A3D2F] p-5 rounded shadow-2xl z-30 w-52 border-l-4 border-[#4ADE80] flex flex-col justify-between h-40 transform hover:scale-105 transition-transform duration-300">
              <div>
                 <div className="text-white font-bold text-2xl tracking-wide">$2,550</div>
                 <div className="text-green-200/60 text-[10px] uppercase tracking-wider font-semibold mt-1">Average salary</div>
              </div>
              
              {/* Line Chart */}
              <div className="relative w-full h-16 mt-2">
                 <svg className="w-full h-full overflow-visible">
                    <path d="M0,50 L20,45 L40,48 L60,35 L80,25 L100,15 L120,5" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeOpacity="0.5" />
                    {[
                      {x: 20, y: 45}, {x: 40, y: 48}, {x: 60, y: 35}, 
                      {x: 80, y: 25}, {x: 100, y: 15}, {x: 120, y: 5}
                    ].map((p, i) => (
                       <path key={i} d={`M${p.x},${p.y-3} L${p.x+3},${p.y+3} L${p.x-3},${p.y+3} Z`} fill="#4ADE80" />
                    ))}
                 </svg>
                 <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full h-px bg-white/5"></div>
                    <div className="w-full h-px bg-white/5"></div>
                    <div className="w-full h-px bg-white/5"></div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;