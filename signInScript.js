console.log("in signInScript.js");
import { auth } from "./script.js"; // Use your initialized Firebase auth

// --- DOM Elements ---
const home = document.getElementById('home');
const signInButton = document.getElementById('signIn');
const signUpButton = document.getElementById('signUp');
const authContainer = document.getElementById('firebaseui-auth-container');
const userDisplay = document.getElementById('user-display');
const userEmailSpan = document.getElementById('user-email');
const signOutButton = document.getElementById('signOutButton');

// --- Initialize FirebaseUI (global because loaded via <script>) ---
const ui = new firebaseui.auth.AuthUI(auth);

const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: () => false, // prevent redirect
    uiShown: () => {
      signInButton.style.display = 'none';
      signUpButton.style.display = 'none';
    }
  },
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  tosUrl: 'https://www.example.com/terms',
  privacyPolicyUrl: 'https://www.example.com/privacy'
};

// --- Button Events ---
signInButton.addEventListener('click', () => {
  authContainer.style.display = 'block';
  ui.start('#firebaseui-auth-container', uiConfig);
});

signUpButton.addEventListener('click', () => {
  authContainer.style.display = 'block';
  ui.start('#firebaseui-auth-container', uiConfig);
});

// --- Auth state observer ---
auth.onAuthStateChanged(user => {
  if (user) {
    signInButton.style.display = 'none';
    signUpButton.style.display = 'none';
    authContainer.style.display = 'none';
    userDisplay.style.display = 'block';
    userEmailSpan.textContent = user.email;

    const homeB = document.getElementById("homeB");
    homeB?.classList.remove("hide");
  } else {
    signInButton.style.display = 'block';
    signUpButton.style.display = 'block';
    userDisplay.style.display = 'none';
  }
});

// --- Sign out ---
signOutButton.addEventListener('click', () => {
  auth.signOut().then(() => console.log('User signed out successfully.'))
               .catch(error => console.error('Sign out error:', error));
});
