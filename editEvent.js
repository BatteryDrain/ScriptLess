/* ---------------- IMPORTS ---------------- */
import { auth, app } from "./script.js";
import {
  getFirestore, doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);

/* ---------------- FORM ELEMENTS ---------------- */
const form = document.getElementById("editEventForm");

const titleInput = document.getElementById("eventTitle");
const addressInput = document.getElementById("eventAddress");
const locationInput = document.getElementById("eventLocation");
const dateInput = document.getElementById("eventDate");
const descInput = document.getElementById("eventDescription");
const addressError = document.getElementById("addressError");

let currentUser = null;
let loadedEventId = null;

/* ---------------- LOAD EVENT DATA ---------------- */
async function loadEvent(id) {
  const ref = doc(db, "events", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Event not found.");
    window.location.href = "commuity.html";
    return;
  }

  const data = snap.data();

  titleInput.value = data.title || "";
  addressInput.value = data.address || "";
  locationInput.value = data.location || "";
  descInput.value = data.description || "";

  // prefill date/time in proper format for input[type=datetime-local]
  if (data.dateTime) {
    const dt = new Date(data.dateTime);
    const localISO = dt.toISOString().slice(0,16);
    dateInput.value = localISO;
  }
}

/* ---------------- SUBMIT EDIT ---------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  addressError.textContent = "";

  if (!currentUser) {
    alert("You must be signed in.");
    return;
  }

  const title = titleInput.value.trim();
  const address = addressInput.value.trim();
  const location = locationInput.value.trim();
  const dateTime = dateInput.value;
  const description = descInput.value.trim();

  try {
    await updateDoc(doc(db, "events", loadedEventId), {
      title,
      address,
      location,
      dateTime,
      description
    });

    alert("Event updated!");
    window.location.href = "commuity.html";

  } catch (err) {
    console.error("Failed to update event:", err);
    alert("Failed to update event.");
  }
});

/* ---------------- AUTH + INITIAL LOAD ---------------- */
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  loadedEventId = eventId;

  if (!eventId) {
    alert("Missing event ID.");
    window.location.href = "commuity.html";
    return;
  }

  loadEvent(eventId);
});