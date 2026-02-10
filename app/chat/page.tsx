"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, setDoc, where, limit, getDoc, deleteDoc, updateDoc,
  getDocs, arrayUnion, arrayRemove 
} from "firebase/firestore";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";

function formatChatTime(date: any) {
  if (!date) return "";
  const d = date instanceof Date ? date : date.toDate();
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h}:${m < 10 ? "0" + m : m}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [viewingProfile, setViewingProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editGender, setEditGender] = useState("نەدیار");
  const [editPhoto, setEditPhoto] = useState(""); 

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const timerRef = useRef<any>(null);

  // --- سیستەمێ Owner و Admin ---
  const ownerID = "HY6CJILZvbYm9E2ZrdTvIVkD56t2"; // ئایدییا تە (Owner)
  const [adminUIDs, setAdminUIDs] = useState<string[]>([ownerID]); 
  
  const isOwner = auth.currentUser?.uid === ownerID;
  const isAdmin = auth.currentUser && adminUIDs.includes(auth.currentUser.uid);

  useEffect(() => {
    const adminDocRef = doc(db, "settings", "admin_list");
    const unsubscribeAdmins = onSnapshot(adminDocRef, (snap) => {
      if (snap.exists()) {
        setAdminUIDs(snap.data().uids || [ownerID]);
      } else {
        setDoc(adminDocRef, { uids: [ownerID] });
      }
    });
    return () => unsubscribeAdmins();
  }, []);

  const toggleAdmin = async (targetId: string) => {
    if (!isOwner) return; // تەنێ تو دشێی رۆلان بدەی وەک Discord
    const adminDocRef = doc(db, "settings", "admin_list");
    
    try {
      if (adminUIDs.includes(targetId)) {
        await updateDoc(adminDocRef, { uids: arrayRemove(targetId) });
        alert("ئەڤ بکارئینەرە ژ ئەدمینی هاتە لادان!");
      } else {
        await updateDoc(adminDocRef, { uids: arrayUnion(targetId) });
        alert("ئەڤ بکارئینەرە بوو ب ئەدمین!");
      }
    } catch (error) {
      console.error("Error updating admin:", error);
    }
  };

  const clearAllMessages = async () => {
    if (!isAdmin) return;
    if (window.confirm("ماردۆ، تو پشت راستی تە دڤێت هەمی چاتێ بڕێزی؟")) {
      try {
        const snapshot = await getDocs(collection(db, "messages"));
        const deletePromises = snapshot.docs.map(m => deleteDoc(m.ref));
        await Promise.all(deletePromises);
        alert("چات هاتە پاقژکرن!");
      } catch (error) { console.error(error); }
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        
        if (!snap.exists()) {
          const initialData = {
            name: user.displayName || "Guest",
            photo: user.photoURL || "/login.png",
            city: "نەدیار",
            gender: "نەدیار",
            lastActive: serverTimestamp()
          };
          await setDoc(userRef, initialData);
        } else {
          await updateDoc(userRef, { lastActive: serverTimestamp() });
        }

        onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({ id: docSnap.id, ...data });
            setEditName(data.name || "");
            setEditCity(data.city || "");
            setEditGender(data.gender || "نەدیار");
            setEditPhoto(data.photo || "");
          }
        });
      } else { 
        router.push("/register"); 
      }
    });

    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribeChat = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    });

    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const usersQ = query(collection(db, "users"), where("lastActive", ">", tenMinsAgo), limit(30));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOnlineUsers(users.sort((a, b) => (a.id === auth.currentUser?.uid ? -1 : 1)));
    });

    return () => { unsubscribeAuth(); unsubscribeChat(); unsubscribeUsers(); };
  }, [router]);

  const saveProfile = async () => {
    if (!userData || !auth.currentUser) return;
    try {
      const userRef = doc(db, "users", userData.id);
      await updateDoc(userRef, { name: editName, city: editCity, gender: editGender, photo: editPhoto });
      await updateProfile(auth.currentUser, { displayName: editName, photoURL: editPhoto });
      setIsEditingProfile(false);
      alert("زانیاری هاتنە گۆڕین!");
    } catch (error) { console.error(error); }
  };

  const deleteMessage = async (msgId: string, msgUid: string) => {
    if (msgUid !== userData?.id && !isAdmin) return; 
    if (window.confirm("تە دڤێت ئەڤ نامە بهێتە ژێبرن؟")) {
      try { await deleteDoc(doc(db, "messages", msgId)); } catch (error) { console.error(error); }
    }
  };

  const handleTouchStart = (msgId: string, msgUid: string) => {
    timerRef.current = setTimeout(() => { deleteMessage(msgId, msgUid); }, 800);
  };

  const handleTouchEnd = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userData) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage, uid: userData.id, name: userData.name, photo: userData.photo,
        city: userData.city || "نەدیار", gender: userData.gender || "نەدیار",
        createdAt: serverTimestamp(),
        ...(replyTo && { replyText: replyTo.text, replyName: replyTo.name })
      });
      setNewMessage("");
      setReplyTo(null);
    } catch (error) { console.error(error); }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#f1f5f9] font-sans overflow-hidden relative select-none" dir="rtl">
      
      <header className="bg-white border-b border-gray-200 flex flex-col shrink-0 z-50 shadow-sm">
        <div className="flex justify-between items-center px-6 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00CDAC] rounded-lg flex items-center justify-center text-white font-black">M</div>
            <h2 className="text-lg font-black text-gray-800 italic uppercase tracking-tighter">Mardo</h2>
          </div>
          <div className="flex gap-2 items-center">
            {isAdmin && (
              <button onClick={clearAllMessages} className="p-2 bg-red-500 text-white rounded-xl text-[10px] font-black shadow-md active:scale-90">🗑️ پاقژکرن</button>
            )}
            <button onClick={() => setIsEditingProfile(true)} className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-[11px] font-bold text-black">دەستکاریا هەژمارێ</button>
            <button onClick={() => auth.signOut()} className="text-red-400 p-2 bg-red-50 rounded-xl text-[10px] font-bold border border-red-100">چوونەدەر</button>
          </div>
        </div>

        <div className="flex px-4 pb-3 gap-1.5">
          <button onClick={() => router.push("/birman")} className="flex-1 py-3 bg-purple-50 rounded-2xl border border-purple-100 text-purple-700 font-black text-[10px]">🧠 بیرمەن</button>
          <button onClick={() => router.push("/chat")} className="flex-1 py-3 bg-[#00CDAC] text-white rounded-2xl shadow-lg font-black text-[10px]">💬 چات</button>
          <button onClick={() => router.push("/bazar")} className="flex-1 py-3 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600 font-black text-[10px]">🛒 بازاڕ</button>
          <button onClick={() => router.push("/aboutme")} className="flex-1 py-3 bg-orange-50 rounded-2xl border border-orange-100 text-orange-600 font-black text-[10px]">👤 دەربارەی من</button>
        </div>

        <div className="py-3 px-4 flex gap-4 overflow-x-auto scrollbar-hide items-center min-h-[85px] border-t border-gray-50">
          {onlineUsers.map((u) => (
            <div key={u.id} onClick={() => setViewingProfile(u)} className="flex flex-col items-center min-w-[60px] cursor-pointer">
              <div className={`relative p-[2px] rounded-full ${u.id === userData?.id ? "bg-orange-400" : (adminUIDs.includes(u.id) ? "bg-red-500" : "bg-[#00CDAC]")}`}>
                <img src={u.photo || "/login.png"} className="w-11 h-11 rounded-full border-2 border-white object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-[9px] font-bold mt-1 text-gray-500 truncate w-14 text-center">{u.id === userData?.id ? "تۆ" : u.name}</span>
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-hidden px-3 py-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed flex flex-col items-center">
        <div className="w-full max-w-4xl h-full border-2 border-gray-200 bg-white/70 backdrop-blur-xl rounded-[35px] shadow-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
            {messages.map((msg) => {
              const isMe = msg.uid === userData?.id;
              const msgIsOwner = msg.uid === ownerID;
              const msgIsAdmin = adminUIDs.includes(msg.uid);
              return (
                <div key={msg.id} className={`flex ${isMe ? "flex-row" : "flex-row-reverse"} items-end gap-2 mb-2`}>
                  <img src={msg.photo || "/login.png"} onClick={() => setViewingProfile({id: msg.uid, ...msg})} className="w-9 h-9 rounded-xl border border-gray-100 shadow-sm object-cover cursor-pointer active:scale-90 transition-all" />
                  <div className={`flex flex-col ${isMe ? "items-start" : "items-end"} max-w-[80%]`}>
                    {!isMe && (
                      <div className="flex items-center gap-1 mb-1 px-2">
                        {msgIsOwner ? (
                            <span className="text-[8px] bg-purple-600 text-white px-1 rounded-md font-bold">OWNER</span>
                        ) : msgIsAdmin && (
                            <span className="text-[8px] bg-red-500 text-white px-1 rounded-md font-bold">ADMIN</span>
                        )}
                        <span className="text-[9px] font-black text-gray-400 uppercase">{msg.name}</span>
                      </div>
                    )}
                    <div 
                      onTouchStart={() => (isMe || isAdmin) && handleTouchStart(msg.id, msg.uid)}
                      onTouchEnd={handleTouchEnd}
                      onContextMenu={(e) => { e.preventDefault(); (isMe || isAdmin) && deleteMessage(msg.id, msg.uid); }}
                      onClick={() => setReplyTo(msg)}
                      className={`px-4 py-3 shadow-sm active:scale-95 transition-all relative ${
                        isMe ? "bg-gradient-to-r from-[#02AAB0] to-[#00CDAC] text-white rounded-[20px] rounded-tr-none" 
                             : "bg-white text-gray-700 rounded-[20px] rounded-tl-none border border-gray-100"
                      }`}
                    >
                      {msg.replyText && (
                        <div className={`mb-2 p-2 rounded-lg text-[10px] border-r-4 ${isMe ? "bg-black/10 border-white/40" : "bg-gray-100 border-[#00CDAC]"}`}>
                          <span className="font-black block">{msg.replyName}</span>
                          <p className="truncate opacity-80">{msg.replyText}</p>
                        </div>
                      )}
                      <p className="text-[14px] leading-relaxed break-words font-medium">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-start" : "justify-end"}`}>
                        <span className={`text-[8px] font-bold ${isMe ? "text-white/60" : "text-gray-400"}`}>{formatChatTime(msg.createdAt)}</span>
                        {isMe && <span className="text-[10px] text-white/80">✔</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          <div className="p-4 bg-white/90 border-t border-gray-100">
            {replyTo && (
              <div className="mb-2 p-2 bg-gray-50 border-r-4 border-[#00CDAC] flex justify-between items-center rounded-xl">
                <div className="overflow-hidden">
                  <span className="text-[10px] font-black text-[#00CDAC] block">بەرسڤدانا: {replyTo.name}</span>
                  <p className="text-[11px] text-gray-500 truncate">{replyTo.text}</p>
                </div>
                <button onClick={() => setReplyTo(null)} className="text-gray-400 p-1">✕</button>
              </div>
            )}
            <form onSubmit={sendMessage} className="flex gap-2 items-center">
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="نامەکێ بنڤیسە..." 
                className="flex-1 p-3.5 rounded-2xl bg-gray-100 border-none outline-none text-black font-bold text-sm focus:ring-2 focus:ring-[#00CDAC] transition-all placeholder:text-gray-400" 
              />
              <button type="submit" className="bg-[#00CDAC] text-white p-3.5 rounded-2xl shadow-lg active:scale-90 transition-all flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-180"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
              </button>
            </form>
          </div>
        </div>
      </main>

      {viewingProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setViewingProfile(null)}>
          <div className="bg-white rounded-[35px] w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className={`h-24 ${viewingProfile.id === ownerID ? "bg-purple-600" : "bg-gradient-to-r from-[#02AAB0] to-[#00CDAC]"}`}></div>
            <div className="px-6 pb-8 flex flex-col items-center -mt-12">
              <img src={viewingProfile.photo || "/login.png"} className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg object-cover mb-4" />
              <h3 className="text-xl font-black text-gray-800">{viewingProfile.name}</h3>
              <div className="w-full mt-6 space-y-3 font-bold text-sm text-black">
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <span className="text-[10px] text-orange-400 font-black block mb-1">USER ID (UID)</span>
                  <p className="text-[11px] font-mono break-all text-gray-600 select-all cursor-pointer">{viewingProfile.uid || viewingProfile.id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-gray-400">شار</span>
                  <span>{viewingProfile.city || "نەدیار"}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-gray-400">رەگەز</span>
                  <span>{viewingProfile.gender || "نەدیار"}</span>
                </div>
              </div>

              <div className="w-full mt-6 space-y-2">
                {isOwner && viewingProfile.id !== auth.currentUser?.uid && (
                  <button 
                    onClick={() => toggleAdmin(viewingProfile.id)}
                    className={`w-full py-4 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg ${
                        adminUIDs.includes(viewingProfile.id) ? "bg-red-500" : "bg-orange-500"
                    }`}
                  >
                    {adminUIDs.includes(viewingProfile.id) ? "❌ راکرن ژ ئەدمینی" : "⭐ بکە ئەدمین"}
                  </button>
                )}
                <button onClick={() => setViewingProfile(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all">داخستن</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-[30px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in">
            <h2 className="text-xl font-black mb-6 text-gray-800 text-center uppercase">دەستکاریا پڕۆفایلی</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block mr-2 text-right">ناڤێ نوێ:</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#00CDAC] outline-none font-bold text-sm text-black" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block mr-2 text-right">لینکا وێنەی (URL):</label>
                <input type="text" value={editPhoto} onChange={(e) => setEditPhoto(e.target.value)} placeholder="لینکێ وێنەی دابنێ..." className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#00CDAC] outline-none font-bold text-sm text-black" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block mr-2 text-right">شار:</label>
                <select value={editCity} onChange={(e) => setEditCity(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#00CDAC] outline-none font-bold text-sm text-black">
                  <option value="نەدیار">شارێ خۆ هەلبژێره</option>
                  <option value="دهۆک">دهۆک</option>
                  <option value="هەولێر">هەولێر</option>
                  <option value="سلێمانی">سلێمانی</option>
                  <option value="زاخۆ">زاخۆ</option>
                  <option value="ئامێدی">ئامێدی</option>
                  <option value="ئاکرێ">ئاکرێ</option>
                  <option value="شێخان">شێخان</option>
                  <option value="سێمێل">سێمێل</option>
                  <option value="کەرکوک">کەرکوک</option>
                  <option value="هەڵەبجە">هەڵەبجە</option>
                  <option value="بەغدا">بەغدا</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 mb-2 block mr-2 text-right">ڕەگەز:</label>
                <select value={editGender} onChange={(e) => setEditGender(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#00CDAC] outline-none font-bold text-sm text-black">
                  <option value="نەدیار">هەڵبژێرە</option>
                  <option value="کوڕ">کوڕ</option>
                  <option value="کچ">کچ</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={saveProfile} className="flex-1 py-4 bg-[#00CDAC] text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all">گۆڕین</button>
              <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black active:scale-95 transition-all">لابردن</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
