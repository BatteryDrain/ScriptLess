console.log("in scriptSpace.js");
import { auth, app } from "./script.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
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

// --- Make Figure for Each Script ---
function makeFig({ name, script, place = "green", scriptId }) {
  const fig = document.createElement('figure');
  
  // Top section
  const divTop = document.createElement('div');
  divTop.classList.add("figTop");
  
  const figT = document.createElement('figcaption');
  figT.textContent = name;
  divTop.appendChild(figT);
  fig.appendChild(divTop);

  // Body
  const spn = document.createElement('span');
  const p = document.createElement('p');
  p.textContent = script.length > 120 ? script.slice(0, 120) + "..." : script;
  spn.appendChild(p);
  fig.appendChild(spn);

  // Color code
  if (place === "green") fig.style.backgroundColor = "rgb(115, 169, 102)";
  if (place === "yellow") fig.style.backgroundColor = "rgb(224, 227, 62)";
  if (place === "red") fig.style.backgroundColor = "rgb(205, 49, 49)";

  // Click -> open script
  fig.onclick = () => {
    sessionStorage.setItem("currentScriptId", scriptId);
    window.open("textIn.html", "_self");
  };

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
