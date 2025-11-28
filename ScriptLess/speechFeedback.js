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

// Output textarea for showing blanked → revealed script
const out = document.getElementById("out");

// Safe auto-resize ONLY for #out
function resizeOut() {
  if (!out) return;
  out.style.height = "auto";
  out.style.height = out.scrollHeight + "px";
}

// Safe auto-resize for transcript
function resizeTranscript() {
  if (!transcriptEl) return;
  transcriptEl.style.height = "auto";
  transcriptEl.style.height = transcriptEl.scrollHeight + "px";
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

// --- Create blanked-out version of script ---
function setupBlankScript() {
  SCRIPT_WORDS = SCRIPT.split(/\s+/).filter(Boolean);
  REVEALED = new Array(SCRIPT_WORDS.length).fill(false);

  const blanked = SCRIPT_WORDS.map((w) => "■".repeat(w.length)).join(" ");

  if (out) {
    out.value = blanked;
    resizeOut();
  }
}

// sanitize a word (remove punctuation, lowercase)
function sanitizeWord(w) {
  return (w || "").toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/gi, "");
}

// --- Reveal next word only when spoken ---
function revealWords(spokenText) {
  if (!spokenText) return;

  const spokenWords = spokenText
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^a-z0-9']/g, ""))
    .filter(Boolean);

  if (spokenWords.length === 0) return;

  for (const spoken of spokenWords) {
    const nextIdx = REVEALED.findIndex(v => v === false);
    if (nextIdx === -1) break;

    const target = sanitizeWord(SCRIPT_WORDS[nextIdx]);
    if (spoken === target) {
      REVEALED[nextIdx] = true;
    }
  }

  const updated = SCRIPT_WORDS.map((w, i) =>
    REVEALED[i] ? w : "■".repeat(w.length)
  ).join(" ");

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

    if (transcriptEl) {
      transcriptEl.value = transcriptText;
      resizeTranscript();
    }

    revealWords(transcriptText);
  };

  recognition.onend = () => {
    statusEl.textContent = "Recording stopped.";
    analyzeSpeech();
    if (recordBtn) {
      recordBtn.disabled = false;
      recordBtn.textContent = "Start Recording";
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    statusEl.textContent =
      "An error occurred during speech recognition: " + event.error;
    if (recordBtn) {
      recordBtn.disabled = false;
      recordBtn.textContent = "Start Recording";
    }
  };
}

// --- Analyze results (with words, fillers, and WPM) ---
function analyzeSpeech() {
  const endTime = Date.now();
  const durationSec = (endTime - recordingStartTime) / 1000;
  const words = transcriptText.trim().split(/\s+/).filter(Boolean);

  // Words per minute
  const wpm = durationSec > 0 ? Math.round((words.length / durationSec) * 60) : 0;
  wpmEl.textContent = isFinite(wpm) ? wpm : 0;

  // Filler words
  const fillerWords = ["um", "uh", "like", "you", "know", "so"];
  let fillerCount = 0;
  words.forEach((w) => {
    if (fillerWords.includes(w.toLowerCase())) fillerCount++;
  });
  fillersEl.textContent = fillerCount;

  // Script match %
  if (SCRIPT) {
    const scriptWords = SCRIPT.toLowerCase().split(/\s+/).filter(Boolean);
    let matchCount = 0;
    words.forEach((w) => {
      if (scriptWords.includes(w.toLowerCase())) matchCount++;
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
  try {
    recognition.start();
    if (recordBtn) {
      recordBtn.disabled = true;
      recordBtn.textContent = "Recording...";
    }
  } catch (err) {
    try { recognition.stop(); } catch (e) {}
  }
});

// --- Initialize ---
initSpeechRecognition();