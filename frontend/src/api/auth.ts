// the API layer for the forgot password feature

// Pulls in Firebase's built-in function that sends a password reset email. 
// Firebase handles everything — generating a secure token, building the email, and sending it.
import { sendPasswordResetEmail } from "firebase/auth";

// Imports the Firebase Auth instance initialised in firebase.ts. 
// This is the connection to our specific Firebase project — without it, Firebase wouldn't know which app/project to send the reset email for.
import { auth } from "../firebase";

// Defines and exports an async function that: takes one argument — the user's email as a string
// Returns Promise<void> — meaning it's async but doesn't return any value when it resolves (it either succeeds silently or throws an error)
export async function apiForgotPassword(email: string): Promise<void> {
  // The actual work. Calls Firebase with the auth instance and the email address. Firebase then:
  // Checks if that email exists in our project's user list
  // If it does, sends a reset link to that address
  // If it doesn't exist, it still resolves without error (Firebase does this intentionally to prevent email enumeration — you can't tell from the response whether an account exists)
  await sendPasswordResetEmail(auth, email);
}