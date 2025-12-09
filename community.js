import { auth, app } from "./script.js";
import { 
  getFirestore, collection, getDocs, doc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);

const eventsContainer = document.getElementById("events");

// -------- MAKE EVENT CARDS -------------
function makeFig(title, time, description, creatorUid, eventId, currentUid) {
    const fig = document.createElement('figure');
    fig.classList.add("fig");
    fig.dataset.id = eventId;     // store eventId on the element

    const figT = document.createElement('figcaption');
    figT.innerHTML = `${title}<br><span class="time">${time}</span>`;
    fig.appendChild(figT);

    const p = document.createElement('p');
    p.textContent = description;
    fig.appendChild(p);

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