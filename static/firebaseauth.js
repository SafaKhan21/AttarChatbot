// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTYRdGTkNQIdq_f0hNLe9ipc-63Xu6-qA",
  authDomain: "login-ddef9.firebaseapp.com",
  databaseURL: "https://login-ddef9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "login-ddef9",
  storageBucket: "login-ddef9.appspot.com",
  messagingSenderId: "1071120504063",
  appId: "1:1071120504063:web:dbba0e6167ebd4282b28ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

auth.languageCode = 'en';

function updateUserProfile(user) {
  const name = user.displayName;
  const email = user.email;
  document.getElementById("name").textContent = name;
  document.getElementById("email").textContent = email;
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Retrieve user data from Realtime Database
    const userRef = ref(db, 'users/' + user.uid);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        document.getElementById("name").textContent = userData.firstName + " " + userData.lastName;
        document.getElementById("email").textContent = userData.email;
      }
    });
  } else {
    alert("Create account & login");
  }
});

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

document.getElementById('submitSignUp').addEventListener('click', (event) => {
  event.preventDefault();
  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstName = document.getElementById('fName').value;
  const lastName = document.getElementById('lName').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userData = {
        email: email,
        firstName: firstName,
        lastName: lastName
      };
      showMessage('Account Created Successfully', 'signUpMessage');
      // Store user data in Realtime Database
      set(ref(db, 'Users/' + user.uid), userData)
        .then(() => {
          window.location.href = '/home';
        })
        .catch((error) => {
          console.error("Error writing document", error);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/email-already-in-use') {
        showMessage('Email Address Already Exists !!!', 'signUpMessage');
      } else {
        showMessage('Unable to create User', 'signUpMessage');
      }
    });
});

document.getElementById('submitSignIn').addEventListener('click', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      showMessage('Login is successful', 'signInMessage');
      const user = userCredential.user;
      localStorage.setItem('loggedInUserId', user.uid);

      // Retrieve user data from Realtime Database
      const userRef = ref(db, 'Users/' + user.uid);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      });

      window.location.href = '/home';
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/invalid-credential') {
        showMessage('Incorrect Email or Password', 'signInMessage');
      } else {
        showMessage('Account does not Exist', 'signInMessage');
      }
    });
});

function handleGoogleSignIn(event) {
  event.preventDefault();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      const userData = {
        email: user.email,
        firstName: user.displayName.split(' ')[0],
        lastName: user.displayName.split(' ')[1] || ''
      };
      const userRef = ref(db, 'Users/' + user.uid);
      set(userRef, userData)
        .then(() => {
          window.location.href = '/home';
        })
        .catch((error) => {
          console.error("Error writing document", error);
        });
    })
    .catch((error) => {
      console.error("Error during Google Sign-In", error);
    });
}

document.getElementById('googleSignInSignup').addEventListener('click', handleGoogleSignIn);
document.getElementById('googleSignInSignin').addEventListener('click', handleGoogleSignIn);
