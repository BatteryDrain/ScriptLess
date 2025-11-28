import { app } from "./script.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

let WORDS = [];

let SCRIPT = "";
let LINES = [];
let VERSIONS = [];
let VERSION = [];
let VERSIONNUM = 1;
let PRIORITIES = [];
let SRENTANCES = [];
let FRONT = [];

const up = document.getElementById("up");
const down = document.getElementById("down");
const updown = document.getElementById("updown");
const ver = document.getElementById("ver");
const frontIn = document.getElementById("frontIn");
const backIn = document.getElementById("backIn");
const front = document.getElementById("front");
const back = document.getElementById("back");

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

        // Build the versions now that the script is loaded
        list();
    } else {
        alert("No such script found!");
    }
});

function list() {
    const temp = SCRIPT.split(".");

    for (let i = 0; i < temp.length; i++) {
        SRENTANCES.push(temp[i]);
        findTop(i, SRENTANCES[i]);
    }
    console.log(SRENTANCES);
    if (updown) updown.max = SRENTANCES.length
    if (backIn) backIn.innerHTML = SRENTANCES[1];
    if (frontIn) frontIn.innerHTML = FRONT[1];
}

function set() {
    if (backIn) backIn.innerHTML = SRENTANCES[VERSIONNUM];
    if (frontIn) frontIn.innerHTML = FRONT[VERSIONNUM];
}

if (up) {
    up.addEventListener("click", () => {
        if (VERSIONNUM < SRENTANCES.length) VERSIONNUM++;
        setVersionNumber(VERSIONNUM);
    });
}

if (down) {
    down.addEventListener("click", () => {
        if (VERSIONNUM > 1) VERSIONNUM--;
        setVersionNumber(VERSIONNUM);
    });
}

if (updown) {
    updown.addEventListener("change", () => {
        VERSIONNUM = Number(updown.value);
        setVersionNumber(VERSIONNUM);
    });
}

if (front) {
    front.addEventListener("click", () => {
        flip();
    });
}

if (back) {
    back.addEventListener("click", () => {
        flip();
    });
}

function setVersionNumber(number){
    ver.innerHTML = "card " + VERSIONNUM;
    set();
    updown.value = VERSIONNUM;
    if(front.classList.contains("hide")){flip();}
}

function flip() {
    front.classList.toggle("hide");
    back.classList.toggle("hide");
    console.log("flip");
}

function findTop(index, sen) {
    let sentance = sen.split(" ");
    let temp = sentance[0];
    // console.log(sentance);
    for(let i=0; i<sentance.length; i++) {
        if(temp.length < sentance[i].length) {
            temp = sentance[i];
        }
    }
    FRONT.push(temp);
}