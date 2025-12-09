import { auth } from "./script.js"; // your initialized Firebase auth

// --- DOM Elements ---
const signInButton = document.getElementById('signIn');
const signUpButton = document.getElementById('signUp');
const authContainer = document.getElementById('firebaseui-auth-container');
const userDisplay = document.getElementById('user-display');
const userEmailSpan = document.getElementById('user-email');
const signOutButton = document.getElementById('signOutButton');
const sigHome = document.getElementById('sigHome');

// --- Initialize FirebaseUI ---
const ui = new firebaseui.auth.AuthUI(auth);

const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: () => false, // prevent redirect
    uiShown: () => {
      // hide the buttons when UI appears
      signInButton.style.display = 'none';
      signUpButton.style.display = 'none';
    }
  },
  signInFlow: 'popup',
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: true,
      signInMethod: firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD
    },
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID // ✅ Added Anonymous sign-in
  ],
  tosUrl: 'https://www.example.com/terms',
  privacyPolicyUrl: 'https://www.example.com/privacy'
};

// --- Button Events ---
// Both Sign In and Sign Up buttons now use the same UI
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

    // Show email if available, fallback for anonymous
    userEmailSpan.textContent = user.isAnonymous ? "Anonymous User" : user.email;

    sigHome?.classList.remove('hide');
  } else {
    signInButton.style.display = 'block';
    signUpButton.style.display = 'block';
    userDisplay.style.display = 'none';
  }
});

// --- Sign out ---
signOutButton.addEventListener('click', () => {
  auth.signOut()
      .then(() => console.log('User signed out successfully.'))
      .catch(err => console.error('Sign out error:', err));
});

pictSelect.addEventListener("change", () => {
  pfp.src = "assets/" + pictSelect.value + ".png";
});