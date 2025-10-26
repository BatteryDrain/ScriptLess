console.log("in scriptSpace.js");
import { auth, app } from "./script.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);

let currentUser = null;
let SCRIPT = "";
let SNAME = "";

const textArea = document.getElementById("textarea");
const scriptN = document.getElementById("scriptN");
const scriptsList = document.getElementById("scriptsList"); // container for script figures

textArea?.addEventListener("input", () => SCRIPT = textArea.value);
scriptN?.addEventListener("input", () => SNAME = scriptN.value);

const SCRIPT_ID = sessionStorage.getItem("currentScriptId");

// --- Watch login ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadUserScripts(user.uid);
  } else {
    window.open("signIn.html", "_self");
  }
});

// --- Save Script ---
async function saveUserScript() {
  const scriptId = sessionStorage.getItem("currentScriptId");
  if (!currentUser) return alert("User not signed in.");
  if (!scriptId) return alert("No script ID found!");

  const scriptRef = doc(db, "ScriptSpace", currentUser.uid, "scripts", scriptId);

  await setDoc(scriptRef, {
    script: SCRIPT,
    name: SNAME || "Untitled",
    timestamp: new Date(),
    userId: currentUser.uid,
    scriptId
  }, { merge: true });

  console.log("✅ Script saved:", scriptId);
  alert("Script saved!");
  await loadUserScripts(currentUser.uid); // reload list
}

// --- Delete Script ---
async function deleteUserScript(scriptId) {
  if (!currentUser) return alert("User not signed in.");
  const confirmDelete = confirm("Are you sure you want to delete this script? This action cannot be undone.");

  if (!confirmDelete) return; // cancel if user hits "Cancel"

  const scriptRef = doc(db, "ScriptSpace", currentUser.uid, "scripts", scriptId);

  try {
    await deleteDoc(scriptRef);
    console.log("🗑️ Script deleted:", scriptId);
    alert("Script deleted!");
    await loadUserScripts(currentUser.uid); // refresh list
  } catch (err) {
    console.error("❌ Error deleting script:", err);
    alert("Error deleting script. Check console.");
  }
}

// --- Make Figure for Each Script ---
function makeFig({ name, script, place = "green", scriptId }) {
  const fig = document.createElement('figure');
    fig.classList.add("tile");
  
  // Top section
  const divTop = document.createElement('div');
  divTop.classList.add("figTop");

  const figT = document.createElement('figcaption');
  figT.textContent = name;
  divTop.appendChild(figT);

  const delButton = document.createElement('button');
  delButton.innerHTML = "🗑";
  delButton.title = "Delete script";

  // Prevent click on delete from opening the script
  delButton.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteUserScript(scriptId);
  });

  divTop.appendChild(delButton);
  fig.appendChild(divTop);

  // Body
  const ta = document.createElement('textarea');
  ta.textContent = script.length > 120 ? script.slice(0, 120) + "..." : script;
  ta.disabled = true;
  fig.appendChild(ta);

  // Click -> open script
  fig.addEventListener("click", () => {
    sessionStorage.setItem("currentScriptId", scriptId);
    window.open("textIn.html", "_self");
  });

  scriptsList.appendChild(fig);
}

// --- Load all scripts for the user ---
async function loadUserScripts(userId) {
  scriptsList.innerHTML = "Loading...";

  const scriptsCol = collection(db, "ScriptSpace", userId, "scripts");
  const scriptsSnapshot = await getDocs(scriptsCol);

  if (scriptsSnapshot.empty) {
    scriptsList.innerHTML = "<p>No scripts saved yet.</p>";
    return;
  }

  scriptsList.innerHTML = "";
  scriptsSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    makeFig({
      name: data.name || "Untitled",
      script: data.script || "",
      place: "green",
      scriptId: data.scriptId
    });
  });
}

// --- Button events ---
document.getElementById("newScript")?.addEventListener("click", () => {
  const newScriptId = crypto.randomUUID();
  sessionStorage.setItem("currentScriptId", newScriptId);
  window.open("textIn.html", "_self");
});
