import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNyiEvsqCxWDFiuhMvVuL4Ra8ZOuFeO1c",
  authDomain: "zebar12.firebaseapp.com",
  projectId: "zebar12",
  storageBucket: "zebar12.firebasestorage.app",
  messagingSenderId: "881454505750",
  appId: "1:881454505750:web:0622729fbcb63d8334ba37",
  measurementId: "G-K52GK3EX2Z"
};

// ڕێگری لە دروستبوونی زیاتر لە ئەپێک دەکەین
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ئەمانە زۆر گرنگن، بەبێ وشەی export فایلەکانی تر نایانبینن
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ئەمە وا دەکات هەر کاتێک دوگمەکەت داگرت، گۆگڵ بپرسێت کام ئیمەیڵ هەڵدەبژێریت
googleProvider.setCustomParameters({ prompt: 'select_account' });