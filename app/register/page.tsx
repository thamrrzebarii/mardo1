"use client";
import { useState, useEffect } from "react";
import { auth, db, googleProvider } from "../../firebase"; 
import { signInWithPopup, onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [user, setUser] = useState<any>(null);
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // پشکنین ئەگەر پێشتر زانیارییەکانی پڕ کردبێتەوە، دەیبات بۆ چات
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data()?.city && userDoc.data()?.city !== "") {
           router.push("/chat");
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const saveUserData = async (u: any, name: any, photo: any, uCity: string, uGender: string) => {
    try {
      await setDoc(doc(db, "users", u.uid), {
        uid: u.uid,
        name: name || "Guest",
        photo: photo || (uGender === "مێ" ? "https://cdn-icons-png.flaticon.com/512/6997/6997662.png" : "https://cdn-icons-png.flaticon.com/512/4825/4825038.png"),
        city: uCity,
        gender: uGender,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (e) { console.error(e); }
  };

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleGuestLogin = () => signInAnonymously(auth);

  const handleCompleteRegistration = async () => {
    if ((user.isAnonymous && !guestName.trim()) || !city || !gender) {
      return alert("هیڤیدکەم هەمی پێزانینان تژی بکە");
    }
    setLoading(true);
    const finalName = user.isAnonymous ? guestName : user.displayName;
    const finalPhoto = user.isAnonymous ? null : user.photoURL;
    await saveUserData(user, finalName, finalPhoto, city, gender);
    router.push("/chat");
    setLoading(false);
  };

  // فەنکشنی گەڕانەوە بۆ سەرەتا
  const handleBack = async () => {
    await signOut(auth);
    setUser(null);
    setGuestName("");
    setCity("");
    setGender("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] relative flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden" dir="rtl">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00CDAC]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#02AAB0]/10 rounded-full blur-[120px] -z-10"></div>

      <div className="w-full max-w-md z-10">
        <div className="mb-8 animate-in fade-in zoom-in duration-700">
          <img src="/home2.png" alt="Logo" className="w-32 h-32 mx-auto object-contain drop-shadow-lg mb-4" />
          <h1 className="text-3xl font-black text-gray-900 tracking-tight"> ب خێرهاتی</h1>
          <p className="text-gray-400 font-bold mt-2">خۆ تۆماربکە... </p>
        </div>

        {!user ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-500">
           <button 
  onClick={handleGoogleLogin} 
  className="w-full bg-white border-2 border-gray-50 p-5 rounded-[25px] font-black text-lg text-gray-800 flex items-center justify-center gap-3 shadow-xl transition-all duration-300 hover:border-[#4285F4]/30 hover:shadow-[0_10px_25px_rgba(66,133,244,0.1)] hover:scale-[1.02] active:scale-95"
>
  <img src="/login.png" className="w-7 h-7" alt="G" />
  <span>تێچوون ب رێکا گۆگلی</span>
</button>
            <div className="flex items-center gap-4 my-2 text-gray-300 font-bold">
              <div className="h-[1px] bg-gray-200 flex-1"></div>
              <span>یان</span>
              <div className="h-[1px] bg-gray-200 flex-1"></div>
            </div>
            <button 
  onClick={handleGuestLogin} 
  className="w-full bg-gray-900 text-white p-5 rounded-[25px] font-black text-lg shadow-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#02AAB0] hover:to-[#00CDAC] hover:shadow-[0_10px_20px_rgba(0,205,172,0.3)] hover:-translate-y-1 active:scale-95"
>
  وەک مێڤان بەردەوام بە
</button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl border border-white space-y-6 animate-in zoom-in-95 duration-300">
            
            {user.isAnonymous && (
              <div className="text-right space-y-2">
                <label className="text-[12px] font-black text-gray-400 mr-2 uppercase tracking-widest">ناڤێ تە چییە؟</label>
                <input 
                  type="text" placeholder="ناڤێ خۆ لێرە بنڤیسە..." value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00CDAC] focus:bg-white outline-none font-bold text-gray-900 shadow-sm text-[16px] transition-all"
                />
              </div>
            )}
            
            <div className="text-right space-y-2">
              <label className="text-[12px] font-black text-gray-400 mr-2 uppercase tracking-widest">ژ کیرێی؟</label>
              <select 
                value={city} onChange={(e) => setCity(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#00CDAC] focus:bg-white outline-none font-bold text-gray-900 appearance-none cursor-pointer shadow-sm text-[16px] transition-all"
              >
                <option value="">هەلبژێره...</option>
                <option value="هەولێر">هەولێر </option>
                <option value="سلێمانی">سلێمانی </option>
                <option value="دهۆک">دهۆک </option>
                <option value="ئاکرێ">ئاکرێ </option>
                <option value="کەرکوک">کەرکوک </option>
                <option value="زاخۆ">زاخۆ </option>
                <option value="ئامێدی">ئامێدی </option>
              </select>
            </div>

            <div className="text-right space-y-2">
              <label className="text-[12px] font-black text-gray-400 mr-2 uppercase tracking-widest">ڕەگەز</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setGender("نێر")}
                  className={`flex-1 p-4 rounded-2xl font-black transition-all border-2 ${gender === "نێر" ? "bg-gray-900 border-gray-900 text-white shadow-lg" : "bg-gray-50 border-transparent text-gray-400"}`}
                >نێر 👦</button>
                <button 
                  onClick={() => setGender("مێ")}
                  className={`flex-1 p-4 rounded-2xl font-black transition-all border-2 ${gender === "مێ" ? "bg-[#00CDAC] border-[#00CDAC] text-white shadow-lg" : "bg-gray-50 border-transparent text-gray-400"}`}
                >مێ 👧</button>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button onClick={handleCompleteRegistration} disabled={loading} 
                className="w-full bg-gradient-to-r from-[#02AAB0] to-[#00CDAC] text-white p-5 rounded-[25px] font-black text-xl shadow-lg shadow-teal-100 hover:scale-[1.02] active:scale-95 transition-all">
                {loading ? "چاڤەرێبە..." : "بەردەوامبە"}
              </button>
              
              <button 
                onClick={handleBack}
                className="w-full text-gray-400 font-bold text-sm hover:text-red-500 transition-colors py-2"
              >
                زڤرین بۆ سەرەتایێ
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 opacity-40 font-bold text-[10px] tracking-[0.3em] text-gray-500 ">
        thamrrbahram | All Rights Reserved
      </footer>
    </div>
  );
}