// liBack = #FFF5E6;
// daBack = #1E1E1E;
home = document.getElementById('home');
if(home) {
    home.addEventListener("click", () => {
        window.open("index.html", "_self");
    });
}

var ui = new firebaseui.auth.AuthUI(firebase.auth());

// Configure FirebaseUI.
var uiConfig = {
  callbacks: {
    // This callback is triggered when a user successfully signs in or signs up.
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // User successfully signed in.
      // We return 'false' to prevent FirebaseUI from redirecting
      // and allow our onAuthStateChanged listener to handle the UI update.
      return false;
    },
    uiShown: function() {
      // The FirebaseUI widget has been rendered.
      // Hide your custom sign-in/sign-up buttons while the widget is visible.
      document.getElementById('signIn').style.display = 'none';
      document.getElementById('signUp').style.display = 'none';
    }
  },
  // We want to request 'popup' authentication for a better user experience
  signInFlow: 'popup', // or 'redirect' if you prefer
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID, // Email/Password
    firebase.auth.GoogleAuthProvider.PROVIDER_ID // Google Sign-In
  ],
  // Optional: Add your Terms of Service and Privacy Policy URLs
  tosUrl: 'https://www.example.com/terms', // Replace with your actual ToS URL
  privacyPolicyUrl: 'https://www.example.com/privacy' // Replace with your actual Privacy Policy URL
};

// Get references to your HTML elements
const signInButton = document.getElementById('signIn');
const signUpButton = document.getElementById('signUp');
const authContainer = document.getElementById('firebaseui-auth-container');
const userDisplay = document.getElementById('user-display');
const userEmailSpan = document.getElementById('user-email');
const signOutButton = document.getElementById('signOutButton');

// --- Event Listeners for your existing buttons ---

// When "sign in" button is clicked
signInButton.addEventListener('click', function() {
  // Show the FirebaseUI container and start the auth flow
  authContainer.style.display = 'block';
  ui.start('#firebaseui-auth-container', uiConfig);
});

// When "sign up" button is clicked
signUpButton.addEventListener('click', function() {
  // Show the FirebaseUI container and start the auth flow
  authContainer.style.display = 'block';
  ui.start('#firebaseui-auth-container', uiConfig);
});

// --- Firebase Authentication State Observer ---

// This listener fires whenever the user's sign-in status changes
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    // Hide your custom sign-in/sign-up buttons
    signInButton.style.display = 'none';
    signUpButton.style.display = 'none';
    // Hide the FirebaseUI widget itself
    authContainer.style.display = 'none';

    // Show user-specific content
    userDisplay.style.display = 'block';
    userEmailSpan.textContent = user.email; // Display user's email

  } else {
    // User is signed out.
    // Show your custom sign-in/sign-up buttons
    signInButton.style.display = 'block';
    signUpButton.style.display = 'block';
    // Hide user-specific content
    userDisplay.style.display = 'none';
  }
});

// --- Sign Out Functionality ---
signOutButton.addEventListener('click', function() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful. The onAuthStateChanged listener will update the UI.
    console.log('User signed out successfully.');
  }).catch(function(error) {
    // An error happened.
    console.error('Sign out error:', error);
  });
});

firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
        console.log("logged in");
        homeB = document.getElementById("homeB");
        homeB.classList.remove("hide");
    }
    else {
        console.log("not logged in");
    }
});