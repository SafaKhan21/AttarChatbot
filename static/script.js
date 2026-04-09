const signUpButton=document.getElementById('signUpButton');
const signInButton=document.getElementById('signInButton');
const signInForm=document.getElementById('signIn');
const signUpForm=document.getElementById('signup');

signUpButton.addEventListener('click',function(){
    signInForm.style.display="none";
    signUpForm.style.display="block";
})
signInButton.addEventListener('click', function(){
    signInForm.style.display="block";
    signUpForm.style.display="none";
})

const CLIENT_ID = '824396469578-12gsbdt0up9ho6qr5sbp15cfvsrki4th.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAG6qqKV3e7jz7j0XpqRVOnLSfiR-vZ10I';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        document.getElementById('googleSignInSignup').onclick = handleAuthClick;
        document.getElementById('googleSignInSignin').onclick = handleAuthClick;
        document.getElementById('signout_button').onclick = handleSignoutClick;
    }, (error) => {
        console.error(JSON.stringify(error, null, 2));
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        document.getElementById('googleSignInSignup').style.display = 'none';
        document.getElementById('googleSignInSignin').style.display = 'none';
        document.getElementById('signout_button').style.display = 'block';
        listUpcomingEvents();
    } else {
        document.getElementById('googleSignInSignup').style.display = 'block';
        document.getElementById('googleSignInSignin').style.display = 'block';
        document.getElementById('signout_button').style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function listUpcomingEvents() {
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    }).then((response) => {
        const events = response.result.items;
        appendEvents(events);
    });
}

function appendEvents(events) {
    const sidebar = document.getElementById('calendar-sidebar');
    sidebar.innerHTML = '';

    if (events.length > 0) {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const when = event.start.dateTime || event.start.date;
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerText = `${event.summary} (${when})`;
            sidebar.appendChild(eventItem);
        }
    } else {
        sidebar.innerText = 'No upcoming events found.';
    }
}

document.addEventListener("DOMContentLoaded", handleClientLoad);
