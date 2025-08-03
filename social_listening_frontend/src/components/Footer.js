import React from "react";

/**
 * Minimal footer.
 * PUBLIC_INTERFACE
 */
function Footer() {
  return (
    <footer className="footer">
      <span>
        Sentiment Insights &copy; {new Date().getFullYear()} &mdash; Powered by Supabase &amp; Kavia
      </span>
    </footer>
  );
}

export default Footer;
