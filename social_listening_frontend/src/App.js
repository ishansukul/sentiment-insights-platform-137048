import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import SentimentDashboard from "./components/SentimentDashboard";
import AuthModal from "./components/AuthModal";

import {
  fetchMentions,
  fetchTrends,
  getSentimentSummary,
  subscribeToMentions,
  mentionsToCSV,
  loginWithMagicLink,
  logout as doLogout,
} from "./utils/socialApi";
import { supabase } from "./utils/supabaseClient";

function useAuth() {
  // Auth user hook (uses supabase).
  const [user, setUser] = useState(null);
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);
  return user;
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("dark");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({ platform: "", sentiment: "" });
  const [mentions, setMentions] = useState([]);
  const [trends, setTrends] = useState([]);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  const [lastExport, setLastExport] = useState(null);

  const user = useAuth();

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Fetch mentions & trends on search/filter
  const fetchResults = async () => {
    setLoadingData(true);
    try {
      const fetched = await fetchMentions({
        keyword: searchTerm,
        platform: filter.platform,
        sentiment: filter.sentiment,
        limit: 25,
      });
      setMentions(fetched);
      const trendData = await fetchTrends({
        keyword: searchTerm,
        platform: filter.platform,
        days: 7,
      });
      setTrends(trendData);
    } catch (e) {
      // Optionally show error in UI
      setMentions([]);
      setTrends([]);
    }
    setLoadingData(false);
  };

  // Initial and when search/filter change
  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line
  }, [searchTerm, filter.platform, filter.sentiment]);

  // Realtime
  useEffect(() => {
    const sub = subscribeToMentions(() => {
      fetchResults();
    });
    return () => {
      // Unsubscribe
      try {
        supabase.removeChannel(sub);
      } catch (e) {}
    };
    // eslint-disable-next-line
  }, [searchTerm, filter.platform, filter.sentiment]);

  // Auth
  const handleOpenAuth = () => {
    setAuthError(null);
    setAuthModalOpen(true);
  };
  const handleSendMagicLink = async (email) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await loginWithMagicLink(email);
      setAuthError(
        "A magic link was emailed to you. Please open it to log in!"
      );
    } catch (e) {
      setAuthError(e.message || "Error sending magic link.");
    }
    setAuthLoading(false);
  };
  const handleLogout = async () => {
    await doLogout();
  };

  // Data export
  const handleExport = () => {
    const csv = mentionsToCSV(mentions);
    const filename =
      "mentions_" + searchTerm.replace(/\s+/g, "_") + "_" + Date.now() + ".csv";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    if (window.navigator.msSaveBlob) {
      // For IE
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
    setLastExport(new Date());
  };

  // Keyboard shortcuts for accessibility: Alt+S = focus search.
  const searchRef = useRef();
  useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        if (searchRef.current) searchRef.current.focus();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, []);

  return (
    <div className="App">
      <Header
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        user={user}
        onLogout={handleLogout}
        onLogin={handleOpenAuth}
        searchRef={searchRef}
      />
      <div className="app-layout">
        <Sidebar filter={filter} setFilter={setFilter} />
        <section className="main-content">
          <div className="content-header">
            <button
              className="theme-toggle"
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
            <button
              className="btn btn-small btn-export"
              onClick={handleExport}
              disabled={mentions.length === 0}
              title="Export results as CSV"
            >
              Export CSV
            </button>
            {loadingData && (
              <span className="loader" aria-label="Loading">
                Loading...
              </span>
            )}
          </div>
          <SentimentDashboard
            summary={getSentimentSummary(mentions)}
            mentions={mentions}
            trends={trends}
          />
        </section>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSendLink={handleSendMagicLink}
        loading={authLoading}
        error={authError}
      />
      <Footer />
    </div>
  );
}

export default App;
