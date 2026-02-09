"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setNewName(userDoc.data().name);
          setNewPhoto(userDoc.data().photo);
        }
      } else { router.push("/register"); }
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdate = async () => {
    if (!newName.trim()) return alert("ناو بنووسە");
    await updateDoc(doc(db, "users", user.uid), { name: newName, photo: newPhoto });
    alert("بە سەرکەوتوویی نوێکرایەوە!");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-right" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">ڕێکخستنی پڕۆفایل</h1>
        <div className="space-y-4">
          <div className="flex justify-center"><img src={newPhoto || "/login.png"} className="w-20 h-20 rounded-full border-2 border-blue-500 object-cover" /></div>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-3 border rounded-xl outline-none text-black" placeholder="ناوی نوێ..." />
          <input value={newPhoto} onChange={(e) => setNewPhoto(e.target.value)} className="w-full p-3 border rounded-xl outline-none text-black" placeholder="لینکی وێنەی نوێ (URL)..." />
          <button onClick={handleUpdate} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-md">پاشەکەوتکردن</button>
          <button onClick={() => router.push("/")} className="w-full text-gray-500 text-sm">گەڕانەوە بۆ چات</button>
        </div>
      </div>
    </div>
  );
}