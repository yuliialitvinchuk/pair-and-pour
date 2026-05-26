import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

export default function RequireAuth({ children }: { children: ReactNode }) {
  if (!auth.currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}