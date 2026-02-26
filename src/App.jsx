import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Newspaper, 
  Briefcase, 
  TrendingUp, 
  Filter, 
  ChevronRight, 
  Activity,
  Globe,
  Cpu,
  HeartPulse,
  Landmark,
  Factory,
  ArrowUpRight,
  BookOpen,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

// --- CONFIGURATION & FALLBACKS ---
const API_KEY = 'b15dc697e87df415fe01564032d5fe4c'; // Leave empty to use mock data, or paste your GNews API key here
const TRENDING_TOPICS = ["Multi-Agent Orchestration", "Edge AI Agents", "Autonomous Auditing", "Self-Healing Code", "Robotic Process Agents"];

const MOCK_NEWS = [
  {
    id: 'm1',
    title: "GlobalPharma Deploys Swarm Agents for Accelerated Drug Discovery",
    summary: "A network of specialized AI agents has successfully simulated complex protein folding scenarios, reducing initial screening times by 80%.",
    industry: "Healthcare",
    impact: 9.2,
    date: "2026-02-25",
    source: "BioTech Insider",
    tags: ["Swarm Intelligence", "R&D"],
    featured: true
  },
  {
    id: 'm2',
    title: "FinTech Giant Replaces Level 1 Support with Empathetic Negotiation Agents",
    summary: "Customer service in banking takes a leap as new autonomous agents not only resolve queries but negotiate minor fee waivers and draft personalized financial plans.",
    industry: "Finance",
    impact: 8.5,
    date: "2026-02-24",
    source: "Financial Times",
    tags: ["Customer Experience", "Autonomy"]
  },
  {
    id: 'm3',
    title: "Supply Chain Agents Predict and Mitigate Pacific Shipping Delays",
    summary: "Using real-time weather and geopolitical data, logistics agents successfully rerouted $2B worth of cargo autonomously.",
    industry: "Logistics",
    impact: 7.9,
    date: "2026-02-20",
    source: "Logistics Weekly",
    tags: ["Predictive Analytics", "Routing"]
  }
];

const INDUSTRIES = [
  { name: "All", icon: Globe },
  { name: "Software", icon: Cpu },
  { name: "Healthcare", icon: HeartPulse },
  { name: "Finance", icon: Landmark },
  { name: "Manufacturing", icon: Factory },
  { name: "Logistics", icon: Activity },
  { name: "Education", icon: BookOpen },
];

// --- UTILITY COMPONENTS ---

const Badge = ({ children, className = "", onClick }) => (
  <span 
    onClick={onClick}
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${className} ${onClick ? 'cursor-pointer hover:ring-1 hover:ring-offset-1 ring-indigo-300' : ''}`}
  >
    {children}
  </span>
);

const ImpactScore = ({ score }) => {
  let colorClass = "text-green-600 bg-green-100 border-green-200";
  if (score >= 9.0) colorClass = "text-purple-700 bg-purple-100 border-purple-200";
  else if (score < 8.0) colorClass = "text-blue-600 bg-blue-100 border-blue-200";

  return (
    <div className={`flex items-center gap-1 border px-2 py-1 rounded-md ${colorClass}`}>
      <Activity size={14} />
      <span className="text-sm font-bold">{score}</span>
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- DATA FETCHING LOGIC ---
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!API_KEY) {
          // Simulate network delay for mock data
          await new Promise(resolve => setTimeout(resolve, 800));
          setNewsData(MOCK_NEWS);
          setIsLoading(false);
          return;
        }

        const q = encodeURIComponent('"AI agent" OR "autonomous agent" OR "Agentic AI"');
        const url = `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&apikey=${API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('API limit reached or network error');
        
        const data = await response.json();
        
        // Map raw API data to our app's enriched format
        const enrichedArticles = data.articles.map((item, idx) => {
          // Logic to synthetically categorize news based on keywords
          const text = (item.title + item.description).toLowerCase();
          let industry = "Software";
          if (text.includes("health") || text.includes("drug") || text.includes("medical")) industry = "Healthcare";
          else if (text.includes("bank") || text.includes("finance") || text.includes("audit")) industry = "Finance";
          else if (text.includes("factory") || text.includes("robot") || text.includes("manufacturing")) industry = "Manufacturing";
          else if (text.includes("ship") || text.includes("logistics") || text.includes("supply")) industry = "Logistics";
          else if (text.includes("learn") || text.includes("education") || text.includes("tutor")) industry = "Education";

          return {
            id: `api-${idx}`,
            title: item.title,
            summary: item.description,
            industry,
            impact: (Math.random() * (9.9 - 7.5) + 7.5).toFixed(1), // Randomly assigned impact for UI
            date: new Date(item.publishedAt).toLocaleDateString(),
            source: item.source.name,
            tags: ["AI", "Agents", "Automation"],
            featured: idx === 0 && selectedIndustry === 'All'
          };
        });

        setNewsData(enrichedArticles.length > 0 ? enrichedArticles : MOCK_NEWS);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not reach live news server. Showing cached results.");
        setNewsData(MOCK_NEWS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [selectedIndustry]); // Re-fetch or re-process when industry changes

  // --- FILTERING ---
  const filteredNews = useMemo(() => {
    return newsData.filter(article => {
      const matchesIndustry = selectedIndustry === 'All' || article.industry === selectedIndustry;
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            article.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesIndustry && matchesSearch;
    });
  }, [newsData, selectedIndustry, searchQuery]);

  const featuredArticle = filteredNews.find(n => n.featured) || filteredNews[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setSelectedIndustry('All'); setSearchQuery('');}}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Cpu className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
                AgenticTracker
              </span>
            </div>
            
            <nav className="flex space-x-2 md:space-x-8">
              <button 
                onClick={() => setActiveTab('feed')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'feed' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Newspaper size={18} /> <span className="hidden sm:inline">News Feed</span>
              </button>
              <button 
                onClick={() => setActiveTab('insights')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'insights' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <TrendingUp size={18} /> <span className="hidden sm:inline">Insights</span>
              </button>
            </nav>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search agents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 w-32 sm:w-64 transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800 text-sm">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {activeTab === 'feed' ? (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* SIDEBAR */}
            <aside className="lg:w-1/4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Filter size={16} className="text-indigo-600" /> Sectors
                </h3>
                <div className="space-y-1">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind.name}
                      onClick={() => setSelectedIndustry(ind.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedIndustry === ind.name 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ind.icon size={16} />
                        <span className="font-medium">{ind.name}</span>
                      </div>
                      {selectedIndustry === ind.name && <ChevronRight size={14} />}
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Trending Now</h4>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_TOPICS.map(topic => (
                      <Badge 
                        key={topic} 
                        onClick={() => setSearchQuery(topic)}
                        className="bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                      >
                        #{topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* FEED */}
            <div className="lg:w-3/4 flex flex-col gap-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">Analyzing global agentic data...</p>
                </div>
              ) : (
                <>
                  {/* FEATURED HERO */}
                  {featuredArticle && !searchQuery && (
                    <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                      <div className="relative z-10">
                        <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">Latest Breakthrough</Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">{featuredArticle.title}</h2>
                        <p className="text-slate-300 mb-6 text-lg line-clamp-2">{featuredArticle.summary}</p>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                          <span className="text-sm text-slate-400">{featuredArticle.source} &bull; {featuredArticle.date}</span>
                          <button 
                            onClick={() => setSelectedArticle(featuredArticle)}
                            className="bg-white text-slate-900 px-5 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-50 transition-colors"
                          >
                            Read Analysis <ArrowUpRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">News Feed: {selectedIndustry}</h3>
                    <span className="text-xs text-slate-500 uppercase tracking-widest">{filteredNews.length} Reports</span>
                  </div>

                  {/* ARTICLE LIST */}
                  <div className="grid gap-4">
                    {filteredNews.map((article) => (
                      <article 
                        key={article.id} 
                        onClick={() => setSelectedArticle(article)}
                        className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">{article.source}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs text-slate-500">{article.date}</span>
                          </div>
                          <ImpactScore score={article.impact} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{article.title}</h4>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">{article.summary}</p>
                        <div className="flex gap-2">
                          <Badge className="bg-slate-100 text-slate-500 border border-transparent">{article.industry}</Badge>
                          {article.tags.map(t => <span key={t} className="text-[10px] text-slate-400 uppercase mt-1">#{t}</span>)}
                        </div>
                      </article>
                    ))}
                    {filteredNews.length === 0 && (
                      <div className="text-center py-20">
                        <p className="text-slate-400">No agentic use cases found for this criteria.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* INSIGHTS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center col-span-full mb-4">
              <h2 className="text-2xl font-bold mb-2">Market Sentiment Analysis</h2>
              <p className="text-slate-500">Real-time tracking of autonomous agent adoption across global markets.</p>
            </div>
            {[
              { label: "Top Adopting Sector", val: "Software Eng", desc: "45% of workflows agent-assisted" },
              { label: "Avg. ROI Improvement", val: "22.4%", desc: "Reported by Early Adopters" },
              { label: "Active Orchestrators", val: "14.2k", desc: "Enterprise-grade deployments" }
            ].map(stat => (
              <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-indigo-600 uppercase">{stat.label}</span>
                <div className="text-3xl font-bold my-2">{stat.val}</div>
                <p className="text-sm text-slate-500">{stat.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ARTICLE MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedArticle(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-8 py-6 border-b flex justify-between items-center z-20">
              <div className="flex gap-3 items-center">
                <Badge className="bg-indigo-600 text-white">{selectedArticle.industry}</Badge>
                <span className="text-xs text-slate-400">{selectedArticle.date}</span>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-bold text-indigo-600">{selectedArticle.source}</span>
                <ImpactScore score={selectedArticle.impact} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">{selectedArticle.title}</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                <p className="font-medium text-slate-900">{selectedArticle.summary}</p>
                <p>This development signifies a major shift in how the {selectedArticle.industry} industry leverages autonomous reasoning. By shifting from static automation to dynamic agents, organizations are reporting significant reductions in operational overhead and faster response times to edge-case scenarios.</p>
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-indigo-900 text-base">
                  <h5 className="font-bold flex items-center gap-2 mb-2"><Activity size={18}/> Agentic Impact Analysis</h5>
                  The deployment of autonomous agents in this context suggests a Level 3.5 Autonomy (Human-on-the-loop). Long-term projections indicate that this use case will become the industry standard by Q3 2026.
                </div>
              </div>
              <div className="mt-8 pt-8 border-t flex flex-wrap gap-2">
                {selectedArticle.tags.map(t => <Badge key={t} className="bg-slate-100 text-slate-600">#{t}</Badge>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
