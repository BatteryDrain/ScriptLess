import { auth, app } from "./script.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);

let currentUser = null;
let SCRIPT = "";
let SNAME = "";

const textArea = document.getElementById("textarea");
const scriptN = document.getElementById("scriptN");

textArea?.addEventListener("input", () => SCRIPT = textArea.value);
scriptN?.addEventListener("input", () => SNAME = scriptN.value);

// --- Fallback: if no SCRIPT_ID, generate one ---
let SCRIPT_ID = sessionStorage.getItem("currentScriptId");
if (!SCRIPT_ID) {
    SCRIPT_ID = crypto.randomUUID(); // modern browser method
    sessionStorage.setItem("currentScriptId", SCRIPT_ID);
    console.log("Generated new SCRIPT_ID:", SCRIPT_ID);
}

// --- Watch for login ---
onAuthStateChanged(auth, (user) => {
  if (user) currentUser = user;
  else window.open("signIn.html", "_self");
});

// --- Save ---
async function saveUserScript() {
  if (!currentUser) return alert("User not signed in.");
  if (!SCRIPT_ID) return alert("No script ID found!");

  const scriptRef = doc(db, "ScriptSpace", currentUser.uid, "scripts", SCRIPT_ID);

  try {
    await setDoc(scriptRef, {
      script: SCRIPT,
      name: SNAME || "Untitled",
      timestamp: new Date(),
      userId: currentUser.uid,
      scriptId: SCRIPT_ID
    }, { merge: true });

    console.log("✅ Script saved:", SCRIPT_ID);
    alert("Script saved!");
  } catch (err) {
    console.error("❌ Error saving script:", err);
    alert("Error saving script. Check console.");
  }
}

document.getElementById("save")?.addEventListener("click", saveUserScript);
document.getElementById("saveNexit")?.addEventListener("click", async () => {
  await saveUserScript();
  window.open("builder.html", "_self");
});
