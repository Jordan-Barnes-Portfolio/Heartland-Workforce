import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC8gKyBTNczua_QDdwTk0o0ThqUvMnDBSI",
  authDomain: "heartland-primary.firebaseapp.com",
  projectId: "heartland-primary",
  storageBucket: "heartland-primary.firebasestorage.app",
  messagingSenderId: "658501164952",
  appId: "1:658501164952:web:cc1194f74eba79f5c795ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };