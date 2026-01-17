//Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGZC3CXXMGGILhEUlgVDn6wpT7MTMTJbM",
  authDomain: "moviemood-b1378.firebaseapp.com",
  projectId: "moviemood-b1378",
  storageBucket: "moviemood-b1378.firebasestorage.app",
  messagingSenderId: "431597643962",
  appId: "1:431597643962:web:ebaa6e2f5faaf5f1daba83"
};

// Initialize Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firestore
const db = firebase.firestore();

try {
    db.settings({ 
        experimentalForceLongPolling: true
    });
} catch (e) {
    console.warn('Could not apply Firestore settings:', e.message);
}