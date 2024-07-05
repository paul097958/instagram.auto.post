// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASaumk37UrkinEqpNalegvpmgmP3vSKww",
  authDomain: "anonymous-222c5.firebaseapp.com",
  projectId: "anonymous-222c5",
  storageBucket: "anonymous-222c5.appspot.com",
  messagingSenderId: "271979966701",
  appId: "1:271979966701:web:e2cc18d336426e163f5ce4",
  measurementId: "G-B2DWHX9GN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const IMGUR_TOKEN = "f87419b6f46d12a5966882fc3349c54eccdc109e"
const SERVER_URL = "https://instajajh.onrender.com/send"
const APP_NAME = "匿名仁中"

export { db, IMGUR_TOKEN, SERVER_URL, APP_NAME }