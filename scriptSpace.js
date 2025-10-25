console.log("in scriptSpace.js");
import { auth, app } from "./script.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore(app);

let currentUser = null;
let SCRIPT = "";
let SNAME = "";

const textArea = document.getElementById("textarea");
const scriptN = document.getElementById("scriptN");
const scriptsList = document.getElementById("scriptsList"); // div to display saved scripts

textArea?.addEventListener("input", () => SCRIPT = textArea.value);
scriptN?.addEventListener("input", () => SNAME = scriptN.value);

const SCRIPT_ID = sessionStorage.getItem("currentScriptId");

// --- Watch login ---
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
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
    const p = document.createElement("p");
    p.textContent = `${data.name} — ${new Date(data.timestamp.seconds * 1000).toLocaleString()}`;
    scriptsList.appendChild(p);
  });
}

// --- Button events ---
document.getElementById("newScript")?.addEventListener("click", () => {
  const newScriptId = crypto.randomUUID();
  sessionStorage.setItem("currentScriptId", newScriptId);
  window.open("textIn.html", "_self");
});


function makeFig(){
    fig = document.createElement('figure');
            div = document.createElement('div');
                div.classList.add("figTop");
                figT = document.createElement('figcaption');
                figT.innerHTML = NAME;
            div.appendChild(figT);

            div1 = document.createElement('div');

            spn = document.createElement('span');
                p = document.createElement('p');
                p.innerHTML = SCRIPT;
                spn.appendChild(p);
            fig.appendChild(spn);

            fig.appendChild(div2);
            fig.setAttribute("onclick", "goToLink(" + (insert info here) + ")");

            if(place == "green"){
                fig.style.backgroundColor = "rgb(115, 169, 102)";
            }
            if(place == "yellow"){
                fig.style.backgroundColor = "rgb(224, 227, 62)";
            }
            if(place == "red"){
                fig.style.backgroundColor = "rgb(205, 49, 49)";
            }
            colum.appendChild(fig);
}
