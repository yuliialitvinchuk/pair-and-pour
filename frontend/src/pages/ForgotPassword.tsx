import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiForgotPassword } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setServerError("Email is required.");
      return;
    }
    if (!emailRegex.test(email)) {
      setServerError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await apiForgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card">
        <h1>Check your email</h1>
        <p>
          If an account exists for <strong>{email}</strong>, we've sent a
          password reset link. Check your inbox (and spam folder).
        </p>
        <p className="muted">
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Forgot password?</h1>
      <p>Enter your email and we'll send you a reset link.</p>

      {serverError ? <div className="error">{serverError}</div> : null}

      <form onSubmit={handleSubmit} className="form">
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          type="email"
        />

        <button className="button primary" type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="muted">
        Remember your password? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}