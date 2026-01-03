import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration for A Good Fit app
const firebaseConfig = {
  apiKey: "AIzaSyBtJhXe8-YGhINT-fZtbCB_CvBjOEgFr0U",
  authDomain: "goodfitapp-a4dc0.firebaseapp.com",
  projectId: "goodfitapp-a4dc0",
  storageBucket: "goodfitapp-a4dc0.firebasestorage.app",
  messagingSenderId: "485801760062",
  appId: "1:485801760062:ios:353b5c4c60de821e64886f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
