import React from "react";

const platformsList = [
  { label: "All", value: "" },
  { label: "Twitter", value: "twitter" },
  { label: "Reddit", value: "reddit" },
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
  { label: "YouTube", value: "youtube" },
];

const sentimentList = [
  { label: "All", value: "" },
  { label: "Positive", value: "positive" },
  { label: "Neutral", value: "neutral" },
  { label: "Negative", value: "negative" },
];

/**
 * Sidebar for filtering by platform and sentiment.
 * PUBLIC_INTERFACE
 */
function Sidebar({ filter, setFilter }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <span className="sidebar-title">Platforms</span>
        <ul className="platform-list">
          {platformsList.map((plat) => (
            <li key={plat.value}>
              <label>
                <input
                  type="radio"
                  name="platform"
                  value={plat.value}
                  checked={filter.platform === plat.value}
                  onChange={() => setFilter((f) => ({ ...f, platform: plat.value }))}
                />
                {plat.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="sidebar-section">
        <span className="sidebar-title">Sentiment</span>
        <ul className="sentiment-list">
          {sentimentList.map((s) => (
            <li key={s.value}>
              <label>
                <input
                  type="radio"
                  name="sentiment"
                  value={s.value}
                  checked={filter.sentiment === s.value}
                  onChange={() => setFilter((f) => ({ ...f, sentiment: s.value }))}
                />
                {s.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
