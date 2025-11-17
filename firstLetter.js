import { app } from "./script.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

let SCRIPT = "";
let VERSIONS = [];
let VERSIONNUM = 0;
const CWords = ["and", "or", "but"];
const EXEMPT_REGEX = /^[\s,.\(\)\[\]\{\}!"'?;:-]+$/;

// UI elements
const out = document.getElementById("out");
const up = document.getElementById("up");
const down = document.getElementById("down");
const updown = document.getElementById("updown");
const ver = document.getElementById("ver");

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
            autoResizeTextArea(out);
        }

        // Build the versions now that the script is loaded
        buildVersions();
    } else {
        alert("No such script found!");
    }
});

// --- Build versions ---
function buildVersions() {
    VERSIONS = [];

    const words = SCRIPT.split(/(\s+)/); // keep spaces
    const scrambleIndexes = [];

    // Identify words to scramble (ignore CWords and special chars)
    words.forEach((word, i) => {
        const lower = word.toLowerCase();
        if (!CWords.includes(lower) && !EXEMPT_REGEX.test(word) && word.length > 3) {
            scrambleIndexes.push(i);
        }
    });

    // Version 0: original
    VERSIONS.push([SCRIPT, ...words]);

    // Shuffle order of words to scramble
    shuffleArray(scrambleIndexes);

    // Generate progressive scrambled versions
    for (let v = 1; v <= scrambleIndexes.length; v++) {
        const versionWords = [...words];
        for (let i = 0; i < v; i++) {
            const idx = scrambleIndexes[i];
            versionWords[idx] = scrambleWord(versionWords[idx]);
        }
        const versionText = versionWords.join("");
        VERSIONS.push([versionText, ...versionWords]);
    }

    if (updown) updown.max = VERSIONS.length - 1;
    setVersionNumber(0);
}

// --- Scramble a word keeping first & last letters ---
function scrambleWord(word) {
    if (word.length <= 3) return word;

    const first = word[0];
    const last = word[word.length - 1];
    const middle = word.slice(1, -1).split('');

    for (let i = middle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [middle[i], middle[j]] = [middle[j], middle[i]];
    }

    return first + middle.join('') + last;
}

// --- Shuffle helper ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- Version navigation ---
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

if (updown) {
    updown.addEventListener("input", (event) => {
        event.preventDefault();
        const scrollY = window.scrollY;
        VERSIONNUM = Number(updown.value);
        setVersionNumber(VERSIONNUM);
        window.scrollTo(0, scrollY);
    });
}

// --- Set current version ---
function setVersionNumber(number) {
    VERSIONNUM = number;
    if (ver) ver.innerHTML = number === 0 ? "original" : "version " + number;
    updateOutput();
    if (updown) updown.value = number;
}

// --- Update output box ---
function updateOutput() {
    if (!out || !VERSIONS[VERSIONNUM]) return;
    out.value = VERSIONS[VERSIONNUM][0];
    autoResizeTextArea(out);
}

// --- Auto-resize textarea ---
function autoResizeTextArea(textarea) {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}

window.addEventListener("load", () => {
    if (out && out.value.trim().length > 0) {
        autoResizeTextArea(out);
    }
});
