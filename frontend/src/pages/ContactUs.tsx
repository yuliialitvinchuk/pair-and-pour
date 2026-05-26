import React, { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setIsSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setErrorMessage("Failed to send your message. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="card contact-card">
        <h1>Contact Us</h1>
        <p>
          We'd love to hear from you. Share feedback, report an issue, or tell
          us what pairing features you want next.
        </p>

  <form className="form" onSubmit={handleSendMessage}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Message</label>
          <textarea
            className="pair-textarea"
            rows={6}
            placeholder="Tell us how we can help"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          <button
            className="button primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send message"}
          </button>

          {isSuccess && (
            <p className="muted" role="status">
              Your message was sent successfully.
            </p>
          )}

          {errorMessage && (
            <p className="muted" role="alert">
              {errorMessage}
            </p>
          )}
        </form>

        <div className="contact-meta">
          <p>
            <strong>Email:</strong> support@pairandpour.app
          </p>
          <p>
            <strong>Response time:</strong> within 1–2 business days
          </p>
          <p className="muted contact-back-link">
            Prefer pairing now? <Link to="/">Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}