import { auth, app } from "./script.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);

let currentUser = null;
let SCRIPT = "";
let SNAME = "";

const textArea = document.getElementById("textarea");
const scriptN = document.getElementById("scriptN");

textArea?.addEventListener("input", () => SCRIPT = textArea.value);
scriptN?.addEventListener("input", () => SNAME = scriptN.value);

// --- Get or create SCRIPT_ID ---
let SCRIPT_ID = sessionStorage.getItem("currentScriptId");
if (!SCRIPT_ID) {
  SCRIPT_ID = crypto.randomUUID();
  sessionStorage.setItem("currentScriptId", SCRIPT_ID);
  console.log("Generated new SCRIPT_ID:", SCRIPT_ID);
}

// --- Watch for login and load script ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadUserScript(); // 👈 load existing script if it exists
  } else {
    window.open("signIn.html", "_self");
  }
});

// --- Load Script (when editing existing one) ---
async function loadUserScript() {
  if (!currentUser || !SCRIPT_ID) return;

  const scriptRef = doc(db, "ScriptSpace", currentUser.uid, "scripts", SCRIPT_ID);
  const docSnap = await getDoc(scriptRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    scriptN.value = data.name || "";
    textArea.value = data.script || "";
    SCRIPT = data.script || "";
    SNAME = data.name || "";
    console.log("✅ Loaded script:", SCRIPT_ID);
  } else {
    console.log("ℹ️ No existing script found (new script).");
  }
}

// --- Save Script ---
async function saveUserScript() {
  if (!currentUser) return alert("User not signed in.");
  if (!SCRIPT_ID) return alert("No script ID found!");

  const scriptRef = doc(db, "ScriptSpace", currentUser.uid, "scripts", SCRIPT_ID);

  try {
    await setDoc(
      scriptRef,
      {
        script: SCRIPT,
        name: SNAME || "Untitled",
        timestamp: new Date(),
        userId: currentUser.uid,
        scriptId: SCRIPT_ID,
      },
      { merge: true }
    );

    console.log("✅ Script saved:", SCRIPT_ID);
    alert("Script saved!");
  } catch (err) {
    console.error("❌ Error saving script:", err);
    alert("Error saving script. Check console.");
  }
}

// --- Button events ---
document.getElementById("save")?.addEventListener("click", saveUserScript);
document.getElementById("saveNexit")?.addEventListener("click", async () => {
  await saveUserScript();
  window.open("builder.html", "_self");
});
