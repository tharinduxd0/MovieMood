//Firebase configuration
// API keys are now loaded from secret.js
const firebaseConfig = FIREBASE_CONFIG;

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