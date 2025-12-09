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

/* ---------------- ADDRESS VALIDATION ---------------- */
async function validateAddress(address) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(address)}&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "SCRIPTLESS/1.0 (contact@example.com)"
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.length) return null;

    const result = data[0];
    const addr = result.address || {};

    const hasRoad = !!(addr.road || addr.street || addr.residential);
    const hasCity = !!(addr.city || addr.town || addr.village);
    const hasCountry = !!addr.country;
    const hasNumber = !!addr.house_number;
    const hasPostcode = !!addr.postcode;
    const numberInDisplay = /\b\d{1,5}\b/.test(result.display_name);

    if (hasRoad && hasCity && hasCountry &&
        (hasNumber || hasPostcode || numberInDisplay)) {
      return result;
    }

    if (hasRoad && hasCountry && hasPostcode) {
      return result;
    }

    return null;

  } catch (err) {
    console.error("Address validation error:", err);
    return null;
  }
}

/* ---------------- LOAD EVENT DATA ---------------- */
async function loadEvent(id) {
  const ref = doc(db, "events", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Event not found.");
    window.location.href = "community.html";
    return;
  }

  const data = snap.data();

  titleInput.value = data.title || "";
  addressInput.value = data.address || "";
  locationInput.value = data.location || "";
  dateInput.value = data.dateTime || "";
  descInput.value = data.description || "";
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

  const validAddress = await validateAddress(address);
  if (!validAddress) {
    addressError.textContent = "⚠ Please enter a valid address.";
    return;
  }

  try {
    await updateDoc(doc(db, "events", loadedEventId), {
      title,
      address,
      location,
      dateTime,
      description,
      lat: validAddress.lat,
      lon: validAddress.lon
    });

    alert("Event updated!");
    window.location.href = "community.html";

  } catch (err) {
    console.error(err);
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
    window.location.href = "community.html";
    return;
  }

  loadEvent(eventId);
});