// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZHDPESyAhqWddPaQX6vzCBdTpCI1wKG8",
  authDomain: "coderespite.firebaseapp.com",
  projectId: "coderespite",
  storageBucket: "coderespite.firebasestorage.app",
  messagingSenderId: "275604759648",
  appId: "1:275604759648:web:08679f431c200755dc0f05",
  measurementId: "G-71D0WL4GZ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}