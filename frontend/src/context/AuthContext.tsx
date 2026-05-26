// This document manages who is currently logged in across our entire app.
// It listens to Firebase for auth changes (login/logout), stores the current user, 
// and makes that data accessible to any component via the useAuth() hook — without passing it through props.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";

// Defines the shape of data the context will share. 
// User | null means either a logged-in Firebase user or nothing. 
// isLoading tracks whether Firebase has finished its initial session check.
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
}

// Creates the context with a default of undefined. 
// The undefined default is intentional — it's used by useAuth to detect if we called the hook outside the provider and
// throw a helpful error instead of silently returning bad data.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// AuthProvider wraps our app and makes auth data available to all descendants
// user starts as null (no one logged in yet)
// isLoading starts as true because Firebase hasn't responded yet
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Runs once on mount ([] dependency array)
  // onAuthStateChanged fires immediately with the current user, then again on every sign-in/sign-out
  // Updates user with whoever is logged in (or null)
  // Sets isLoading to false once Firebase responds
  // The return passes Firebase's unsubscribe function to React, 
  // so the listener is cleaned up when AuthProvider unmounts — prevents memory leaks 
  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
  }, []);

  // Puts user and isLoading into the context so any descendant component can read them. 
  // children is whatever we nested inside <AuthProvider>.
  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// useContext(AuthContext) reads the current context value
// If ctx is undefined, it means useAuth was called outside <AuthProvider> — the error tells us exactly what went wrong
// Returns { user, isLoading } for use in any component
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}