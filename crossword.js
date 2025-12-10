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

    const scriptId = sessionStorage.getItem("selectedScriptId");
    if (!scriptId) {
        alert("No script selected!");
        return;
    }

    const scriptRef = doc(db, "ScriptSpace", user.uid, "scripts", scriptId);
    const scriptSnap = await getDoc(scriptRef);

    if (scriptSnap.exists()) {
        const scriptData = scriptSnap.data();
        const scriptText = scriptData.script || "";

        WORDS = scriptText.split(/\s+/).filter(Boolean);
    } else {
        console.log("No such script found!");
        return;
    }

    // Clean words, remove excluded ones, and filter by length
    for (let rawWord of WORDS) {
        const cleanWord = rawWord.replace(/[^a-zA-Z]/g, "");
        const lowerWord = cleanWord.toLowerCase();
        if (cleanWord.length > 2 && !EXCLUDED_WORDS.includes(lowerWord)) {
            WORDSF.push(cleanWord.toUpperCase());
        }
    }

    // Take a maximum of 12 words for the 12x12 grid
    const puzzleWords = WORDSF.slice(0, 12);

    // Generate a simple 12x12 grid filled with random letters
    const gridSize = 12;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const gridData = Array.from({ length: gridSize }, () =>
        Array.from({ length: gridSize }, () => alphabet[Math.floor(Math.random() * alphabet.length)])
    );

    // Randomly place words in the grid (forwards only, horizontal, vertical, diagonal)
    for (let word of puzzleWords) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 50) {
            attempts++;
            const dir = Math.floor(Math.random() * 3); // 0=horizontal,1=vertical,2=diagonal
            let row = Math.floor(Math.random() * gridSize);
            let col = Math.floor(Math.random() * gridSize);

            if ((dir === 0 && col + word.length <= gridSize) || 
                (dir === 1 && row + word.length <= gridSize) ||
                (dir === 2 && col + word.length <= gridSize && row + word.length <= gridSize)) {

                let canPlace = true;
                for (let i = 0; i < word.length; i++) {
                    const r = row + (dir === 1 || dir === 2 ? i : 0);
                    const c = col + (dir === 0 || dir === 2 ? i : 0);
                    if (gridData[r][c] !== alphabet[Math.floor(Math.random() * alphabet.length)]) continue;
                }

                for (let i = 0; i < word.length; i++) {
                    const r = row + (dir === 1 || dir === 2 ? i : 0);
                    const c = col + (dir === 0 || dir === 2 ? i : 0);
                    gridData[r][c] = word[i];
                }
                placed = true;
            }
        }
    }

    // Render grid and word list
    renderWordList(puzzleWords);
    renderGrid(gridData, puzzleWords);
});

const gridElement = document.getElementById("grid");
const wordListElement = document.getElementById("word-list");
const messageElement = document.getElementById("message");
const resetBtn = document.getElementById("reset-btn");

let isMouseDown = false;
let startCell = null;
let pathCells = [];
const foundWords = new Set();

function renderWordList(words) {
    wordListElement.innerHTML = "";
    words.forEach(word => {
        const li = document.createElement("li");
        li.textContent = word;
        li.dataset.word = word;
        wordListElement.appendChild(li);
    });
}

function renderGrid(gridData, words) {
    gridElement.innerHTML = "";
    gridElement.style.gridTemplateColumns = `repeat(${gridData[0].length}, 2.4rem)`;

    gridData.forEach((rowString, rowIndex) => {
        rowString.forEach((letter, colIndex) => {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.textContent = letter;
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;

            cell.addEventListener("mousedown", handleMouseDown);
            cell.addEventListener("mouseenter", handleMouseEnter);

            gridElement.appendChild(cell);
        });
    });

    document.addEventListener("mouseup", handleMouseUp);
}

function handleMouseDown(e) {
    e.preventDefault();
    if (this.classList.contains("found")) return;

    clearTempSelection();
    isMouseDown = true;
    startCell = this;
    pathCells = [this];
    this.classList.add("selected");
    messageElement.textContent = "";
}

function handleMouseEnter() {
    if (!isMouseDown || !startCell) return;
    if (this.classList.contains("found")) return;

    if (!pathCells.includes(this)) pathCells.push(this);

    clearTempSelection();
    pathCells.forEach(c => {
        if (!c.classList.contains("found")) c.classList.add("selected");
    });
}

function handleMouseUp() {
    if (!isMouseDown || !startCell || pathCells.length < 2) {
        clearTempSelection();
        isMouseDown = false;
        startCell = null;
        pathCells = [];
        return;
    }

    const endCell = pathCells[pathCells.length - 1];
    const wordInfo = getWordFromSelection(startCell, endCell);

    if (wordInfo && WORDSF.includes(wordInfo.word)) {
        lockInWord(wordInfo);
    } else if (wordInfo && WORDSF.includes(wordInfo.wordReversed)) {
        lockInWord({ ...wordInfo, word: wordInfo.wordReversed });
    } else {
        clearTempSelection();
        messageElement.textContent = "Not a hidden word. Try again!";
        messageElement.style.color = "var(--red)";
    }

    isMouseDown = false;
    startCell = null;
    pathCells = [];
}

function clearTempSelection() {
    document.querySelectorAll(".cell.selected").forEach(cell => cell.classList.remove("selected"));
}

function getCellAt(row, col) {
    return gridElement.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function getWordFromSelection(start, end) {
    const r1 = parseInt(start.dataset.row, 10);
    const c1 = parseInt(start.dataset.col, 10);
    const r2 = parseInt(end.dataset.row, 10);
    const c2 = parseInt(end.dataset.col, 10);

    const dr = r2 - r1;
    const dc = c2 - c1;

    if (dr === 0 && dc === 0) return null;

    const stepR = Math.sign(dr);
    const stepC = Math.sign(dc);
    const lenR = Math.abs(dr);
    const lenC = Math.abs(dc);
    const steps = Math.max(lenR, lenC);

    if (!(stepR === 0 || stepC === 0 || lenR === lenC)) return null;

    let word = "";
    const cellsInLine = [];

    for (let i = 0; i <= steps; i++) {
        const rr = r1 + stepR * i;
        const cc = c1 + stepC * i;
        const cell = getCellAt(rr, cc);
        if (!cell) return null;
        cellsInLine.push(cell);
        word += cell.textContent;
    }

    return {
        word,
        wordReversed: word.split("").reverse().join(""),
        cells: cellsInLine
    };
}

function lockInWord(wordInfo) {
    wordInfo.cells.forEach(cell => {
        cell.classList.remove("selected");
        cell.classList.add("found");
    });

    foundWords.add(wordInfo.word);

    const li = wordListElement.querySelector(`li[data-word="${wordInfo.word}"]`);
    if (li) li.classList.add("word-found");

    messageElement.textContent = `Nice! You found "${wordInfo.word}".`;
    messageElement.style.color = "var(--blue)";

    if (foundWords.size === WORDSF.length) {
        messageElement.textContent = "🎉 You found all the words! Great job!";
    }
}

resetBtn.addEventListener("click", () => {
    clearTempSelection();
    messageElement.textContent = "";
});
