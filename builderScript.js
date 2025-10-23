import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

SCRIPT = "";


const firebaseConfig = {

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

const ScriptSpace = 'ScriptSpace';


const textArea = document.getElementById('textarea');

textArea.addEventListener('input', () => {
    properSize();
    SCRIPT = textArea.value;
});

const saveButton = document.getElementById('save');
if (saveButton) {
    saveButton.addEventListener("click", async () => {
        if (!currentUser) {
            console.log("No user signed in. Please sign in to save data.");
            // Optionally, show a login prompt or redirect
            return;
        }

        if (!textArea || !textArea.value.trim()) {
            console.warn("Text input field not found or is empty. Cannot save empty data.");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, ScriptSpace), {
                userId: currentUser.uid,
                userText: textArea.value.trim(),
                timestamp: Date.now()
            });
            console.log("Document successfully saved with ID: ", docRef.id);
            textArea.value = ''; // Clear the input field after saving
            alert("Data saved successfully!"); // Simple feedback for the user

        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error saving data. Please try again.");
        }
        saveButton.innerHTML = "saved";
    });
}

const saveNexitButton = document.getElementById('saveNexit');
if (saveNexitButton) {
    saveNexitButton.addEventListener("click", async () => {
        if (!currentUser) {
            console.log("No user signed in. Please sign in to save and exit.");
            return;
        }

        if (!textArea || !textArea.value.trim()) {
            console.warn("Text input field not found or is empty. Cannot save empty data.");
            // Decide if you want to proceed with 'exit' without saving empty data
            // For now, let's assume we want to save *something*
            alert("Please enter some text before saving and exiting.");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, ScriptSpace), {
                userId: currentUser.uid,
                userText: textArea.value.trim(),
                timestamp: Date.now()
            });
            console.log("Document successfully saved and exiting with ID: ", docRef.id);

            alert("Data saved successfully! Exiting...");
            window.open("builder.html", "_self");
            console.log("Performing exit action...");

        } catch (e) {
            console.error("Error adding document and exiting: ", e);
            alert("Error saving data. Please try again.");
        }
    });
}