<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendar Embed</title>
    <style>
        /* Styles for calendar sidebar */
        .calendar-sidebar {
            position: fixed;
            top: 0;
            right: -300px; /* Hide initially */
            width: 300px;
            height: 100%;
            background-color: #fff;
            box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
            transition: right 0.3s ease;
            z-index: 1000;
            overflow: hidden;
        }

        .calendar-sidebar.open {
            right: 0;
        }

        .calendar-sidebar .sidebar-header {
            padding: 15px;
            background-color: #007bff;
            color: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .calendar-sidebar iframe {
            width: 100%;
            height: calc(100% - 60px); /* Adjust height based on header */
        }
    </style>
</head>
<body>
    <div id="calendar-sidebar" class="calendar-sidebar">
        <div class="sidebar-header">
            <span>Calendar</span>
            <button id="close-sidebar">Close</button>
        </div>
        <iframe id="calendar-iframe" style="border: 0" width="100%" height="600" frameborder="0" scrolling="no"></iframe>
    </div>
    
    <div id="user-info">
        <div><span id="name-label">Name:</span> <span id="name"></span></div>
        <div><span id="email-label">Email:</span> <span id="email" class="Email"></span></div>
    </div>
    
    <button id="open-sidebar">Open Sidebar</button>
    <button id="some-calendar-button">Update Calendar</button>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
        import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
        import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDTYRdGTkNQIdq_f0hNLe9ipc-63Xu6-qA",
            authDomain: "login-ddef9.firebaseapp.com",
            projectId: "login-ddef9",
            storageBucket: "login-ddef9.appspot.com",
            messagingSenderId: "1071120504063",
            appId: "1:1071120504063:web:dbba0e6167ebd4282b28ca"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const provider = new GoogleAuthProvider();

        auth.languageCode = 'en';

        function updateUserProfile(user) {
            const name = user.displayName || 'User';
            const email = user.email || 'No email';
            document.getElementById("name").textContent = name;
            document.getElementById("email").textContent = email;
            updateCalendarURL(email);
        }

        function updateCalendarURL(email) {
            const calendarIframe = document.getElementById('calendar-iframe');
            const encodedEmail = encodeURIComponent(email.trim());
            if (encodedEmail) {
                calendarIframe.src = `https://calendar.google.com/calendar/embed?src=${encodedEmail}&ctz=Asia/Riyadh`;
            }
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                updateUserProfile(user);
            } else {
                alert("Please create an account & login.");
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

        document.getElementById('submitSignUp')?.addEventListener('click', (event) => {
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
                    const docRef = doc(db, "users", user.uid);
                    setDoc(docRef, userData)
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

        document.getElementById('submitSignIn')?.addEventListener('click', (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    showMessage('Login is successful', 'signInMessage');
                    const user = userCredential.user;
                    localStorage.setItem('loggedInUserId', user.uid);

                    const docRef = doc(db, "users", user.uid);
                    getDoc(docRef).then((docSnap) => {
                        if (docSnap.exists()) {
                            const userData = docSnap.data();
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
                    const docRef = doc(db, "users", user.uid);
                    setDoc(docRef, userData)
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

        // Sidebar toggle logic
        document.getElementById('open-sidebar')?.addEventListener('click', () => {
            document.getElementById('calendar-sidebar').classList.add('open');
        });

        document.getElementById('close-sidebar')?.addEventListener('click', () => {
            document.getElementById('calendar-sidebar').classList.remove('open');
        });

        document.getElementById('some-calendar-button')?.addEventListener('click', () => {
            const userEmail = document.getElementById('email').textContent;
            if (userEmail) {
                updateCalendarURL(userEmail);
                document.getElementById('calendar-sidebar').classList.add('open');
            } else {
                console.log("No email found to update calendar.");
            }
        });
    </script>
</body>
</html>
