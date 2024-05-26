// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBo3bc8qBlEppQeGjst_ntBRwNEmmVg6pM",
  authDomain: "tk-13-99d8e.firebaseapp.com",
  projectId: "tk-13-99d8e",
  storageBucket: "tk-13-99d8e.appspot.com",
  messagingSenderId: "293671812748",
  appId: "1:293671812748:web:85f7b8d67d2ff8904345a9",
  measurementId: "G-WTE3VDETT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const db = getFirestore(app);

export { db };