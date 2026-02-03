import React from 'react';

const DraftStartOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fadeIn duration-1000 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center">
        {/* Background Glow effects */}
        <div className="absolute w-[500px] h-[500px] bg-[#0AC8B9]/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute w-[300px] h-[300px] bg-[#C89B3C]/20 rounded-full blur-[80px] animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>

        {/* Hextech Portal Ring Animation */}
        <div className="relative mb-12">
           <div className="absolute inset-0 border-4 border-[#C89B3C]/30 rounded-full animate-spin-slow w-48 h-48 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
           <div className="absolute inset-0 border-2 border-[#0AC8B9]/30 rounded-full animate-spin w-40 h-40 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" style={{ animationDirection: 'reverse', animationDuration: '5s' }}></div>
           
           {/* Center Icon */}
           <div className="relative z-10 bg-[#091428] border-2 border-[#C89B3C] rounded-full p-6 shadow-[0_0_50px_rgba(200,155,60,0.5)] animate-bounce-slight">
              <span className="material-symbols-outlined text-[#F0E6D2] text-6xl">videogame_asset</span>
           </div>
        </div>

        {/* Text */}
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#F0E6D2] to-[#C89B3C] tracking-widest drop-shadow-[0_0_10px_rgba(200,155,60,0.8)] animate-scale-up">
          DRAFT STARTING
        </h1>
        
        <p className="mt-4 text-[#0AC8B9] text-xl font-bold tracking-[0.5em] uppercase animate-pulse">
          Prepare for Battle
        </p>

        {/* Loading Bar */}
        <div className="mt-12 w-96 h-1 bg-[#1A1811] rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0AC8B9] via-[#C89B3C] to-[#0AC8B9] w-full animate-loading-bar origin-left"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-up {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.5s ease-out forwards;
        }
        @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0%); }
        }
        .animate-loading-bar {
            animation: loading-bar 2s ease-in-out forwards;
        }
        @keyframes bounce-slight {
            0%, 100% { transform: translateY(0); }
             50% { transform: translateY(-5px); }
        }
        .animate-bounce-slight {
             animation: bounce-slight 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DraftStartOverlay;
