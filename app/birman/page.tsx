"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove,
  deleteDoc 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

function formatKurdiTime(date: any) {
  if (!date) return "نوکە";
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return "بەری ساڵەکێ";
  interval = seconds / 2592000;
  if (interval > 1) return "بەری هەیڤەکێ";
  interval = seconds / 86400;
  if (interval > 1) return "بەری " + Math.floor(interval) + " ڕۆژان";
  interval = seconds / 3600;
  if (interval > 1) return "بەری " + Math.floor(interval) + " دەمژمێران";
  interval = seconds / 60;
  if (interval > 1) return "بەری " + Math.floor(interval) + " خۆلەکان";
  return "نوکە";
}

export default function BirmanPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // بۆ گەڕیانێ
  const [text, setText] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? user : null);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "birman_posts"), orderBy("createdAt", "desc"));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribePosts();
  }, []);

  // فلتەرکرنا پۆستان ب دویڤ گەڕیانێ
  const filteredPosts = posts.filter(post => 
    post.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePost = async (postId: string, authorUid: string) => {
    if (currentUser?.uid !== authorUid) return;
    if (confirm("ئەرێ تو پشتڕاستی کو دڤێت ئەڤ پۆستە بهێتە ڕەشکرن؟")) {
      try {
        await deleteDoc(doc(db, "birman_posts", postId));
      } catch (err) { console.error(err); }
    }
  };

  const handleDeleteComment = async (postId: string, comment: any) => {
    if (currentUser?.uid !== comment.uid) return;
    if (confirm("تە دڤێت ئەڤ کۆمێنتە بهێتە ڕەشکرن؟")) {
      const postRef = doc(db, "birman_posts", postId);
      await updateDoc(postRef, { comments: arrayRemove(comment) });
      setSelectedPost((prev: any) => ({
        ...prev,
        comments: prev.comments.filter((c: any) => c.id !== comment.id)
      }));
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;
    try {
      await addDoc(collection(db, "birman_posts"), {
        text,
        uid: currentUser.uid,
        name: currentUser.displayName || "بکارهێنەر",
        photo: currentUser.photoURL || "/login.png",
        createdAt: serverTimestamp(),
        likes: [],
        comments: []
      });
      setText("");
    } catch (err) { console.error(err); }
  };

  const toggleLike = async (postId: string, likes: any) => {
    if (!currentUser) return;
    const postRef = doc(db, "birman_posts", postId);
    const hasLiked = Array.isArray(likes) && likes.includes(currentUser.uid);
    await updateDoc(postRef, {
      likes: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
    });
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !selectedPost) return;
    const commentData = {
      id: Date.now(),
      uid: currentUser.uid,
      userName: currentUser.displayName || "بکارهێنەر",
      userPhoto: currentUser.photoURL || "/login.png",
      text: newComment,
      createdAt: new Date().toISOString()
    };
    const postRef = doc(db, "birman_posts", selectedPost.id);
    await updateDoc(postRef, { comments: arrayUnion(commentData) });
    setNewComment("");
    setSelectedPost((prev: any) => ({ ...prev, comments: [...(prev.comments || []), commentData] }));
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-[#E0F2F1] via-[#F3F4F6] to-[#E8EAF6] font-sans overflow-hidden text-right" dir="rtl">
      
      {/* Header with Search */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 px-5 py-3 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-black text-gray-900 italic tracking-tighter">Mardo <span className="text-[#00CDAC]">بیرمەن</span></h2>
          <button onClick={() => router.back()} className="bg-white/50 hover:bg-white p-2 rounded-full text-gray-500 shadow-sm transition-all">✕</button>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text"
            placeholder="ل ناڤ پۆستان بگەرێ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2.5 pr-10 bg-white/60 border border-white rounded-2xl text-sm outline-none focus:border-[#00CDAC] transition-all font-bold shadow-inner"
          />
          <span className="absolute right-3 top-2.5 opacity-40">🔍</span>
        </div>
      </header>

      {/* Input Section */}
      <div className="p-4 border-b border-gray-100/50 bg-white/40 backdrop-blur-md">
        <div className="flex gap-3">
          <img src={currentUser?.photoURL || "/login.png"} className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white" />
          <form onSubmit={handlePost} className="flex-1">
            <textarea 
              value={text} onChange={(e) => setText(e.target.value)}
              placeholder="چ هزر د مێشکێ تە دانە؟"
              className="w-full p-3 bg-white/50 rounded-2xl outline-none text-[16px] text-gray-900 font-bold resize-none min-h-[80px] placeholder:text-gray-400 border border-white focus:border-[#00CDAC] transition-all"
            />
            <div className="flex justify-end mt-2">
              <button className="bg-[#00CDAC] text-white px-8 py-2.5 rounded-2xl text-sm font-black shadow-lg shadow-teal-200 active:scale-95 transition-all">بەلاڤکرن</button>
            </div>
          </form>
        </div>
      </div>

      {/* Posts List */}
      <main className="flex-1 overflow-y-auto space-y-4 p-4 pb-24">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white/80 backdrop-blur-sm rounded-[30px] p-5 shadow-sm border border-white animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <img src={post.photo || "/login.png"} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div className="flex flex-col">
                    <span className="font-black text-[15px] text-gray-900">{post.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold tracking-wide">
                      {post.createdAt ? formatKurdiTime(post.createdAt.toDate()) : "نوکە"}
                    </span>
                  </div>
                </div>
                {currentUser?.uid === post.uid && (
                  <button onClick={() => handleDeletePost(post.id, post.uid)} className="text-gray-300 hover:text-red-500 transition-all p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                  </button>
                )}
              </div>
              <p className="text-[15px] text-gray-800 leading-relaxed font-medium mb-5 whitespace-pre-wrap">{post.text}</p>
              
              <div className="flex items-center gap-8 border-t border-gray-100/50 pt-4">
                <button onClick={() => setSelectedPost(post)} className="flex items-center gap-2 group transition-all active:scale-95">
                  <div className="p-2 rounded-full group-hover:bg-teal-50 transition-colors">
                    <img src="/comment.png" alt="comment" className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100" />
                  </div>
                  <span className="text-sm font-black text-gray-500 group-hover:text-teal-600">{post.comments?.length || 0}</span>
                </button>

                <button onClick={() => toggleLike(post.id, post.likes)} className="flex items-center gap-2 group transition-all active:scale-125">
                  <div className={`p-2 rounded-full transition-colors ${post.likes?.includes(currentUser?.uid) ? "bg-red-50" : "group-hover:bg-red-50"}`}>
                    <img src="/like.png" alt="like" className={`w-6 h-6 object-contain transition-all ${post.likes?.includes(currentUser?.uid) ? "brightness-110" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"}`} />
                  </div>
                  <span className={`text-sm font-black transition-colors ${post.likes?.includes(currentUser?.uid) ? "text-red-500" : "text-gray-500 group-hover:text-red-500"}`}>{post.likes?.length || 0}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400 font-bold">هیچ ئەنجامەک نەهاتە دیتن... 😕</div>
        )}
      </main>

      {/* Modal Comments (Same as before) */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-end justify-center" onClick={() => setSelectedPost(null)}>
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-xl rounded-t-[40px] p-6 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-500 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="font-black text-xl text-gray-900">ژمارا کۆمێنتا ({selectedPost.comments?.length || 0})</h3>
              <button onClick={() => setSelectedPost(null)} className="bg-gray-100 p-2 rounded-full text-gray-400">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-6 px-1">
              {selectedPost.comments?.map((com: any) => (
                <div key={com.id} className="flex gap-3 group px-2">
                  <img src={com.userPhoto || "/login.png"} className="w-10 h-10 rounded-full object-cover border border-white shadow-sm" />
                  <div className="flex-1 bg-white/50 p-4 rounded-2xl rounded-tr-none relative border border-white/50 shadow-sm">
                    <span className="text-[12px] font-black text-[#00CDAC] block mb-1">{com.userName}</span>
                    <p className="text-[14px] text-gray-800 font-bold">{com.text}</p>
                    {currentUser?.uid === com.uid && (
                      <button onClick={() => handleDeleteComment(selectedPost.id, com)} className="absolute left-2 top-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendComment} className="mt-6 flex gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-inner">
              <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="کۆمێنتەکێ بنڤیسە..." className="flex-1 bg-transparent p-3 outline-none text-[14px] font-bold text-gray-900" />
              <button className="bg-[#00CDAC] text-white px-6 py-2 rounded-xl text-xs font-black active:scale-90 transition-all">فرێکرن</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}