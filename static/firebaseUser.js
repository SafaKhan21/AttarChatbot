import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

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
const db = getDatabase(app);

// Function to fetch users from Realtime Database
async function fetchUsers() {
  return new Promise((resolve, reject) => {
    const usersRef = ref(db, 'Users');
    onValue(usersRef, (snapshot) => {
      const users = [];
      snapshot.forEach((childSnapshot) => {
        users.push(childSnapshot.val());
      });
      resolve(users);
    }, (error) => {
      console.error('Error fetching users:', error);
      reject([]);
    });
  });
}

// Function to translate text using LibreTranslate API
async function translateText(text, targetLanguage = 'ar') {
  const url = 'https://libretranslate.com/translate';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLanguage,
      }),
    });

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Return original text if translation fails
  }
}

// Function to display user menu based on input query
async function displayUserMenu(query) {
  const userMenu = document.getElementById('userMenu');
  const userList = document.getElementById('userList');
  userList.innerHTML = '';

  const containsArabic = /[\u0600-\u06FF]/.test(query);
  const users = await fetchUsers();
  
  let filteredUsers = users.filter(user => user.nickname.toLowerCase().includes(query.toLowerCase()));

  if (containsArabic) {
    for (const user of filteredUsers) {
      const translatedNickname = await translateText(user.nickname);
      const li = document.createElement('li');
      li.textContent = translatedNickname;
      userList.appendChild(li);
    }
  } else {
    filteredUsers.forEach((user) => {
      const li = document.createElement('li');
      li.textContent = user.nickname;
      userList.appendChild(li);
    });
  }

  userMenu.style.direction = containsArabic ? 'rtl' : 'ltr';
  userMenu.style.textAlign = containsArabic ? 'right' : 'left';

  const inputField = document.getElementById('text');
  const inputFieldRect = inputField.getBoundingClientRect();
  userMenu.style.position = 'absolute';
  userMenu.style.top = `${inputFieldRect.top - userMenu.offsetHeight}px`; // Position above the input field
  userMenu.style.left = `${inputFieldRect.left}px`; // Align with the input field
  userMenu.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  const inputField = document.getElementById('text');
  const suggestionsBox = document.getElementById('suggestions');
  const userMenu = document.getElementById('userMenu');
  
  const phrases = ["to", "with", "of", "from", "إلى", "مع", "من"];
  let typingTimer;
  const doneTypingInterval = 500; // Time in milliseconds to wait after typing stops

  inputField.addEventListener('input', async () => {
    clearTimeout(typingTimer); // Clear the timer when the user types
    const query = inputField.value.toLowerCase().trim();

    const showSuggestions = phrases.some(phrase => query.includes(phrase));

    if (showSuggestions) {
      const matchedPhrase = phrases.find(phrase => query.includes(phrase));
      const queryAfterPhrase = query.replace(new RegExp(`${matchedPhrase}.*$`, 'i'), '').trim();

      if (queryAfterPhrase) {
        await displayUserMenu(queryAfterPhrase);
      } else {
        userMenu.style.display = 'none';
      }

      const users = await fetchUsers();
      suggestionsBox.innerHTML = '';

      const suggestions = users.map(user => user.nickname).filter(nickname => nickname);
      if (suggestions.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'N/A';
        suggestionsBox.appendChild(li);
      } else {
        suggestions.forEach(user => {
          const li = document.createElement('li');
          li.textContent = user;
          li.addEventListener('click', () => {
            let updatedText = inputField.value;
            if (matchedPhrase) {
              updatedText = updatedText.replace(new RegExp(`${matchedPhrase}.*$`, 'i'), `${matchedPhrase} ${user}`);
            }
            inputField.value = updatedText;
            suggestionsBox.style.display = 'none';
          });
          suggestionsBox.appendChild(li);
        });
      }
      suggestionsBox.style.display = 'block';

      const containsArabic = /[\u0600-\u06FF]/.test(inputField.value);
      suggestionsBox.style.direction = containsArabic ? 'rtl' : 'ltr';
      suggestionsBox.style.textAlign = containsArabic ? 'right' : 'left';
      userMenu.style.display = 'none';
    } else {
      suggestionsBox.style.display = 'none';
      userMenu.style.display = 'none';
    }

    // Set a timer to hide the menu after typing stops
    typingTimer = setTimeout(() => {
      userMenu.style.display = 'none';
    }, doneTypingInterval);
  });

  document.addEventListener('click', (event) => {
    if (!suggestionsBox.contains(event.target) && !inputField.contains(event.target)) {
      suggestionsBox.style.display = 'none';
    }
    if (!userMenu.contains(event.target) && !inputField.contains(event.target)) {
      userMenu.style.display = 'none';
    }
  });

  inputField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      userMenu.style.display = 'none'; // Hide user menu on Enter key press
    }
  });

  inputField.addEventListener('blur', () => {
    userMenu.style.display = 'none'; // Hide user menu when input field loses focus
    suggestionsBox.style.display = 'none';
  });

  inputField.addEventListener('focus', () => {
    clearTimeout(typingTimer); // Ensure timer is cleared when input field is focused
  });
});
