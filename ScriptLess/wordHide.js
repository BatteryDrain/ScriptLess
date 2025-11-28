import { app } from "./script.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

let SCRIPT = "";
let LINES = [];
let VERSIONS = [];
let VERSION = [];
let VERSIONNUM = 0;
let PRIORITIES = [];
const CWords = ["and", "or", "but"];

// UI elements
const out = document.getElementById("out");
const up = document.getElementById("up");
const down = document.getElementById("down");
const updown = document.getElementById("updown");
const ver = document.getElementById("ver");
const ptitle = document.getElementById("ptitle");
const stitle = document.getElementById("stitle");
const count = document.getElementById("count");
const input = document.getElementById("input");

// --- Load script from Firestore ---
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.open("signIn.html", "_self");
        return;
    }

    const scriptId = sessionStorage.getItem("selectedScriptId");
    if (!scriptId) {
        alert("No script selected!");
        return;
    }

    const scriptRef = doc(db, "ScriptSpace", user.uid, "scripts", scriptId);
    const scriptSnap = await getDoc(scriptRef);

    if (scriptSnap.exists()) {
        const scriptData = scriptSnap.data();
        SCRIPT = scriptData.script || "";

        // Display the original script in the output box
        if (out) {
            out.value = SCRIPT;
            // Wait a bit for the DOM to render, then resize properly
            setTimeout(() => autoResizeTextArea(out), 100);
        }

        // Build the versions now that the script is loaded
        list();

        // Ensure textarea fits even after everything else has loaded
        setTimeout(() => {
            if (out) autoResizeTextArea(out);
        }, 300);
    } else {
        alert("No such script found!");
    }
});

// --- Build versions list ---
function list() {
    VERSION.push("");
    const temp = SCRIPT.split(" ");

    PRIORITIES = [];

    for (let i = 0; i < temp.length; i++) {
        PRIORITIES.push("");

        if (!CWords.includes(temp[i].toLowerCase()) && temp[i] !== "") {
            let num = randomInt(1, temp.length);
            while (PRIORITIES.includes(num)) {
                num = randomInt(1, temp.length);
            }
            PRIORITIES[i] = num;
        } else {
            PRIORITIES[i] = "";
        }
    }

    VERSION[0] = SCRIPT;
    VERSIONS.push(VERSION);
    makeV();
    if (updown) updown.max = VERSIONS.length - 1;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Navigation buttons ---
if (up) {
    up.addEventListener("click", () => {
        if (VERSIONNUM < VERSIONS.length - 1) VERSIONNUM++;
        setVersionNumber(VERSIONNUM);
    });
}

if (down) {
    down.addEventListener("click", () => {
        if (VERSIONNUM > 0) VERSIONNUM--;
        setVersionNumber(VERSIONNUM);
    });
}

// --- Version slider (no scroll jump) ---
if (updown) {
    updown.addEventListener("input", (event) => {
        event.preventDefault();
        const scrollY = window.scrollY; // save current scroll position
        VERSIONNUM = Number(updown.value);
        setVersionNumber(VERSIONNUM);
        document.activeElement.blur(); // prevent slider focus from scrolling
        window.scrollTo(0, scrollY); // restore scroll position
    });
}

// --- Create progressive blanked versions ---
function makeV() {
    const baseWords = SCRIPT.split(/(\s+)/); // keep spaces
    const blankableIndexes = [];

    for (let i = 0; i < baseWords.length; i++) {
        const word = baseWords[i];
        if (!CWords.includes(word.toLowerCase()) && !word.match(/^\s+$/)) {
            blankableIndexes.push(i);
        }
    }

    shuffleArray(blankableIndexes);

    const version0 = [SCRIPT, ...baseWords];
    VERSIONS = [version0];

    const blankedIndexes = new Set();

    for (let i = 0; i < blankableIndexes.length; i++) {
        const versionWords = [...baseWords];
        blankedIndexes.add(blankableIndexes[i]);

        for (const idx of blankedIndexes) {
            versionWords[idx] = "■".repeat(baseWords[idx].length);
        }

        const versionText = versionWords.join("");
        const version = [versionText, ...versionWords];
        VERSIONS.push(version);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- Set version and update UI ---
function setVersionNumber(number) {
    if (number === 0) {
        ver.innerHTML = "original";
    } else {
        ver.innerHTML = "version " + VERSIONNUM;
    }
    setOut();
    if (updown) updown.value = VERSIONNUM;
}

// --- Output update with auto height ---
function setOut() {
    if (out) {
        out.value = VERSIONS[VERSIONNUM][0];
        autoResizeTextArea(out);
    }
}

// --- Automatically resize the textarea ---
function autoResizeTextArea(textarea) {
    if (!textarea) return;
    textarea.style.height = "auto"; // reset height
    textarea.style.height = textarea.scrollHeight + "px"; // adjust to content
}

// --- Extra protection: adjust once window fully loads ---
window.addEventListener("load", () => {
    if (out && out.value.trim().length > 0) {
        autoResizeTextArea(out);
    }
});
