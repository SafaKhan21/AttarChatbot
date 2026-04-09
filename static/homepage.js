import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import{getFirestore, getDoc, doc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"

const firebaseConfig = {
    //YOUR COPIED FIREBASE PART SHOULD BE HERE
 //WATCH THIS VIDEO TO LEARN WHAT TO PUT HERE   https://youtu.be/_Xczf06n6x0
  };
 
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const auth=getAuth();
  const db=getFirestore();

  onAuthStateChanged(auth, (user)=>{
    const loggedInUserId=localStorage.getItem('loggedInUserId');
    if(loggedInUserId){
        console.log(user);
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
        .then((docSnap)=>{
            if(docSnap.exists()){
                const userData=docSnap.data();
                document.getElementById('loggedUserFName').innerText=userData.firstName;
                document.getElementById('loggedUserEmail').innerText=userData.email;
                document.getElementById('loggedUserLName').innerText=userData.lastName;

            }
            else{
                console.log("no document found matching id")
            }
        })
        .catch((error)=>{
            console.log("Error getting document");
        })
    }
    else{
        console.log("User Id not Found in Local storage")
    }
  })

  const logoutButton=document.getElementById('logout');

  logoutButton.addEventListener('click',()=>{
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
    .then(()=>{
        window.location.href='index.html';
    })
    .catch((error)=>{
        console.error('Error Signing out:', error);
    })
  })
  document.getElementById('submitSignUp').addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;
  
    createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
      const user = userCredential.user;
      const userData = {
        email: email,
        firstName: firstName,
        lastName: lastName
      };
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData).then(() => {
        window.location.href = '/home';
      }).catch((error) => {
        console.error("Error writing document", error);
      });
    }).catch((error) => {
      console.error("Error signing up:", error);
    });
  });
  
  document.getElementById('submitSignIn').addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('loggedInUserId', user.uid);
      window.location.href = '/home';
    }).catch((error) => {
      console.error("Error signing in:", error);
    });
  });
  
  document.getElementById('googleSignInSignup').addEventListener('click', (event) => {
    event.preventDefault();
    signInWithPopup(auth, provider).then((result) => {
      const user = result.user;
      const userData = {
        email: user.email,
        firstName: user.displayName.split(' ')[0],
        lastName: user.displayName.split(' ')[1] || ''
      };
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData).then(() => {
        window.location.href = '/home';
      }).catch((error) => {
        console.error("Error writing document", error);
      });
    }).catch((error) => {
      console.error("Error during Google Sign-In:", error);
    });
  });

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
  
        // Save user data in Firestore
        const docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData)
          .then(() => {
            // Store user data in localStorage or sessionStorage
            localStorage.setItem('userData', JSON.stringify(userData));
  
            // Redirect to next page
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
  window.addEventListener('DOMContentLoaded', () => {
    // Retrieve user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
  
    if (userData) {
      // Display user information
      document.getElementById('loggedUserFName').innerText = userData.firstName || 'N/A';
      document.getElementById('loggedUserLName').innerText = userData.lastName || 'N/A';
      document.getElementById('loggedUserEmail').innerText = userData.email || 'N/A';
  
      // Optionally, clear user data from localStorage
      localStorage.removeItem('userData');
    } else {
      console.log("No user data found");
    }
  });
    