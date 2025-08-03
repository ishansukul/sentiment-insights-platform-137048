import React from "react";

/**
 * Pie chart for sentiment visualization (minimal).
 */
function SentimentPieChart({ counts }) {
  if (!counts || Object.values(counts).reduce((a, b) => a + b, 0) === 0)
    return <div style={{ textAlign: "center" }}>No data</div>;

  // Pie chart as SVG (three segments, minimal)
  const total = counts.positive + counts.neutral + counts.negative;
  const p = (counts.positive / total) * 100;
  const n = (counts.neutral / total) * 100;
  const ng = (counts.negative / total) * 100;

  // Pie calculation
  const calcArc = (perc) => (perc / 100) * 360;
  const getArc = (start, angle) => {
    // SVG arc based on angle and start
    const r = 38;
    const rad = (theta) => (Math.PI * theta) / 180;
    const x = 50 + r * Math.cos(rad(start - 90));
    const y = 50 + r * Math.sin(rad(start - 90));
    const endAngle = start + angle;
    const x2 = 50 + r * Math.cos(rad(endAngle - 90));
    const y2 = 50 + r * Math.sin(rad(endAngle - 90));
    const large = angle > 180 ? 1 : 0;
    return `M50,50 L${x},${y} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
  };

  let a1 = calcArc(p);
  let a2 = calcArc(n);
  let a3 = calcArc(ng);

  return (
    <svg viewBox="0 0 100 100" width={80} height={80}>
      {p > 0 && (
        <path
          d={getArc(0, a1)}
          fill="#17a2b8"
          stroke="#111"
          strokeWidth="0.5"
        />
      )}
      {n > 0 && (
        <path
          d={getArc(a1, a2)}
          fill="#6c757d"
          stroke="#111"
          strokeWidth="0.5"
        />
      )}
      {ng > 0 && (
        <path
          d={getArc(a1 + a2, a3)}
          fill="#e74c3c"
          stroke="#111"
          strokeWidth="0.5"
        />
      )}
      <circle cx={50} cy={50} r={24} fill="#1a1a1a" />
      <text x={50} y={54} textAnchor="middle" fill="#fff" fontWeight="bold" fontSize="1.2em">
        {Math.round((p / 100) * 100)}%
      </text>
    </svg>
  );
}

/**
 * Line chart for trend visualization (minimal).
 */
function MinimalTrendsChart({ data }) {
  if (!data || data.length === 0)
    return <div style={{ textAlign: "center" }}>No trend data</div>;
  // Normalize to fit SVG 100x32
  const points = data.map((p, i) => [i * (100 / (data.length - 1)), 32 - p.score * 32]).map(([x, y]) => `${x},${y}`);
  return (
    <svg height={36} width={120} style={{ background: "none" }}>
      <polyline
        fill="none"
        stroke="#17a2b8"
        strokeWidth="2"
        points={points.join(" ")}
      />
    </svg>
  );
}

/**
 * Sentiment Dashboard for displaying summary & trends.
 * PUBLIC_INTERFACE
 */
function SentimentDashboard({ summary, mentions, trends }) {
  const counts = summary || { positive: 0, neutral: 0, negative: 0, total: 0 };
  return (
    <main className="dashboard-main">
      <section className="dashboard-section sentiment-overview">
        <span className="section-title">Sentiment Breakdown</span>
        <SentimentPieChart counts={counts} />
        <div className="sentiment-counts">
          <span style={{ color: "#17a2b8" }}>Positive: {counts.positive}</span>
          <span style={{ color: "#6c757d" }}>Neutral: {counts.neutral}</span>
          <span style={{ color: "#e74c3c" }}>Negative: {counts.negative}</span>
        </div>
      </section>
      <section className="dashboard-section">
        <span className="section-title">Trend (last 7d)</span>
        <MinimalTrendsChart data={trends} />
      </section>
      <section className="dashboard-section mention-list-section">
        <span className="section-title">Recent Mentions ({mentions.length})</span>
        <div className="mention-list">
          {mentions.length === 0 ? (
            <div style={{ color: "#ccc", fontSize: "0.95em" }}>No mentions yet for this query.</div>
          ) : (
            mentions.map((m) => (
              <div key={m.id} className={`mention-card mention-sentiment-${m.sentiment}`}>
                <div className="mention-meta">
                  <span className="mention-platform">{m.platform}</span>
                  <span className="mention-time">{new Date(m.time).toLocaleString()}</span>
                </div>
                <div className="mention-text">{m.text}</div>
                <div className={`mention-sentiment-label ${m.sentiment}`}>{m.sentiment}</div>
                <div className="mention-author">@{m.author}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default SentimentDashboard;
