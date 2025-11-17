// speechFeedback.js
import { app } from "./script.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

let SCRIPT = "";
let SCRIPT_WORDS = [];
let REVEALED = [];

// UI elements
const recordBtn = document.getElementById("recordBtn");
const statusEl = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");
const wpmEl = document.getElementById("wpm");
const fillersEl = document.getElementById("fillers");
const scriptMatchEl = document.getElementById("scriptMatch");
const resultsPanel = document.getElementById("results");

// ⭐ ADDED: Output textarea for showing blanked → revealed script
const out = document.getElementById("out");

// ⭐ ADDED: Safe auto-resize ONLY for #out
function resizeOut() {
  if (!out) return; // only touches #out, not transcript
  out.style.height = "auto";
  out.style.height = out.scrollHeight + "px";
}

let recognition = null;
let recordingStartTime = 0;
let transcriptText = "";

// --- Load script ---
async function loadScript(user) {
  const scriptId = sessionStorage.getItem("selectedScriptId");
  if (!scriptId) {
    alert("No script selected! Please choose a script first.");
    return;
  }
  let scriptText = "";
  if (user) {
    const scriptRef = doc(db, "ScriptSpace", user.uid, "scripts", scriptId);
    const scriptSnap = await getDoc(scriptRef);
    if (scriptSnap.exists()) {
      scriptText = scriptSnap.data().script || "";
    }
  }
  if (!user || !scriptText) {
    try {
      const raw = localStorage.getItem("localScripts");
      const scripts = raw ? JSON.parse(raw) : {};
      const data = scripts[scriptId];
      if (data) scriptText = data.script || "";
    } catch (e) {
      console.error("Error reading localScripts", e);
    }
  }
  SCRIPT = scriptText;
  setupBlankScript();
}

// --- Create the blanked-out version of the script ---
function setupBlankScript() {
  SCRIPT_WORDS = SCRIPT.split(/\s+/);
  REVEALED = new Array(SCRIPT_WORDS.length).fill(false);

  const blanked = SCRIPT_WORDS.map((w) => "■".repeat(w.length)).join(" ");

  // ⭐ ADDED: Display blanked version in #out instead of #transcript
  if (out) {
    out.value = blanked;
    resizeOut();
  }
}

// --- Reveal words in order as they’re spoken ---
function revealWords(spokenText) {
  const spokenWords = spokenText.toLowerCase().split(/\s+/);
  let revealIndex = 0;

  for (let i = 0; i < SCRIPT_WORDS.length; i++) {
    if (REVEALED[i]) continue;
    const scriptWord = SCRIPT_WORDS[i].toLowerCase().replace(/[^a-z0-9']/g, "");
    const spokenWord = spokenWords[revealIndex]?.replace(/[^a-z0-9']/g, "");

    if (spokenWord === scriptWord) {
      REVEALED[i] = true;
      revealIndex++;
    }
  }

  const updated = SCRIPT_WORDS.map((w, i) =>
    REVEALED[i] ? w : "■".repeat(w.length)
  ).join(" ");

  // ⭐ ADDED: Update #out instead of #transcript
  if (out) {
    out.value = updated;
    resizeOut();
  }
}

// --- Auth state and script loading ---
onAuthStateChanged(auth, async (user) => {
  await loadScript(user);
});

// --- Speech recognition setup ---
function initSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent =
      "Your browser does not support speech recognition. Please try a different browser.";
    recordBtn.disabled = true;
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onstart = () => {
    recordingStartTime = Date.now();
    transcriptText = "";
    resultsPanel.classList.add("hide");
    statusEl.textContent = "Listening... Speak now.";
  };

  recognition.onresult = (event) => {
    transcriptText = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ");

    revealWords(transcriptText);
  };

  recognition.onend = () => {
    statusEl.textContent = "Recording stopped.";
    analyzeSpeech();
    recordBtn.disabled = false;
    recordBtn.textContent = "Start Recording";
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    statusEl.textContent =
      "An error occurred during speech recognition: " + event.error;
    recordBtn.disabled = false;
    recordBtn.textContent = "Start Recording";
  };
}

// --- Analyze results ---
function analyzeSpeech() {
  const endTime = Date.now();
  const durationSec = (endTime - recordingStartTime) / 1000;
  const words = transcriptText.trim().split(/\s+/).filter(Boolean);

  const wpm = durationSec > 0 ? Math.round((words.length / durationSec) * 60) : 0;
  wpmEl.textContent = isFinite(wpm) ? wpm : 0;

  const fillerWords = ["um", "uh", "like", "you", "know", "so"];
  let fillerCount = 0;
  words.forEach((w) => {
    if (fillerWords.includes(w.toLowerCase())) fillerCount++;
  });
  fillersEl.textContent = fillerCount;

  if (SCRIPT) {
    const scriptWords = SCRIPT.toLowerCase().split(/\s+/).filter(Boolean);
    const scriptSet = new Set(scriptWords);
    let matchCount = 0;
    words.forEach((w) => {
      if (scriptSet.has(w.toLowerCase())) matchCount++;
    });
    const matchPercent =
      scriptWords.length > 0
        ? Math.round((matchCount / scriptWords.length) * 100)
        : 0;
    scriptMatchEl.textContent = matchPercent + "%";
  } else {
    scriptMatchEl.textContent = "N/A";
  }

  resultsPanel.classList.remove("hide");
}

// --- Start recording ---
recordBtn?.addEventListener("click", () => {
  if (!recognition) return;
  recordBtn.disabled = true;
  recordBtn.textContent = "Recording...";
  try {
    recognition.start();
  } catch (err) {
    console.error(err);
  }
});

// --- Initialize ---
initSpeechRecognition();
