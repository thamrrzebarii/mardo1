"use client";
import { useRouter } from "next/navigation";

export default function AboutMe() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white p-4 border-b flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="text-gray-600 font-bold flex items-center gap-1 active:scale-90 transition-all">
          <span>←</span> زڤڕین
        </button>
        <h2 className="text-lg font-black text-gray-800">خۆدانێ پرۆژەی</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border-2 border-[#00CDAC] relative">
          
          {/* Top Banner */}
          <div className="h-32 bg-gradient-to-r from-[#00CDAC] to-[#02AAB0]"></div>
          
          <div className="px-8 pb-10 flex flex-col items-center -mt-16">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-[35px] bg-white p-1.5 shadow-2xl mb-4">
              <img 
                src="/me.png" 
                className="w-full h-full rounded-[30px] object-cover bg-gray-100" 
                alt="Mardo Developer" 
              />
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Thamr Zebari</h3>
            <p className="text-[#00CDAC] font-black text-[12px] mb-6 uppercase tracking-widest">Software Engineer & Designer</p>

            <div className="w-full space-y-4">
              {/* Bio Section */}
              <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100 relative">
                <span className="absolute -top-3 right-6 bg-white px-3 py-1 rounded-full border border-gray-100 text-[10px] font-black text-gray-400">دەربارە</span>
                <p className="text-black font-bold text-[14px] leading-relaxed text-center italic">
                  "قوتابی ل زانكۆیا كوردستان هەولێر، بەشێ ئەندازیاریا پرۆگرامسازی. ئەڤ پلاتفۆرمە تنێ بۆ خۆشی و کەیفێ هاتیە دروستکرن. هێڤیدارم هەمی هەڤال دەمەکێ خۆش لێرە ببورینن."
                </p>
              </div>

              {/* Education Info */}
              <div className="flex flex-col gap-3">
                <div className="bg-white p-4 rounded-2xl border-2 border-gray-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 text-xl">🎓</div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-black block">زانکۆ</span>
                    <span className="text-black font-black text-sm text-right">University of Kurdistan Hewlêr</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border-2 border-gray-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 text-xl">💻</div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-black block">بەش</span>
                    <span className="text-black font-black text-sm">Software Engineering</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => router.push("/chat")} 
              className="mt-8 w-full py-4 bg-black text-white rounded-[20px] font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>💬</span> دەستپێکرنا چاتێ
            </button>
          </div>
        </div>

        <p className="mt-6 text-[11px] text-gray-400 font-bold uppercase tracking-widest">Powered by Thamr Zebari</p>
      </main>
    </div>
  );
}