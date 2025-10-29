import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdmKznX5xzmetICWIaGvUx6k8v1yNWWPQ",
  authDomain: "scriptless-56525.firebaseapp.com",
  projectId: "scriptless-56525",
  storageBucket: "scriptless-56525.appspot.com",
  messagingSenderId: "1098118128731",
  appId: "1:1098118128731:web:1f1ff538c82346c836cb7e"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

const signIn = document.getElementById("signIn");
const signUp = document.getElementById("signUp");
const sigHome = document.getElementById("sigHome");
const home = document.getElementById("home");
const logIn = document.getElementById("logIn");

if (home) {
  home.addEventListener("click", () => {
    window.open("index.html", "_self");
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("logged in");
    if (logIn) logIn.innerHTML = "account";

    if (sigHome && sigHome.classList.contains("hide")) sigHome.classList.toggle("hide");
    if (signIn && !signIn.classList.contains("hide")) signIn.classList.toggle("hide");
    if (signUp && !signUp.classList.contains("hide")) signUp.classList.toggle("hide");
  } else {
    console.log("not logged in");

    if (!window.location.href.includes("signIn.html")) {
      console.log("redirecting to signIn.html");
      window.open("signIn.html", "_self");
    } else {
      console.log("already on signIn.html — no redirect");
    }

    if (logIn) logIn.innerHTML = "sign in";

    if (sigHome && !sigHome.classList.contains("hide")) sigHome.classList.toggle("hide");
    if (signIn && signIn.classList.contains("hide")) signIn.classList.toggle("hide");
    if (signUp && signUp.classList.contains("hide")) signUp.classList.toggle("hide");
  }
});

// --- export app & auth ---
export { app, auth };
