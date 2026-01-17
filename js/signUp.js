const auth = firebase.auth();

function signup(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("Sign up successful:", user);
            window.location.href = "signIn.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Sign up error:", errorCode, errorMessage);
        });
}

window.signup = signup;