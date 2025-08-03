import React, { useState } from "react";

/**
 * Simple authentication modal for login/signup via email magic link.
 * PUBLIC_INTERFACE
 */
function AuthModal({ isOpen, onClose, onSendLink, loading, error }) {
  const [email, setEmail] = useState("");
  if (!isOpen) return null;
  return (
    <div className="auth-modal-backdrop">
      <div className="auth-modal">
        <button className="btn-close" onClick={onClose} aria-label="Close">&times;</button>
        <h3>Sign In / Sign Up</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            onSendLink(email);
          }}
        >
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            pattern="[^@ \t\r\n]+@[^@\t\r\n]+\.[^@\t\r\n]+"
            aria-label="Email"
          />
          <button className="btn btn-accent" disabled={loading}>
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-modal-info">
          You'll get a magic link to sign in or register. No password needed!
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
