import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Import Supabase JS client and create a singleton client
import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
/**
 * Singleton for Supabase client
 */
function getSupabaseClient() {
  if (!window._supabase) {
    const url = process.env.REACT_APP_SUPABASE_URL;
    const key = process.env.REACT_APP_SUPABASE_KEY;
    window._supabase = createClient(url, key);
  }
  return window._supabase;
}

// PUBLIC_INTERFACE
/**
 * Format timestamp to human readable
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// PUBLIC_INTERFACE
/**
 * Platform filter sidebar
 */
function PlatformFilter({ platforms, selected, onChange }) {
  return (
    <aside className="sidebar">
      <span className="sidebar-title">Platforms</span>
      {platforms.map(plf => (
        <label key={plf} className="sidebar-option">
          <input
            type="checkbox"
            checked={selected.includes(plf)}
            onChange={() => onChange(plf)}
          />
          {plf}
        </label>
      ))}
    </aside>
  );
}

// PUBLIC_INTERFACE
/**
 * Sentiment bar summary
 */
function SentimentBar({ sentiment }) {
  // sentiment: {positive, neutral, negative}
  const total = sentiment.positive + sentiment.neutral + sentiment.negative;
  const percent = (x) => total ? Math.round((x / total) * 100) : 0;

  return (
    <div className="sentiment-bar">
      <div className="bar positive" style={{ width: `${percent(sentiment.positive)}%` }} title="Positive" />
      <div className="bar neutral" style={{ width: `${percent(sentiment.neutral)}%` }} title="Neutral" />
      <div className="bar negative" style={{ width: `${percent(sentiment.negative)}%` }} title="Negative" />
      <span className="sentiment-labels">
        <span className="lab positive">+{percent(sentiment.positive)}%</span>
        <span className="lab neutral">{percent(sentiment.neutral)}%</span>
        <span className="lab negative">-{percent(sentiment.negative)}%</span>
      </span>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Authentication (sign in/sign up)
 */
function AuthPanel({ onAuth, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signIn');

  const handle = (evt) => {
    evt.preventDefault();
    onAuth(mode, { email, password });
  };

  return (
    <div className="auth-panel">
      <h2 className="title">Sign {mode === 'signIn' ? 'In' : 'Up'}</h2>
      <form onSubmit={handle}>
        <input
          autoFocus
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <span className="auth-error">{error}</span>}
        <button className="btn auth" type="submit">
          {mode === 'signIn' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <button className="link" onClick={()=>setMode(mode==='signIn'?'signUp':'signIn')}>
        {mode === 'signIn' ? "Don't have an account? Sign up" : "Already a user? Sign in"}
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Search box component
 */
function SearchBar({ onSearch, initial, loading }) {
  const [query, setQuery] = useState(initial || '');

  const onKey = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        aria-label="Enter keyword or brand"
        placeholder="Search a keyword or brand (e.g. Apple, AirPods Pro, Elon Musk)"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={onKey}
        disabled={loading}
      />
      <button
        className="btn search"
        disabled={!query.trim() || loading}
        onClick={() => onSearch(query.trim())}
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Trends visualization: simple line chart (SVG)
 */
function TrendsChart({ data, color="#007bff" }) {
  // data: [{timestamp, score}]
  if (!data || data.length === 0) return <div className="empty-chart">No trends data</div>;
  const W = 320, H = 70, PAD = 16;
  let minScore = Math.min(...data.map(d=>d.score)), maxScore = Math.max(...data.map(d=>d.score));
  minScore = Math.min(minScore, 0); maxScore = Math.max(maxScore, 1);
  const points = data.map((d,i) => {
    // X: proportional across data points, Y: normalized to min/max
    const x = PAD + (i * (W-2*PAD)/(data.length-1));
    const y = H - PAD - ((d.score - minScore)/(maxScore-minScore))*(H-2*PAD);
    return [x, y];
  });

  const polyline = points.map(([x,y])=>`${x},${y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trends-chart" width={W} height={H}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={polyline}
      />
      {points.map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3" fill={color} />
      ))}
      <text x={PAD} y={H-2} fontSize="12" fill="#888">{formatDate(data[0].timestamp)}</text>
      <text x={W-PAD-40} y={H-2} fontSize="12" fill="#888" textAnchor="end">{formatDate(data[data.length-1].timestamp)}</text>
    </svg>
  );
}

// PUBLIC_INTERFACE
/**
 * Results dashboard
 */
function ResultsDashboard({ results, sentiment, trends, onExport }) {
  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Sentiment Overview</h2>
      <SentimentBar sentiment={sentiment} />
      <section className="dashboard-row">
        <div className="dashboard-panel">
          <h3>Trend Chart</h3>
          <TrendsChart data={trends} />
        </div>
        <div className="dashboard-panel dashboard-table-panel">
          <h3>Recent Mentions</h3>
          <MentionTable rows={results} />
        </div>
      </section>
      <button className="btn export" onClick={onExport}>Export as CSV</button>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Mention Table (listing posts)
 */
function MentionTable({ rows }) {
  if (!rows || !rows.length) return <div className="empty">No mentions found</div>;
  return (
    <table className="mention-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>User</th>
          <th>Platform</th>
          <th>Text</th>
          <th>Sentiment</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <td>{formatDate(row.time)}</td>
            <td>{row.author}</td>
            <td>{row.platform}</td>
            <td className="mention-text">{row.text}</td>
            <td>
              <span className={`sent-lab ${row.sentiment}`}>
                {row.sentiment}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// PUBLIC_INTERFACE
/**
 * Main app for Social Listening Tool
 */
function App() {
  // Theme state and effect
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auth state
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Search, filtering, and results
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [platforms, setPlatforms] = useState(["Twitter", "Reddit", "Instagram", "YouTube", "Blogs"]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(["Twitter", "Reddit", "Instagram", "YouTube", "Blogs"]);
  const [mentions, setMentions] = useState([]);
  const [sentiment, setSentiment] = useState({positive:0, neutral:0, negative:0});
  const [trends, setTrends] = useState([]);
  const [ws, setWS] = useState(null);

  // Export state
  const onExport = useCallback(() => {
    // Generate CSV from mentions
    if (!mentions.length) return;
    const csv = [
      "Time,User,Platform,Text,Sentiment",
      ...mentions.map(m => [
        `"${formatDate(m.time)}"`,
        `"${m.author.replace(/"/g, '""')}"`,
        `"${m.platform}"`,
        `"${m.text.replace(/"/g, '""')}"`,
        `"${m.sentiment}"`
      ].join(','))
    ].join('\n');
    const blob = new window.Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `mentions_${query}_${Date.now()}.csv`;
    a.click();
  }, [mentions, query]);

  // Handle platform filters
  const handlePlatformFilter = (plf) => {
    setSelectedPlatforms(prev =>
      prev.includes(plf)
        ? prev.filter(p => p !== plf)
        : [...prev, plf]);
  };

  // Handle search
  const fetchResults = useCallback(async (keyword) => {
    setSearching(true);
    setQuery(keyword);
    // Simulate API fetch using Supabase (generic data structure)
    setMentions([]);
    setSentiment({positive:0,neutral:0,negative:0});
    setTrends([]);
    try {
      const supabase = getSupabaseClient();

      // Query 'mentions' table based on keyword & platform
      let { data: mentionsData, error: mentionError } = await supabase
        .from('mentions')
        .select('*')
        .ilike('text', `%${keyword}%`)
        .in('platform', selectedPlatforms)
        .order('time', { ascending: false })
        .limit(100);

      if (mentionError) throw mentionError;
      setMentions(mentionsData);

      // Compute sentiment counts
      let sentimentSummary = {positive:0, neutral:0, negative:0};
      mentionsData.forEach(m=>{
        if (['positive','neutral','negative'].includes(m.sentiment)){
          sentimentSummary[m.sentiment] += 1;
        }
      });
      setSentiment(sentimentSummary);

      // Fetch or derive trends data
      let { data: trendsData, error: trendsError } = await supabase
        .from('trends')
        .select('*')
        .eq('keyword', keyword)
        .order('timestamp', { ascending: true })
        .in('platform', selectedPlatforms);

      if (!trendsError && trendsData) {
        setTrends(trendsData.map(d=>({timestamp:d.timestamp, score:d.score})));
      } else {
        // fallback simple trend: rolling avg by mention time
        const grouped = {};
        mentionsData.forEach(m=>{
          const t = new Date(m.time);
          const hour = t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate()+":"+t.getHours();
          if (!grouped[hour]) grouped[hour] = [];
          grouped[hour].push(m.sentiment === 'positive' ? 1 : (m.sentiment === 'neutral' ? 0.5 : 0));
        });
        const trData = Object.entries(grouped).map(([time, vals])=>({
          timestamp: time,
          score: vals.reduce((a,b)=>a+b,0)/vals.length
        }));
        setTrends(trData);
      }
    } catch(e) {
      setAuthError('Failed to fetch data: '+e.message);
    } finally {
      setSearching(false);
    }
  }, [selectedPlatforms]);

  // Real-time updates via Supabase subscriptions
  useEffect(() => {
    if (!user || !query) return;
    const supabase = getSupabaseClient();
    // Subscribing to changes in mentions
    const subscription = supabase
      .channel('mentions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentions' }, payload => {
        // Only update for matching query/filter (lightweight demo logic)
        const rec = payload.new;
        if (rec && rec.text && rec.text.toLowerCase().includes(query.toLowerCase()) && selectedPlatforms.includes(rec.platform)) {
          setMentions(prev => [rec, ...prev]);
        }
      })
      .subscribe();

    setWS(subscription);

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
    // eslint-disable-next-line
  }, [user, query, selectedPlatforms]);

  // Check session on load
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({data:{session}}) => {
      if (session?.user) setUser(session.user);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  // Auth actions
  const handleAuth = async (mode, { email, password }) => {
    setAuthError(null);
    const supabase = getSupabaseClient();
    if (mode === 'signIn') {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
      else setUser(data.user);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.REACT_APP_SITE_URL
        }
      });
      if (error) setAuthError(error.message);
    }
  };

  const onLogOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="App">
      <header className="main-header">
        <span className="logo">Sentiment<span className="accented">Insights</span></span>
        <nav className="nav">
          <button className="theme-toggle" onClick={()=>setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          {user && (
            <button className="btn logout" onClick={onLogOut}>Log Out</button>
          )}
        </nav>
      </header>
      <main className="main-content">
        {!user ? (
          <AuthPanel onAuth={handleAuth} error={authError} />
        ) : (
          <div className="content-layout">
            <PlatformFilter
              platforms={platforms}
              selected={selectedPlatforms}
              onChange={handlePlatformFilter}
            />
            <section className="content-main">
              <SearchBar
                onSearch={fetchResults}
                initial={query}
                loading={searching}
              />
              <ResultsDashboard
                results={mentions}
                sentiment={sentiment}
                trends={trends}
                onExport={onExport}
              />
            </section>
          </div>
        )}
      </main>
      <footer className="footer">
        <span>
          &copy; {new Date().getFullYear()} SentimentInsights •{' '}
          <a href="https://supabase.com/" className="supabase-link" target="_blank" rel="noopener noreferrer">Powered by Supabase</a>
        </span>
      </footer>
    </div>
  );
}

export default App;
