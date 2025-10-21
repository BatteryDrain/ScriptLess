home = document.getElementById('home');
if(home) {
    home.addEventListener("click", () => {
    window.open("index.html", "_self");
});
}

firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
        console.log("logged in");
    }
    else {
        window.open("signIn.html", "_self");
        console.log("not logged in");
    }
});