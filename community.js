import { auth, app } from "./script.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  deleteDoc,
  getDoc,
  setDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);

const eventsContainer = document.getElementById("events");

// -------- MAKE EVENT CARDS -------------
function makeFig(title, time, description, address, location, creatorUid, eventId, currentUid) {
    const fig = document.createElement('figure');
    fig.classList.add("fig");
    fig.dataset.id = eventId;

    // Title and time
    const figT = document.createElement('figcaption');
    figT.innerHTML = `${title}<br><span class="time">${time}</span>`;
    fig.appendChild(figT);

    // Description
    if (description) {
        const pDesc = document.createElement('p');
        pDesc.textContent = description;
        fig.appendChild(pDesc);
    }

    // Address
    if (address) {
        const pAddr = document.createElement('p');
        pAddr.textContent = "📍" + address;
        pAddr.classList.add("event-address");
        fig.appendChild(pAddr);
    }

    // Location name
    if (location) {
        const pLoc = document.createElement('p');
        pLoc.textContent = location;
        pLoc.classList.add("event-location");
        fig.appendChild(pLoc);
    }

    // Buttons wrapper
    const div = document.createElement("div");
    div.classList.add("divB", "row");

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "edit";
    editBtn.classList.add("edit");
    if (creatorUid !== currentUid) editBtn.classList.add("hide");
    div.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "delete";
    deleteBtn.classList.add("delete");
    if (creatorUid !== currentUid) deleteBtn.classList.add("hide");
    div.appendChild(deleteBtn);

    fig.appendChild(div);

    return fig;
}

// ----------------- DELETE -----------------
async function deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
        await deleteDoc(doc(db, "events", eventId));
        alert("Event deleted.");
        loadEvents(currentUser.uid); // reload page
    } catch (err) {
        console.error("Delete failed:", err);
        alert("Could not delete event.");
    }
}

// ------------------ EDIT ------------------
function editEvent(eventId) {
    // You will create editEvent.html later
    window.location.href = `editEvent.html?id=${eventId}`;
}

// -------- ADD EVENT BUTTON -------------
let currentUser = null;

const addEventBtn = document.getElementById("addEvent");

addEventBtn.addEventListener("click", (e) => {
    if (!currentUser) {
        e.preventDefault();
        alert("Please sign in to add an event.");
    } else {
        window.location.href = "form.html";
    }
});

// -------- LOAD EVENTS -------------------
async function loadEvents(currentUid) {
    const eventsCol = collection(db, "events");
    const snapshot = await getDocs(eventsCol);

    const content = document.getElementById("content");
    content.innerHTML = "";

    snapshot.forEach(docSnap => {
        const data = docSnap.data();

        const fig = makeFig(
            data.title || "Untitled event",
            data.dateTime || "",
            data.description || "",
            data.address || "",
            data.location || "",
            data.userId,
            docSnap.id,
            currentUid
        );

        content.appendChild(fig);
    });

    // NOW attach listeners to edit & delete buttons
    document.querySelectorAll(".edit").forEach(btn => {
        btn.addEventListener("click", () => {
            const eventId = btn.closest("figure").dataset.id;
            editEvent(eventId);
        });
    });

    document.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", () => {
            const eventId = btn.closest("figure").dataset.id;
            deleteEvent(eventId);
        });
    });
}

// -------- AUTH LISTENER -----------------
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    loadEvents(user ? user.uid : null);
});

// --------- PROFILE SETUP (USERNAME & PFP) ---------
onAuthStateChanged(auth, async (user) => {
  currentUser = user; // keep currentUser updated

  if (!user) return; // exit if no user

  const userDocRef = doc(db, "Users", currentUser.uid);

  // Ensure DOM elements exist
  const pictSelectEl = document.getElementById("pictSelect");
  const userNameEl = document.getElementById("userName");
  const pfpEl = document.getElementById("pfp");
  const errorEl = document.getElementById("eror");

  if (!pictSelectEl || !userNameEl || !pfpEl || !errorEl) return;

  // Load existing user data
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.username) userNameEl.value = data.username;
      if (data.pictSelect) {
        pictSelectEl.value = data.pictSelect;
        pfpEl.src = "assets/" + data.pictSelect + ".png";
      }
    }
  } catch (err) {
    console.error("Error loading user data:", err);
  }

  // PFP change listener
  pictSelectEl.addEventListener("change", async () => {
    pfpEl.src = "assets/" + pictSelectEl.value + ".png";
    try {
      await setDoc(userDocRef, { pictSelect: pictSelectEl.value }, { merge: true });
    } catch (err) {
      console.error("Error saving PFP:", err);
      errorEl.textContent = "Could not save profile picture.";
    }
  });

  // Username change listener
  userNameEl.addEventListener("change", async () => {
    const username = userNameEl.value.trim();
    if (!username) {
      errorEl.textContent = "Username cannot be empty";
      return;
    }

    try {
      // Check for duplicates
      const qSnap = await getDocs(query(collection(db, "Users"), where("username", "==", username)));
      if (!qSnap.empty && qSnap.docs.some(d => d.id !== currentUser.uid)) {
        errorEl.textContent = "Username already in use";
        return;
      }

      // Save username
      await setDoc(userDocRef, { username }, { merge: true });
      errorEl.textContent = "Username set successfully!";
    } catch (err) {
      console.error("Error saving username:", err);
      errorEl.textContent = "Could not save username.";
    }
  });
});
