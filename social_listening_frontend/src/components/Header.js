import React from "react";

/**
 * Header with search input for brand/keyword and profile/logout.
 * PUBLIC_INTERFACE
 */
function Header({
  onSearch,
  searchTerm,
  setSearchTerm,
  user,
  onLogout,
  onLogin,
}) {
  return (
    <header className="header">
      <div className="header-section">
        <span className="app-title">Sentiment Insights</span>
        <form
          className="search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(searchTerm);
          }}
        >
          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keyword or brand"
            aria-label="Keyword or brand"
            autoFocus
          />
          <button type="submit" className="btn btn-accent">
            Search
          </button>
        </form>
      </div>
      <div className="header-section">
        {user ? (
          <>
            <span className="profile-label">
              {user.email}
            </span>
            <button className="btn btn-small" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="btn btn-small" onClick={onLogin}>
            Login / Sign Up
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
