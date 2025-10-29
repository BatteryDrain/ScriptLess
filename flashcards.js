import { app } from "./script.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

let WORDS = [];












function setVersionNumber(number){
    if(number == 0){
        ver.innerHTML = "original";
    }
    else{
        ver.innerHTML = "version " + VERSIONNUM;
    }
    setOut();
    updown.value = VERSIONNUM;
}