// --- Firebase imports ---
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyDdmKznX5xzmetICWIaGvUx6k8v1yNWWPQ",
  authDomain: "scriptless-56525.firebaseapp.com",
  projectId: "scriptless-56525",
  storageBucket: "scriptless-56525.appspot.com",
  messagingSenderId: "1098118128731",
  appId: "1:1098118128731:web:1f1ff538c82346c836cb7e"
};

// --- Initialize Firebase app (safe singleton) ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// --- Initialize services ---
const db = getFirestore(app);
const auth = getAuth(app);

// --- DOM elements ---
const topPFP = document.getElementById("topPFP");
const pictSelectEl = document.getElementById("pictSelect");

// --- Listen to auth changes ---
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (topPFP) {
      topPFP.src = "assets/pfp-red.png";
      topPFP.parentElement.href = "signIn.html";
    }
    return;
  }

  if (topPFP) {
    // topPFP.parentElement.href = `${window.location.origin}/~bwebster/profile.html`;
  }

  // Load initial PFP from Firestore
  try {
    const userDocRef = doc(db, "Users", user.uid);
    const snap = await getDoc(userDocRef);

if (!snap.exists()) {
  // Create a default user document
  await setDoc(userDocRef, { pictSelect: "pfp-red" }, { merge: true });

  if (topPFP) topPFP.src = "assets/pfp-red.png";
  if (pictSelectEl) pictSelectEl.value = "pfp-red";
  return;
}

const data = snap.data();
if (topPFP) topPFP.src = `assets/${data.pictSelect || "pfp-red"}.png`;
if (pictSelectEl) pictSelectEl.value = data.pictSelect || "pfp-red";

  } catch (err) {
    console.error("Error loading user PFP:", err);
  }
});

// --- Save PFP selection ---
if (pictSelectEl) {
  pictSelectEl.addEventListener("change", async () => {
    const newPFP = pictSelectEl.value;

    if (topPFP)
      topPFP.src = `assets/${newPFP}.png`;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "Users", user.uid);
      await setDoc(userDocRef, { pictSelect: newPFP }, { merge: true });
    } catch (err) {
      console.error("Error saving new PFP:", err);
    }
  });
}

// --- Export for other modules ---
export { app, auth };
