import { useState, useEffect, useCallback } from "react";

// ─── Anthropic API helper ──────────────────────────────────────────────────
const ANTHROPIC_API = "/api/claude";
console.log("API Key present:", !!import.meta.env.VITE_ANTHROPIC_KEY);
async function fetchAgenticNews(query = "agentic AI agents latest news 2025") {
  const response = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      system: `You are a news curator specializing in Agentic AI. 
Return ONLY a valid JSON array (no markdown, no backticks) of exactly 8 news items.
Each item must have these keys:
- title: string (headline, max 90 chars)
- summary: string (2-sentence summary, max 200 chars)
- source: string (publication name)
- date: string (relative like "2 hours ago", "Yesterday", "3 days ago")
- category: one of ["Frameworks", "Research", "Products", "Enterprise", "Open Source", "Policy"]
- url: string (real URL if available, else "#")
- sentiment: one of ["bullish", "neutral", "critical"]`,
      messages: [
        {
          role: "user",
          content: `Search the web for the latest news about: ${query}. Return the JSON array only.`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();

  // Extract text from all content blocks
  const fullText = data.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();

  // Strip markdown fences if present
  const clean = fullText.replace(/```json|```/gi, "").trim();

  // Find JSON array
  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found");

  return JSON.parse(clean.slice(start, end + 1));
}

// ─── Category config ───────────────────────────────────────────────────────
const CATEGORIES = ["All", "Frameworks", "Research", "Products", "Enterprise", "Open Source", "Policy"];

const CAT_COLORS = {
  Frameworks:   { bg: "#1a2f1a", text: "#4ade80", border: "#166534" },
  Research:     { bg: "#1a1a3a", text: "#818cf8", border: "#3730a3" },
  Products:     { bg: "#2a1a1a", text: "#fb923c", border: "#9a3412" },
  Enterprise:   { bg: "#1a2a2a", text: "#22d3ee", border: "#0e7490" },
  "Open Source":{ bg: "#2a2a1a", text: "#facc15", border: "#854d0e" },
  Policy:       { bg: "#2a1a2a", text: "#e879f9", border: "#7e22ce" },
};

const SENTIMENT_ICONS = { bullish: "↑", neutral: "→", critical: "↓" };
const SENTIMENT_COLORS = { bullish: "#4ade80", neutral: "#94a3b8", critical: "#f87171" };

// ─── Search topics ─────────────────────────────────────────────────────────
const TOPICS = [
  { label: "All Agentic AI", query: "agentic AI agents latest news 2025" },
  { label: "Agent Frameworks", query: "LangGraph AutoGen CrewAI agent frameworks 2025" },
  { label: "Research Papers", query: "agentic AI research papers arxiv 2025" },
  { label: "Enterprise AI", query: "enterprise agentic AI deployment products 2025" },
  { label: "OpenAI / Anthropic", query: "OpenAI Anthropic agentic features agents 2025" },
  { label: "Multi-Agent Systems", query: "multi-agent systems orchestration 2025" },
];

// ─── Skeleton loader ───────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12,
      padding: 20,
      animation: "pulse 1.5s ease-in-out infinite",
    }}>
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <div style={{ width:80, height:20, borderRadius:20, background:"rgba(255,255,255,0.07)" }}/>
        <div style={{ width:60, height:20, borderRadius:20, background:"rgba(255,255,255,0.05)" }}/>
      </div>
      <div style={{ height:18, borderRadius:4, background:"rgba(255,255,255,0.08)", marginBottom:8 }}/>
      <div style={{ height:18, borderRadius:4, background:"rgba(255,255,255,0.06)", marginBottom:8, width:"85%" }}/>
      <div style={{ height:14, borderRadius:4, background:"rgba(255,255,255,0.05)", width:"60%" }}/>
    </div>
  );
}

// ─── News Card ─────────────────────────────────────────────────────────────
function NewsCard({ item, index }) {
  const cat = CAT_COLORS[item.category] || CAT_COLORS.Research;
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={item.url !== "#" ? item.url : undefined}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", display:"block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: hovered ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 12,
        padding: "18px 20px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        animationDelay: `${index * 60}ms`,
        animation: "slideUp 0.4s ease both",
      }}>
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            padding: "3px 10px", borderRadius: 20,
            background: cat.bg, color: cat.text, border: `1px solid ${cat.border}`,
          }}>
            {item.category.toUpperCase()}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: SENTIMENT_COLORS[item.sentiment],
            marginLeft: "auto",
          }}>
            {SENTIMENT_ICONS[item.sentiment]} {item.sentiment}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          margin: "0 0 8px",
          fontSize: 14.5,
          fontWeight: 700,
          color: "#f1f5f9",
          lineHeight: 1.45,
          fontFamily: "'DM Serif Display', Georgia, serif",
          letterSpacing: "0.01em",
        }}>
          {item.title}
        </h3>

        {/* Summary */}
        <p style={{
          margin: "0 0 12px",
          fontSize: 12.5,
          color: "#94a3b8",
          lineHeight: 1.6,
        }}>
          {item.summary}
        </p>

        {/* Footer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>
            {item.source}
          </span>
          <span style={{ fontSize: 11, color: "#475569" }}>
            {item.date}
          </span>
        </div>
      </div>
    </a>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTopic, setActiveTopic] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchText, setSearchText] = useState("");

  const loadNews = useCallback(async (topicIndex) => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchAgenticNews(TOPICS[topicIndex].query);
      setNews(items);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews(activeTopic);
  }, [activeTopic, loadNews]);

  const filtered = news.filter((n) => {
    const matchCat = activeCategory === "All" || n.category === activeCategory;
    const matchSearch = !searchText ||
      n.title.toLowerCase().includes(searchText.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060912; min-height: 100vh; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#060912",
        fontFamily: "'DM Mono', monospace",
        color: "#e2e8f0",
      }}>
        {/* Ambient background blobs */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0,
        }}>
          <div style={{
            position: "absolute", width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
            top: -200, left: -100,
          }}/>
          <div style={{
            position: "absolute", width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
            bottom: -150, right: -100,
          }}/>
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>

          {/* Header */}
          <header style={{ paddingTop: 48, paddingBottom: 32 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 20, padding: "4px 12px", marginBottom: 14,
                }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"#6366f1", display:"inline-block",
                    boxShadow:"0 0 8px #6366f1", animation:"pulse 2s ease-in-out infinite" }}/>
                  <span style={{ fontSize:11, letterSpacing:"0.1em", color:"#a5b4fc", fontWeight:500 }}>
                    LIVE INTELLIGENCE FEED
                  </span>
                </div>
                <h1 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(28px, 5vw, 48px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  background: "linear-gradient(135deg, #f1f5f9 30%, #818cf8 100%)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradientShift 6s ease infinite",
                }}>
                  Agentic AI<br/>News Tracker
                </h1>
                {lastUpdated && (
                  <p style={{ marginTop: 10, fontSize: 11.5, color: "#475569" }}>
                    Last updated · {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>

              <button
                onClick={() => loadNews(activeTopic)}
                disabled={loading}
                style={{
                  marginTop: 8,
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 20px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, color: "#94a3b8", fontSize: 12,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'DM Mono', monospace",
                  transition: "all 0.2s",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <span style={{ display:"inline-block", animation: loading ? "spin 1s linear infinite" : "none" }}>⟳</span>
                {loading ? "Fetching..." : "Refresh"}
              </button>
            </div>

            {/* Search */}
            <div style={{ marginTop: 24, position: "relative" }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#475569", fontSize:14 }}>⌕</span>
              <input
                type="text"
                placeholder="Filter news by keyword..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px 10px 38px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, color: "#e2e8f0", fontSize: 13,
                  fontFamily: "'DM Mono', monospace",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
          </header>

          {/* Topic tabs */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
            {TOPICS.map((t, i) => (
              <button
                key={i}
                onClick={() => { setActiveTopic(i); setActiveCategory("All"); }}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20, fontSize: 12, fontWeight: 600,
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer", transition: "all 0.2s",
                  background: activeTopic === i ? "#6366f1" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${activeTopic === i ? "#6366f1" : "rgba(255,255,255,0.08)"}`,
                  color: activeTopic === i ? "#fff" : "#64748b",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Category filters */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 20, fontSize: 11, fontWeight: 600,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.05em",
                  cursor: "pointer", transition: "all 0.2s",
                  background: activeCategory === cat
                    ? (CAT_COLORS[cat]?.bg || "rgba(255,255,255,0.1)")
                    : "transparent",
                  border: `1px solid ${activeCategory === cat
                    ? (CAT_COLORS[cat]?.border || "rgba(255,255,255,0.2)")
                    : "rgba(255,255,255,0.06)"}`,
                  color: activeCategory === cat
                    ? (CAT_COLORS[cat]?.text || "#fff")
                    : "#475569",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
              borderRadius:10, padding:"14px 18px", marginBottom:24, fontSize:13, color:"#fca5a5",
            }}>
              ⚠ {error} — Make sure your Anthropic API key proxy is configured.
            </div>
          )}

          {/* Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 14,
            paddingBottom: 60,
          }}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.length === 0
                ? (
                  <div style={{
                    gridColumn: "1/-1", textAlign:"center",
                    padding:"60px 20px", color:"#475569", fontSize:14,
                  }}>
                    No articles match your filters.
                  </div>
                )
                : filtered.map((item, i) => (
                  <NewsCard key={i} item={item} index={i} />
                ))
            }
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "20px 0",
            textAlign: "center",
            fontSize: 11,
            color: "#334155",
          }}>
            Powered by Claude AI with web search · Built with React
          </div>

        </div>
      </div>
    </>
  );
}


