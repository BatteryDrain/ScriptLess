// firebase.js or main.js (where you initialize Firebase)
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // onAuthStateChanged is useful for ensuring user is loaded
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  // ... your actual config from the Firebase console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global variable to hold the current user, or get it from auth.currentUser inside functions
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("User is signed in:", user.uid);
  } else {
    currentUser = null;
    console.log("No user is signed in.");
  }
});

// Assume you have an input field where the user types their text
const myTextInput = document.getElementById('myTextInputId'); // Make sure this ID matches your HTML input
const myCollectionName = 'yourCollectionName'; // <-- IMPORTANT: Replace with the actual name of your Firestore collection!


// --- Button Handlers ---

const saveButton = document.getElementById('save');
if (saveButton) {
    saveButton.addEventListener("click", async () => {
        if (!currentUser) {
            console.log("No user signed in. Please sign in to save data.");
            // Optionally, show a login prompt or redirect
            return;
        }

        if (!myTextInput || !myTextInput.value.trim()) {
            console.warn("Text input field not found or is empty. Cannot save empty data.");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, myCollectionName), {
                userId: currentUser.uid,
                userText: myTextInput.value.trim(),
                timestamp: Date.now() // Always good to have a timestamp!
            });
            console.log("Document successfully saved with ID: ", docRef.id);
            myTextInput.value = ''; // Clear the input field after saving
            alert("Data saved successfully!"); // Simple feedback for the user

        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error saving data. Please try again.");
        }
    });
}

const saveNexitButton = document.getElementById('saveNexit');
if (saveNexitButton) {
    saveNexitButton.addEventListener("click", async () => {
        if (!currentUser) {
            console.log("No user signed in. Please sign in to save and exit.");
            return;
        }

        if (!myTextInput || !myTextInput.value.trim()) {
            console.warn("Text input field not found or is empty. Cannot save empty data.");
            // Decide if you want to proceed with 'exit' without saving empty data
            // For now, let's assume we want to save *something*
            alert("Please enter some text before saving and exiting.");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, myCollectionName), {
                userId: currentUser.uid,
                userText: myTextInput.value.trim(),
                timestamp: Date.now()
            });
            console.log("Document successfully saved and exiting with ID: ", docRef.id);
            myTextInput.value = ''; // Clear the input field

            alert("Data saved successfully! Exiting...");
            // --- Add your "exit" logic here ---
            // This could be:
            // - Redirecting to another page: window.location.href = '/dashboard';
            // - Closing a modal: myModal.style.display = 'none';
            // - Navigating in a Single Page App: router.push('/home');
            // For demonstration, let's just log it:
            console.log("Performing exit action...");

        } catch (e) {
            console.error("Error adding document and exiting: ", e);
            alert("Error saving data. Please try again.");
        }
        window.open("builder.html", "_self");
    });
}
