// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps} from "firebase/app";
import {getAuth} from "firebase/auth"
import {getFirestore} from "firebase/firestore"
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIsoq3tPlaNjs8E4kv_U1udMc6PeaThtw",
  authDomain: "prepwise-31a78.firebaseapp.com",
  projectId: "prepwise-31a78",
  storageBucket: "prepwise-31a78.firebasestorage.app",
  messagingSenderId: "543676298936",
  appId: "1:543676298936:web:1fdad3da62481fe04a664d",
  measurementId: "G-GXPLMF190Y"
};

// Initialize Firebase
const app = !getApps.length?initializeApp(firebaseConfig):getApp;
export const auth = getAuth(app);
export const db = getFirestore(app);