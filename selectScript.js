console.log("in selectScript.js");

import { auth, app } from "./script.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);
const scriptsList = document.getElementById("scriptsList");

// Get game from URL
const params = new URLSearchParams(window.location.search);
const selectedGame = params.get("game"); // e.g. "fillBlanks" or "quizMode"
console.log("Selected game:", selectedGame);

// Handle script click
function handleScriptClick(scriptId) {
  if (!selectedGame) return alert("No game selected.");

  sessionStorage.setItem("selectedScriptId", scriptId);

  switch (selectedGame) {
    case "fillBlanks":
      window.location.href = "fillBlanks.html";
      break;
    case "quizMode":
      window.location.href = "quizMode.html";
      break;
    default:
      alert("Unknown game mode!");
  }
}

// Build each figure
function makeFig({ name, script, scriptId }) {
  const fig = document.createElement('figure');

  const divTop = document.createElement('div');
  divTop.classList.add("figTop");

  const figT = document.createElement('figcaption');
  figT.textContent = name;
  divTop.appendChild(figT);
  fig.appendChild(divTop);

  const ta = document.createElement('textarea');
  ta.textContent = script.length > 500 ? script.slice(0, 500) + "..." : script; // increase preview length
  ta.disabled = true;
  fig.appendChild(ta);

  // 🔥 click → game
  fig.onclick = () => handleScriptClick(scriptId);

  scriptsList.appendChild(fig);
}

// Load user scripts
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.open("signIn.html", "_self");

  const scriptsCol = collection(db, "ScriptSpace", user.uid, "scripts");
  const snapshot = await getDocs(scriptsCol);

  if (snapshot.empty) {
    scriptsList.innerHTML = "<p>No scripts saved yet.</p>";
    return;
  }

  scriptsList.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    makeFig({
      name: data.name || "Untitled",
      script: data.script || "",
      scriptId: data.scriptId
    });
  });
});
