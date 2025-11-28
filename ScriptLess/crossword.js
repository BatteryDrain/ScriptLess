import { app } from "./script.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

let WORDS = [];
const EXCLUDED_WORDS = [
    "she", "his", "her", "him", "the", "for", "who", "hey", "well", "their",
    "like", "just", "ladies", "folks", "guys", "team",
    "and", "but", "because", "then", "also",
    "part", "slide", "note", "script", "end", "stop"
];
let WORDSF = [];


onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.open("signIn.html", "_self");
        return;
    }

    // Get the selected script ID
    const scriptId = sessionStorage.getItem("selectedScriptId");
    if (!scriptId) {
        alert("No script selected!");
        return;
    }

    // Get script document from Firestore
    const scriptRef = doc(db, "ScriptSpace", user.uid, "scripts", scriptId);
    const scriptSnap = await getDoc(scriptRef);

    if (scriptSnap.exists()) {
        const scriptData = scriptSnap.data();
        const scriptText = scriptData.script || "";

        // Split into words
        WORDS = scriptText.split(/\s+/).filter(Boolean); // splits on any whitespace
        // console.log("WORDS:", WORDS);
    } else {
        console.log("No such script found!");
    }

for (let i = 0; i < WORDS.length; i++) {
    const rawWord = WORDS[i];

    const allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let cleanWord = "";
    for (let char of rawWord) {
        if (allowedChars.includes(char)) {
            cleanWord += char;
        }
    }

    const lowerWord = cleanWord.toLowerCase();
    const isValid = cleanWord.length > 2 && !EXCLUDED_WORDS.includes(lowerWord);

    if (isValid) {
        WORDSF.push(cleanWord);
    }
}

    window.WORDS = WORDS;
    window.WORDSF = WORDSF;

    let val = 40;

    drawCrossword(WORDSF.slice(0, val));

    const ol = document.getElementById("list");

    for(let i=0; i<val; i++){
        let li = document.createElement('li');
        li.textContent = WORDSF[i];
        ol.appendChild(li);
    }
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function drawCrossword(words) {
  const gridSize = 20;        // number of rows/columns
  const cellSize = 30;        // pixels per cell
  const grid = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(null)
  );

  // Place each word
  let x = 0;
  let y = 0;

  for (let word of words) {
    const dir = Math.floor(Math.random() * 3); // 0=horizontal,1=vertical,2=diagonal
    let dx = 0, dy = 0;

    if (dir === 0) { dx = 1; dy = 0; }       // horizontal
    else if (dir === 1) { dx = 0; dy = 1; }  // vertical
    else { dx = 1; dy = 1; }                 // diagonal

    // Adjust starting position if word would overflow
    if (x + dx * word.length >= gridSize) x = 0;
    if (y + dy * word.length >= gridSize) y = 0;

    // Place the word
    for (let i = 0; i < word.length; i++) {
      grid[y + i * dy][x + i * dx] = word[i].toUpperCase();
    }

    // Move start position for next word (random-ish)
    x = (x + 3) % gridSize;
    y = (y + 2) % gridSize;
  }

  // Fill empty cells with random letters
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (!grid[row][col]) {
        const randIndex = Math.floor(Math.random() * alphabet.length);
        grid[row][col] = alphabet[randIndex];
      }
    }
  }

  // Draw grid and letters
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "20px 'IBM Plex Sans Devanagari'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const xPos = col * cellSize;
      const yPos = row * cellSize;
      ctx.strokeRect(xPos, yPos, cellSize, cellSize);
      const letter = grid[row][col];
      if (letter) ctx.fillText(letter, xPos + cellSize / 2, yPos + cellSize / 2);
    }
  }
}

