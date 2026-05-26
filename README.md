**Pair & Pour**

A mobile-first web application for discovering food and drink pairings.
Built with React (TypeScript), Node.js/Express, Firebase Authentication, and Firestore.

**Prerequisites**

Node.js v18 or higher

npm

A Firebase project with Firestore and Authentication enabled


**Setup**

1. Install backend dependencies

cd backend

npm install

2. Install frontend dependencies

cd frontend

npm install

The .env files for both frontend and backend are included in this submission and contain the credentials needed to connect to Firebase. No additional configuration is required.

**Running the App**

You will need two terminal windows.

1. Terminal 1 — Backend:

cd backend

node server.js

The backend runs on http://localhost:4000

2. Terminal 2 — Frontend:

cd frontend

npm start

The frontend runs on http://localhost:3000

Open http://localhost:3000 in your browser. 

The app is designed for mobile — for the best experience, open Chrome DevTools (F12) and switch to a mobile viewport such as iPhone 14 Pro Max.

**Running the Tests**

The test suite requires a valid Firebase ID token. To get one:

1. Start the app and log in

2. Open Chrome DevTools → Network tab

3. Make a pairing request (search for any food or drink)

4. Click the pair POST request → Headers → copy the Authorization value after Bearer 

5. Then run:

cd backend

TEST_TOKEN=your_token_here npm test

Tokens expire after one hour. If tests fail with auth errors, get a fresh token.

**Project Structure**

Path                              Description

backend/server.js                 Express server, API routes, filtering logic

backend/seed.js                   Script to populate Firestore

backend/export.js                 Script to export Firestore data to JSON

backend/.env.example              Template with blank values — real .env submitted separately

backend/tests/pair.test.js        Jest test suite (38 test cases)

frontend/src/pages/               React page components

frontend/src/components/          Shared components including route guard

frontend/src/context/             AuthContext — global auth state

frontend/src/utils/               preferences.ts localStorage preference 

helpersfrontend/src/api/auth.ts   Firebase auth API layer

**Team**

Name        Role 

Yuliia Litvinchuk     Frontend

Sadbh Flynn      Backend

Cormac Logan      Database

Xiandeng Fu    API integration, system flow, and frontend
