"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between p-6 text-center font-sans overflow-hidden bg-[#f8fafc]" dir="rtl">
      
      {/* Background Shapes - بۆ مەزنکردنی دیزاینەکە */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00CDAC]/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#02AAB0]/10 rounded-full blur-[120px] -z-10"></div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-35px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <div className="mb-6 relative">
          {/* سێبەری ژێر لۆگۆ */}
          <div className="absolute inset-0 bg-black/5 blur-3xl rounded-full scale-75 translate-y-20"></div>
          <img 
            src="/home2.png" 
            alt="Logo" 
            className="w-80 h-80 md:w-[500px] md:h-[500px] object-contain animate-float drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]" 
          />
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">جیهانا <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#02AAB0] to-[#00CDAC]">مەردۆی</span>
            </h1>
            <p className="text-gray-500 font-bold italic tracking-[0.2em] text-sm md:text-base opacity-70">
              ب خێرهاتی بۆ جیهانا من 
            </p>
          </div>

          <Link href="/register">
            <button className="group relative bg-gradient-to-r from-[#02AAB0] via-[#00CDAC] to-[#02AAB0] bg-[length:200%_auto] hover:bg-right text-white px-16 py-6 rounded-[35px] text-3xl font-black shadow-[0_20px_40px_rgba(0,205,172,0.3)] hover:scale-105 transition-all duration-500 active:scale-95 flex items-center gap-4 mx-auto">
              <span>دەستپێبکە</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8 group-hover:translate-x-[-10px] transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          </Link>
        </div>
      </div>

      {/* Footer - Elegant & Clean */}
      <footer className="w-full py-8 z-10">
        <div className="max-w-md mx-auto glass-card py-4 px-8 rounded-[25px] shadow-sm">
          <p className="text-gray-600 font-medium text-sm flex flex-col gap-1">
            <span className="opacity-80">هاتیە چێکرن ژلایێ <span className="text-[#02AAB0] font-black small tracking-wider"> <a href="http://instgram.com/thamrrbahram">thamrrbahram</a></span></span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">هەمی مافێن پاراستینە © 2026</span>
          </p>
        </div>
      </footer>
      
    </div>
  );
}