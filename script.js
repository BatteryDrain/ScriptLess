import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// --- your firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyDdmKznX5xzmetICWIaGvUx6k8v1yNWWPQ",
  authDomain: "scriptless-56525.firebaseapp.com",
  projectId: "scriptless-56525",
  storageBucket: "scriptless-56525.appspot.com",
  messagingSenderId: "1098118128731",
  appId: "1:1098118128731:web:1f1ff538c82346c836cb7e"
};

// --- initialize firebase only once ---
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

// --- DOM code ---
const signIn = document.getElementById('signIn');
const signUp = document. getElementById('signUp');
const sigHome = document.getElementById('sigHome');
const home = document.getElementById('home');

if(home) {
  home.addEventListener("click", () => {
    window.open("index.html", "_self");
  });
}

if(sigHome) {
    if(user) {
        if(sigHome.classList.contains('hide')){sigHome.classList.remove('hide');}
    } else {
        sigHome.classList.add('hide');
    }
}

if(signIn) {
    if(user) {
        signIn.classList.add('hide'); 
    } else {
        if(signIn.classList.contains('hide')){signIn.classList.remove('hide');}
    }
}

if(signUp) {
    if(user) {
        signUp.classList.add('hide'); 
    } else {
        if(signUp.classList.contains('hide')){signIn.classList.remove('hide');}
    }
}

const logIn = document.getElementById('logIn');

// --- handle login state ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("logged in");
    logIn.innerHTML = "account";   
  } else {
    // Only redirect if we're NOT already on signIn.html
    if (!window.location.href.includes("signIn.html")) {
      console.log("not logged in — redirecting to sign in page");
      window.open("signIn.html", "_self");
    } else {
      console.log("on signIn.html — no redirect");
    }
    logIn.innerHTML = "sign in";
    sigHome.classList.add('hide');
  }
});


// --- export app & auth for other modules if needed ---
export { app, auth };
