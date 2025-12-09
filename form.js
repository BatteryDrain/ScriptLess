import { auth, app } from "./script.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);

const form = document.getElementById("addEventForm");

const titleInput = document.getElementById("eventTitle");
const addressInput = document.getElementById("eventAddress");
const locationInput = document.getElementById("eventLocation");
const dateInput = document.getElementById("eventDate");
const descInput = document.getElementById("eventDescription");

let currentUser = null;

// Watch auth state
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("You must be signed in to create an event.");
    return;
  }

  const title = titleInput.value.trim();
  const address = addressInput.value.trim();   // saved directly
  const location = locationInput.value.trim();
  const dateTime = dateInput.value;
  const description = descInput.value.trim();

  try {
    await addDoc(collection(db, "events"), {
      title,
      address,       // stored EXACTLY as user typed
      location,
      dateTime,
      description,
      userId: currentUser.uid,
      createdAt: serverTimestamp()
    });

    alert("Event created successfully!");
    window.location.href = "commuity.html";

  } catch (err) {
    console.error("Error adding document:", err);
    alert("There was an error creating the event.");
  }
});