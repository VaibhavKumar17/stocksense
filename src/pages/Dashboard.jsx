import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, Activity,
  BarChart2, Zap, AlertCircle, ArrowUpRight, ArrowDownRight,
  Newspaper, Star, ChevronRight, List, Grid, Search, BookOpen, Globe
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ w = '100%', h = '14px' }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: '6px' }} />;
}

// ─── Influence Ring ────────────────────────────────────────────────────────────
function InfluenceRing({ score, signal }) {
  const color = signal === 'bullish' ? '#16a34a' : signal === 'bearish' ? '#dc2626' : '#8B7355';
  const bg = signal === 'bullish' ? 'rgba(22,163,74,0.12)' : signal === 'bearish' ? 'rgba(220,38,38,0.12)' : 'rgba(139,115,85,0.1)';
  return (
    <div style={{
      width: '42px', height: '42px', borderRadius: '50%',
      background: bg, border: `2px solid ${color}33`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '11px', fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: '8px', color: '#8B7355', lineHeight: 1, marginTop: '1px' }}>score</span>
    </div>
  );
}

// ─── Detail Panel (right side) ─────────────────────────────────────────────────
function DetailPanel({ item, articles, loading, onStrike }) {
  const isBull = item.signal === 'bullish';
  const isBear = item.signal === 'bearish';

  const tick = item.lastTickTime && Date.now() - item.lastTickTime < 450 ? item.tickType : null;
  const priceColor = tick === 'up' ? '#16a34a' : tick === 'down' ? '#dc2626' : '#1C1410';
  const priceBg = tick === 'up' ? 'rgba(22,163,74,0.15)' : tick === 'down' ? 'rgba(220,38,38,0.15)' : 'transparent';
  const simulatedPct = item.price ? item.pct_change + ((item.simPrice - item.price) / item.price) * 100 : item.pct_change;
  const priceUp = simulatedPct >= 0;

  return (
    <div className="glass-card animate-slideInRight" style={{ padding: '24px', height: '100%', position: 'sticky', top: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#1C1410', fontFamily: 'JetBrains Mono, monospace' }}>{item.symbol}</span>
          {isBull && <span className="badge-bullish"><TrendingUp size={10} /> BULLISH</span>}
          {isBear && <span className="badge-bearish"><TrendingDown size={10} /> BEARISH</span>}
          {!isBull && !isBear && <span className="badge-neutral">NEUTRAL</span>}
        </div>
        {item.simPrice > 0 && (
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            color: priceColor, 
            background: priceBg,
            padding: '4px 10px',
            borderRadius: '6px',
            display: 'inline-block',
            fontFamily: 'JetBrains Mono, monospace',
            transition: 'all 0.15s ease-out'
          }}>
            ₹{item.simPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            <span style={{ fontSize: '14px', color: priceUp ? '#16a34a' : '#dc2626', marginLeft: '8px', fontWeight: 600 }}>
              {priceUp ? '+' : ''}{simulatedPct?.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* AI Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
        {[
          { label: 'Influence Score', value: `${item.influence_score}/100`, color: '#8B5A2B' },
          { label: 'News Confidence', value: `${Math.round(item.confidence * 100)}%`, color: isBull ? '#16a34a' : isBear ? '#dc2626' : '#8B7355' },
          { label: 'Bullish Articles', value: item.bull_articles, color: '#16a34a' },
          { label: 'Bearish Articles', value: item.bear_articles, color: '#dc2626' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'rgba(245,240,235,0.7)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '10px', color: '#8B7355', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* News Articles */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Newspaper size={11} /> Selected Stock News
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} style={{ background: 'rgba(245,240,235,0.4)', borderRadius: '8px', padding: '12px' }}>
                <Sk h="14px" style={{ marginBottom: '6px' }} />
                <Sk w="50%" h="10px" />
              </div>
            ))
          ) : (articles || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#8B7355', fontSize: '12px' }}>
              No recent news articles found
            </div>
          ) : (
            (articles || []).map((a, i) => {
              const isBullArticle = a.score > 0.05;
              const isBearArticle = a.score < -0.05;
              const labelColor = isBullArticle ? '#16a34a' : isBearArticle ? '#dc2626' : '#d97706';
              const cleanTime = a.summary 
                ? a.summary.replace('Published on ', '').replace('.', '').trim() 
                : '';

              return (
                <div key={i} style={{ background: 'rgba(245,240,235,0.6)', borderRadius: '8px', padding: '10px 12px', borderLeft: `3px solid ${labelColor}` }}>
                  <p style={{ fontSize: '12.5px', color: '#1C1410', lineHeight: '1.45', marginBottom: '6px', fontWeight: 600 }}>{a.title}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', color: '#8B7355', flexWrap: 'wrap', gap: '4px' }}>
                    <span>
                      <span style={{ color: labelColor, fontWeight: 700 }}>{a.label?.toUpperCase() || 'NEUTRAL'}</span> · {a.source}
                    </span>
                    {cleanTime && <span>{cleanTime}</span>}
                  </div>
                  <div style={{ fontSize: '9px', color: '#8B5A2B', fontWeight: 700, marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Category: {a.category?.replace('_', ' ') || 'GENERAL NEWS'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CTA */}
      {(isBull || isBear) && (
        <button
          onClick={() => onStrike(item)}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}
        >
          <Zap size={15} />
          Find Best {isBull ? 'Call (CE)' : 'Put (PE)'} Option
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard({ onNavigateToStriker }) {
  const [data, setData] = useState([]);
  const [simulatedData, setSimulatedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [filter, setFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [backendOk, setBackendOk] = useState(null);
  
  // Dashboard modes: 'watchboard' (Table list) or 'newsfeed' (Aggregated news)
  const [dashMode, setDashMode] = useState('watchboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [macroData, setMacroData] = useState(null);
  const [macroLoading, setMacroLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState([]);
  const [selectedNewsLoading, setSelectedNewsLoading] = useState(false);

  // Autocomplete and on-the-fly custom symbol fetching
  const [foSymbols, setFoSymbols] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [singleLoading, setSingleLoading] = useState(false);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = force ? `${API}/intelligence?force=true` : `${API}/intelligence`;
      const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
      if (!r.ok) throw new Error(`Server ${r.status}`);
      const d = await r.json();
      const results = d.results || [];
      setData(results);
      setLastRefresh(new Date());
      setBackendOk(true);
    } catch (e) {
      setError(e.message);
      setBackendOk(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMacro = useCallback(async (force = false) => {
    setMacroLoading(true);
    try {
      const url = force ? `${API}/macro-economics?force=true` : `${API}/macro-economics`;
      const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (r.ok) {
        const d = await r.json();
        setMacroData(d);
      }
    } catch (e) {
      console.error("Failed to load macroeconomics", e);
    } finally {
      setMacroLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dashMode !== 'macro') return;

    fetchMacro(false);
    const iv = setInterval(() => fetchMacro(false), 5000);
    return () => clearInterval(iv);
  }, [dashMode, fetchMacro]);

  useEffect(() => {
    if (!selectedSymbol) {
      setSelectedNews([]);
      return;
    }
    let active = true;
    setSelectedNewsLoading(true);
    fetch(`${API}/news/${selectedSymbol}`)
      .then(r => r.ok ? r.json() : { articles: [] })
      .then(d => {
        if (active) {
          setSelectedNews(d.articles || []);
        }
      })
      .catch(e => console.error("Error fetching news for symbol", e))
      .finally(() => {
        if (active) setSelectedNewsLoading(false);
      });

    return () => { active = false; };
  }, [selectedSymbol]);

  useEffect(() => {
    load(false);
    const iv = setInterval(() => load(false), 120000);
    return () => clearInterval(iv);
  }, [load]);

  // Sync and update simulated data
  useEffect(() => {
    setSimulatedData(data.map(d => ({
      ...d,
      simPrice: d.price,
      tickType: null,
      lastTickTime: 0
    })));
  }, [data]);

  const isMarketOpen = () => {
    // Get current time in Indian Standard Time (IST)
    const options = { timeZone: 'Asia/Kolkata', hour12: false };
    const istString = new Date().toLocaleString('en-US', options);
    const istDate = new Date(istString);
    
    const day = istDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    if (day === 0 || day === 6) return false; // Market closed on weekends
    
    const h = istDate.getHours();
    const m = istDate.getMinutes();
    const mins = h * 60 + m;
    return mins >= 555 && mins <= 930; // 9:15 AM – 3:30 PM IST
  };

  // Millisecond-level tick simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Pause price updates completely if the market is closed
      if (!isMarketOpen()) return;

      setSimulatedData(prev => prev.map(t => {
        // 25% chance a stock ticks every 150ms
        if (Math.random() > 0.25) return t;

        const pct = (Math.random() * 0.04 - 0.02) / 100;
        const diff = t.simPrice * pct;
        const newPrice = Math.max(0.01, t.simPrice + diff);
        const up = newPrice > t.simPrice;

        return {
          ...t,
          simPrice: newPrice,
          tickType: up ? 'up' : 'down',
          lastTickTime: Date.now()
        };
      }));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const getTickStatus = (t) => {
    if (!t.lastTickTime || Date.now() - t.lastTickTime > 450) return null;
    return t.tickType;
  };

  const selected = selectedSymbol ? (simulatedData.find(d => d.symbol === selectedSymbol) || null) : null;

  // Load F&O symbols on mount for autocomplete
  useEffect(() => {
    fetch(`${API}/fo-symbols`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setFoSymbols(d))
      .catch(() => {});
  }, []);

  const handleSelectSymbol = async (symbol) => {
    setSearchQuery(symbol);
    setShowSuggestions(false);
    setFilter('all'); // Reset tab filter to 'all' so searched stock is visible
    
    // Check if it's already in the watchlist data
    const existing = data.find(d => d.symbol.toUpperCase() === symbol.toUpperCase());
    if (existing) {
      setSelectedSymbol(existing.symbol);
      return;
    }

    // Load custom stock on-the-fly (e.g. DELHIVERY)
    setSingleLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API}/analyze-single/${symbol}`);
      if (!r.ok) throw new Error(`Stock ${symbol} analysis failed`);
      const d = await r.json();
      
      // Append to data so it shows up in watchboard and news feed
      setData(prev => [d, ...prev]);
      setSelectedSymbol(d.symbol);
    } catch (err) {
      setError(err.message);
    } finally {
      setSingleLoading(false);
    }
  };

  const suggestions = searchQuery 
    ? foSymbols.filter(s => s.toLowerCase().startsWith(searchQuery.toLowerCase()) && s.toLowerCase() !== searchQuery.toLowerCase())
    : [];

  const searched = simulatedData.filter(d => 
    d.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.top_headline && d.top_headline.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filtered = filter === 'all' ? searched : searched.filter(d => d.signal === filter);

  const bullCount = simulatedData.filter(d => d.signal === 'bullish').length;
  const bearCount = simulatedData.filter(d => d.signal === 'bearish').length;
  const topInfluence = simulatedData[0];

  const handleStrike = (item) => {
    if (onNavigateToStriker) onNavigateToStriker(item);
  };

  // Helper to parse date strings like "14 Jul 2026, 11:46 AM IST"
  const parsePubDate = (summary) => {
    if (!summary) return 0;
    try {
      const clean = summary.replace('Published on ', '').replace('.', '').trim();
      const parts = clean.split(',');
      if (parts.length >= 2) {
        const dateStr = parts[0].trim();
        const timeStr = parts[1].replace('IST', '').trim();
        return Date.parse(`${dateStr} ${timeStr}`) || 0;
      }
      return Date.parse(clean) || 0;
    } catch (e) {
      return 0;
    }
  };

  // Compile aggregated live news feed
  const aggregatedNews = [];
  simulatedData.forEach(stock => {
    if (stock.articles) {
      stock.articles.forEach(art => {
        aggregatedNews.push({
          ...art,
          symbol: stock.symbol,
          simPrice: stock.simPrice,
          price: stock.price,
          pct_change: stock.pct_change,
          tickType: stock.tickType,
          lastTickTime: stock.lastTickTime,
          symbolSignal: stock.signal,
          influence_score: stock.influence_score
        });
      });
    }
  });

  // Filter news feed
  const filteredNews = aggregatedNews.filter(n => {
    if (selectedSymbol) {
      return n.symbol === selectedSymbol;
    }
    const matchesSearch = n.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'bullish') return n.score > 0.05;
    if (filter === 'bearish') return n.score < -0.05;
    if (filter === 'neutral') return Math.abs(n.score) <= 0.05;
    return true;
  });

  // Sort news by date descending (latest first)
  const sortedNews = [...filteredNews].sort((a, b) => parsePubDate(b.summary) - parsePubDate(a.summary));

  return (
    <div className="page-container">

      {/* Offline banner */}
      {backendOk === false && (
        <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', flexShrink: 0, display: 'block' }} />
          <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>Backend offline —</span>
          <code style={{ fontSize: '12px', color: '#5C4033', fontFamily: 'JetBrains Mono, monospace' }}>cd backend && python -m uvicorn main:app --reload</code>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1C1410', letterSpacing: '-0.03em', marginBottom: '3px' }}>
            Market Intelligence{' '}
            <span style={{ background: 'linear-gradient(135deg, #8B5A2B, #D2691E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Board</span>
          </h1>
          <p style={{ fontSize: '12px', color: '#8B7355' }}>
            AI-ranked F&O sentiment scanner · {data.length} assets monitored
            {lastRefresh && <span style={{ color: '#8B5A2B', marginLeft: '6px' }}>· Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
          </p>
        </div>

        {/* View Switcher and Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Dashboard Mode Switcher */}
          <div className="mode-switcher">
            <button
              onClick={() => setDashMode('watchboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease',
                background: dashMode === 'watchboard' ? 'rgba(139,90,43,0.15)' : 'transparent',
                color: dashMode === 'watchboard' ? '#8B5A2B' : '#8B7355',
                whiteSpace: 'nowrap',
              }}
            >
              <List size={14} /> <span className="btn-label">List Board</span>
            </button>
            <button
              onClick={() => setDashMode('newsfeed')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease',
                background: dashMode === 'newsfeed' ? 'rgba(139,90,43,0.15)' : 'transparent',
                color: dashMode === 'newsfeed' ? '#8B5A2B' : '#8B7355',
                whiteSpace: 'nowrap',
              }}
            >
              <BookOpen size={14} /> <span className="btn-label">Live News Feed</span>
            </button>
            <button
              onClick={() => setDashMode('macro')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease',
                background: dashMode === 'macro' ? 'rgba(139,90,43,0.15)' : 'transparent',
                color: dashMode === 'macro' ? '#8B5A2B' : '#8B7355',
                whiteSpace: 'nowrap',
              }}
            >
              <Globe size={14} /> <span className="btn-label">Macro</span>
            </button>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="#8B7355" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="ticker-input"
              style={{ paddingLeft: '28px', paddingRight: (searchQuery || selectedSymbol) ? '28px' : '12px', height: '34px', fontSize: '12px', width: '160px' }}
              placeholder="Search ticker..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setFilter('all'); // Reset tab filter to 'all' so searched stock is visible
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {(searchQuery || selectedSymbol) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSymbol(null);
                }}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 700, color: '#8B7355', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0, width: '16px', height: '16px', borderRadius: '50%', zIndex: 10
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#1C1410'}
                onMouseLeave={e => e.currentTarget.style.color = '#8B7355'}
                title="Clear Search & Selection"
              >
                &times;
              </button>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '38px', left: 0, width: '100%',
                background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(139,90,43,0.2)',
                borderRadius: '8px', zIndex: 100, maxHeight: '180px', overflowY: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)'
              }}>
                {suggestions.map(sym => (
                  <div
                     key={sym}
                     onMouseDown={() => handleSelectSymbol(sym)}
                     style={{
                       padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#1C1410',
                       cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', transition: 'background 0.1s'
                     }}
                     onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,90,43,0.15)'}
                     onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {sym}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button className="btn-primary" onClick={() => { if (dashMode === 'macro') { fetchMacro(true); } else { load(true); } }} disabled={loading || macroLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', opacity: (loading || macroLoading) ? 0.7 : 1 }}>
            <RefreshCw size={13} style={{ animation: (loading || macroLoading) ? 'spin 0.7s linear infinite' : 'none' }} />
            {(loading || macroLoading) ? 'Scanning…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Summary strip */}
      {!loading && data.length > 0 && (
        <div className="summary-strip animate-fadeInUp">
          {[
            { label: 'Stocks Monitored', value: data.length, color: '#8B5A2B', icon: Activity },
            { label: 'Bullish Signals', value: bullCount, color: '#16a34a', icon: TrendingUp },
            { label: 'Bearish Signals', value: bearCount, color: '#dc2626', icon: TrendingDown },
            { label: 'Top Influence', value: topInfluence?.symbol || '–', color: '#d97706', icon: Star },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} style={{ background: 'rgba(245,240,235,0.8)', border: '1px solid rgba(139,90,43,0.07)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#8B7355', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter strip */}
      <div className="filter-strip">
        <div className="filter-btns">
          {[
            { k: 'all', l: 'All Signals' },
            { k: 'bullish', l: '▲ Bullish' },
            { k: 'bearish', l: '▼ Bearish' },
            { k: 'neutral', l: '◆ Neutral' },
          ].map(({ k, l }) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: '5px 11px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease',
              background: filter === k ? k === 'bullish' ? 'rgba(22,163,74,0.15)' : k === 'bearish' ? 'rgba(220,38,38,0.15)' : 'rgba(139,90,43,0.15)' : 'transparent',
              color: filter === k ? (k === 'bullish' ? '#16a34a' : k === 'bearish' ? '#dc2626' : k === 'neutral' ? '#d97706' : '#8B5A2B') : '#8B7355',
            }}>{l}</button>
          ))}
        </div>
        <span style={{ fontSize: '12px', color: '#8B7355' }}>
          Showing {dashMode === 'watchboard' ? filtered.length : filteredNews.length} items
        </span>
      </div>

      {/* Error */}
      {error && !loading && (
        <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <AlertCircle size={15} color="#dc2626" />
          <span style={{ fontSize: '13px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Mode 1: Stock Watchboard (Sleek List/Table View) */}
      {dashMode === 'watchboard' && (
        <div className={`watchboard-grid ${!selected ? 'no-panel' : ''}`}>
          
          <div className="glass-card" style={{ overflow: 'hidden', padding: '10px 0' }}>
            {loading ? (
              <div style={{ padding: '20px' }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                    <Sk w="50px" h="20px" /><Sk w="120px" h="20px" /><Sk w="80px" h="20px" /><Sk w="100px" h="20px" /><Sk w="200px" h="20px" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Activity size={36} color="#8B7355" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#8B7355', fontSize: '15px', fontWeight: 600 }}>No stocks match the filter</p>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '50px', textAlign: 'center' }}>Rank</th>
                      <th>Asset / Symbol</th>
                      <th style={{ textAlign: 'right' }}>Market Price</th>
                      <th>AI Sentiment</th>
                      <th className="col-strength" style={{ minWidth: '130px' }}>Sentiment Strength</th>
                      <th style={{ textAlign: 'center' }}>Influence</th>
                      <th className="col-trigger" style={{ minWidth: '220px' }}>Latest Sentiment Trigger</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, i) => {
                      const isBull = item.signal === 'bullish';
                      const isBear = item.signal === 'bearish';
                      const isSelected = selectedSymbol === item.symbol;
                      
                      const tick = getTickStatus(item);
                      const priceColor = tick === 'up' ? '#16a34a' : tick === 'down' ? '#dc2626' : '#1C1410';
                      const priceBg = tick === 'up' ? 'rgba(22,163,74,0.15)' : tick === 'down' ? 'rgba(220,38,38,0.15)' : 'transparent';
                      const simulatedPct = item.price ? item.pct_change + ((item.simPrice - item.price) / item.price) * 100 : item.pct_change;
                      const priceUp = simulatedPct >= 0;

                      return (
                        <tr
                          key={item.symbol}
                          onClick={() => setSelectedSymbol(isSelected ? null : item.symbol)}
                          style={{
                            background: isSelected ? 'rgba(139,90,43,0.08)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            borderBottom: '1px solid rgba(139,90,43,0.06)'
                          }}
                          onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(139,90,43,0.04)')}
                          onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* Rank */}
                          <td style={{ textAlign: 'center', fontWeight: 700, color: i < 3 ? '#d97706' : '#8B7355', fontFamily: 'JetBrains Mono, monospace' }}>
                            {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                          </td>

                          {/* Symbol */}
                          <td>
                            <div style={{ fontWeight: 800, color: '#1C1410', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}>
                              {item.symbol}
                            </div>
                            <div style={{ fontSize: '10px', color: '#8B7355', marginTop: '2px' }}>
                              {item.sector || 'F&O Watchlist'}
                            </div>
                          </td>

                          {/* Price */}
                          <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
                            <div style={{ 
                              fontWeight: 700, 
                              color: priceColor,
                              background: priceBg,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'inline-block',
                              transition: 'all 0.15s ease-out'
                            }}>
                              ₹{item.simPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '11px', color: priceUp ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', fontWeight: 600 }}>
                              {priceUp ? '+' : ''}{simulatedPct?.toFixed(2)}%
                            </div>
                          </td>

                          {/* Sentiment Badges */}
                          <td>
                            {isBull && <span className="badge-bullish"><TrendingUp size={9} /> BULLISH</span>}
                            {isBear && <span className="badge-bearish"><TrendingDown size={9} /> BEARISH</span>}
                            {!isBull && !isBear && <span className="badge-neutral"><Minus size={9} /> NEUTRAL</span>}
                          </td>

                          {/* Sentiment strength */}
                          <td className="col-strength">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="progress-bar" style={{ flex: 1, height: '5px' }}>
                                <div className="progress-fill" style={{
                                  width: `${Math.round(item.confidence * 100)}%`,
                                  background: isBull ? '#16a34a' : isBear ? '#dc2626' : '#d97706'
                                }} />
                              </div>
                              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: isBull ? '#16a34a' : isBear ? '#dc2626' : '#d97706' }}>
                                {Math.round(item.confidence * 100)}%
                              </span>
                            </div>
                          </td>

                          {/* Influence score */}
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              background: isBull ? 'rgba(22,163,74,0.1)' : isBear ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)',
                              color: isBull ? '#16a34a' : isBear ? '#dc2626' : '#d97706',
                              padding: '2px 8px', borderRadius: '5px', fontSize: '12px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace'
                            }}>
                              {item.influence_score}
                            </span>
                          </td>

                          {/* Headline link */}
                          <td className="col-trigger">
                            <p style={{
                              fontSize: '11.5px', color: '#5C4033', margin: 0,
                              whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '300px'
                            }}>
                              {item.top_headline || 'No major news trigger found.'}
                            </p>
                            <span style={{ fontSize: '9px', color: '#8B7355' }}>
                              {item.top_source || 'AI Classifier'}
                            </span>
                          </td>

                          {/* Action trigger */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStrike(item); }}
                              className="btn-ghost"
                              style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'rgba(139,90,43,0.1)' }}
                            >
                              <ChevronRight size={14} color="#8B5A2B" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Selected Stock Detail Panel */}
          {selected && !loading && (
            <div>
              {singleLoading ? (
                <div className="glass-card animate-fadeIn" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', position: 'sticky', top: '80px' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid rgba(139,90,43,0.15)', borderTop: '3px solid #8B5A2B', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: '16px' }} />
                  <span style={{ fontSize: '13px', color: '#1C1410', fontWeight: 700 }}>Analyzing Custom F&O Asset...</span>
                  <span style={{ fontSize: '11px', color: '#8B7355', marginTop: '4px', textAlign: 'center' }}>Fetching yFinance quotes and scraping Google News sentiment triggers</span>
                </div>
              ) : (
                <DetailPanel item={selected} articles={selectedNews} loading={selectedNewsLoading} onStrike={handleStrike} />
              )}
            </div>
          )}

        </div>
      )}

      {/* Mode 2: Live AI News Feed (Aggregated Homepage News Timeline) */}
      {dashMode === 'newsfeed' && (
        <div className={`watchboard-grid ${!selected ? 'no-panel' : ''}`}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="glass-card" style={{ padding: '20px' }}>
                  <Sk w="120px" h="16px" style={{ marginBottom: '8px' }} />
                  <Sk h="20px" style={{ marginBottom: '8px' }} />
                  <Sk w="60%" h="14px" />
                </div>
              ))
            ) : filteredNews.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Newspaper size={36} color="#8B7355" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#8B7355', fontSize: '15px', fontWeight: 600 }}>No live news matching filters</p>
              </div>
            ) : (
              sortedNews.map((newsItem, i) => {
                const isBullNews = newsItem.score > 0.05;
                const isBearNews = newsItem.score < -0.05;
                
                const tick = getTickStatus(newsItem);
                const priceColor = tick === 'up' ? '#16a34a' : tick === 'down' ? '#dc2626' : '#1C1410';
                const simulatedPct = newsItem.price ? newsItem.pct_change + ((newsItem.simPrice - newsItem.price) / newsItem.price) * 100 : newsItem.pct_change;
                const pctUp = simulatedPct >= 0;

                return (
                  <div
                    key={`${newsItem.symbol}-${i}`}
                    className="glass-card animate-fadeInUp"
                    onClick={() => {
                      const found = simulatedData.find(d => d.symbol === newsItem.symbol);
                      if (found) setSelectedSymbol(found.symbol);
                    }}
                    style={{
                      animationDelay: `${i * 30}ms`,
                      padding: '18px',
                      borderLeft: `4px solid ${isBullNews ? '#16a34a' : isBearNews ? '#dc2626' : '#d97706'}`,
                      background: 'rgba(245,240,235,0.85)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = '#8B5A2B'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = isBullNews ? '#16a34a' : isBearNews ? '#dc2626' : '#d97706'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      {/* Left: Ticker name, price indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            const found = simulatedData.find(d => d.symbol === newsItem.symbol);
                            if (found) setSelectedSymbol(found.symbol);
                          }}
                          style={{
                            fontSize: '12px', fontWeight: 800, background: 'rgba(139,90,43,0.15)',
                            color: '#8B5A2B', border: '1px solid rgba(139,90,43,0.25)',
                            padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace'
                          }}
                        >
                          {newsItem.symbol}
                        </span>

                        <span style={{ color: priceColor, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, transition: 'all 0.15s ease-out', fontSize: '11px' }}>
                          ₹{newsItem.simPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        
                        <span style={{ fontSize: '10px', color: pctUp ? '#16a34a' : '#dc2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                          {pctUp ? '+' : ''}{simulatedPct?.toFixed(2)}%
                        </span>
                      </div>

                      {/* Right: AI Rating Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                          background: isBullNews ? 'rgba(22,163,74,0.1)' : isBearNews ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)',
                          color: isBullNews ? '#16a34a' : isBearNews ? '#dc2626' : '#d97706',
                          border: `1px solid ${isBullNews ? 'rgba(22,163,74,0.2)' : isBearNews ? 'rgba(220,38,38,0.2)' : 'rgba(217,119,6,0.2)'}`
                        }}>
                          AI RATING: {newsItem.label?.toUpperCase()} ({newsItem.score > 0 ? '+' : ''}{newsItem.score?.toFixed(2)})
                        </span>
                      </div>
                    </div>

                    {/* Headline Title */}
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C1410', lineHeight: '1.4', marginBottom: '8px' }}>
                      <a 
                        href={newsItem.link} 
                        onClick={(e) => e.stopPropagation()} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover-link" 
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {newsItem.title}
                      </a>
                    </h3>

                    {/* Publishing and influence info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#8B7355' }}>
                      <span>
                        Source: <strong>{newsItem.source}</strong>
                        {newsItem.summary && (
                          <> · <span style={{ color: '#8B7355' }}>{newsItem.summary.replace('Published on ', '').replace('.', '')}</span></>
                        )}
                         · Category: <span style={{ color: '#8B5A2B', fontWeight: 600 }}>{newsItem.category?.toUpperCase() || 'GENERAL'}</span>
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Influence: <strong>{newsItem.influence_score}</strong></span>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleStrike({ symbol: newsItem.symbol, signal: newsItem.symbolSignal, confidence: newsItem.influence_score / 100 }); 
                          }}
                          className="btn-primary"
                          style={{ padding: '3px 8px', fontSize: '10px', borderRadius: '4px', boxShadow: 'none' }}
                        >
                          Strike Option &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Selected Stock Detail Panel */}
          {selected && !loading && (
            <div>
              {singleLoading ? (
                <div className="glass-card animate-fadeIn" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', position: 'sticky', top: '80px' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid rgba(139,90,43,0.15)', borderTop: '3px solid #8B5A2B', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: '16px' }} />
                  <span style={{ fontSize: '13px', color: '#1C1410', fontWeight: 700 }}>Analyzing Custom F&O Asset...</span>
                  <span style={{ fontSize: '11px', color: '#8B7355', marginTop: '4px', textAlign: 'center' }}>Fetching yFinance quotes and scraping Google News sentiment triggers</span>
                </div>
              ) : (
                <DetailPanel item={selected} articles={selectedNews} loading={selectedNewsLoading} onStrike={handleStrike} />
              )}
            </div>
          )}

        </div>
      )}

      {/* Mode 3: Sectorial Macro Economics (Global sectoral data) */}
      {dashMode === 'macro' && (
        <div className="animate-fadeIn">
          {macroLoading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ width: '48px', height: '48px', border: '3px solid rgba(139,90,43,0.15)', borderTop: '3px solid #8B5A2B', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#8B7355' }}>Generating Macroeconomics Intelligence Outlook...</p>
              <p style={{ fontSize: '12px', color: '#B8A99A', marginTop: '4px' }}>Calculating sector averages · Processing news summaries · Running LLM outlook</p>
            </div>
          ) : !macroData || macroData.fetching ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <Globe size={36} color="#8B7355" style={{ margin: '0 auto 16px', animation: 'spin 4s linear infinite' }} />
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#1C1410' }}>Sector Data is Loading...</p>
              <p style={{ fontSize: '13px', color: '#8B7355', marginTop: '6px', maxWidth: '400px', margin: '6px auto 16px', lineHeight: '1.6' }}>
                StockSense is currently scanning the F&O watchlist. Once the main homepage database is fully cached, sectoral analytics will be compiled.
              </p>
              <button className="btn-primary" onClick={() => fetchMacro(true)}>Force Scrape Macro</button>
            </div>
          ) : (
            <div>
              {/* Macro Hero Header */}
              <div style={{ background: 'linear-gradient(135deg, rgba(245,240,235,0.9), rgba(255,248,242,0.95))', border: '1px solid rgba(139,90,43,0.12)', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1410', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Globe size={18} color="#8B5A2B" /> Global Sectorial Market Outlook
                  </h2>
                  <p style={{ fontSize: '13px', color: '#8B7355' }}>
                    Tracking average performance and news-based macro triggers across 8 core sectors.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Avg Change</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: macroData.market_avg_change >= 0 ? '#16a34a' : '#dc2626', fontFamily: 'JetBrains Mono, monospace' }}>
                      {macroData.market_avg_change >= 0 ? '+' : ''}{macroData.market_avg_change}%
                    </div>
                  </div>
                  <div style={{ background: macroData.market_status === 'bullish' ? 'rgba(22,163,74,0.1)' : macroData.market_status === 'bearish' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)', color: macroData.market_status === 'bullish' ? '#16a34a' : macroData.market_status === 'bearish' ? '#dc2626' : '#d97706', border: `1px solid ${macroData.market_status === 'bullish' ? 'rgba(22,163,74,0.2)' : macroData.market_status === 'bearish' ? 'rgba(220,38,38,0.2)' : 'rgba(217,119,6,0.2)'}`, borderRadius: '12px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {macroData.market_status} Outlook
                  </div>
                </div>
              </div>

              {/* Sectors Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {macroData.sectors.map((sector) => {
                  const isBullSec = sector.signal === 'bullish';
                  const isBearSec = sector.signal === 'bearish';
                  const borderCol = isBullSec ? '#16a34a' : isBearSec ? '#dc2626' : '#d97706';
                  
                  return (
                    <div key={sector.name} className="glass-card animate-fadeInUp" style={{ padding: '20px', borderLeft: `5px solid ${borderCol}`, background: 'rgba(245,240,235,0.85)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1C1410' }}>{sector.name}</h3>
                          <span style={{ fontSize: '10px', color: '#8B7355' }}>{sector.stocks_count} stocks tracked</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: sector.avg_pct_change >= 0 ? '#16a34a' : '#dc2626', fontFamily: 'JetBrains Mono, monospace' }}>
                            {sector.avg_pct_change >= 0 ? '+' : ''}{sector.avg_pct_change}%
                          </span>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: borderCol, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                            {sector.signal}
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: '11px', color: '#8B7355', margin: 0, fontStyle: 'italic', background: 'rgba(255,255,255,0.5)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(139,90,43,0.06)' }}>
                        {sector.description}
                      </p>

                      <p style={{ fontSize: '12.5px', color: '#5C4033', lineHeight: '1.5', margin: 0 }}>
                        {sector.summary}
                      </p>

                      {/* Gainer / Loser */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid rgba(139,90,43,0.08)', paddingTop: '10px', marginTop: 'auto' }}>
                        <div>
                          <span style={{ fontSize: '9px', color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Top Gainer</span>
                          {sector.gainer ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1c1410', fontFamily: 'JetBrains Mono, monospace' }}>{sector.gainer.symbol}</span>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', fontFamily: 'JetBrains Mono, monospace' }}>+{sector.gainer.pct_change}%</span>
                            </div>
                          ) : <div style={{ fontSize: '11px', color: '#8B7355' }}>—</div>}
                        </div>
                        <div>
                          <span style={{ fontSize: '9px', color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Top Loser</span>
                          {sector.loser ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1c1410', fontFamily: 'JetBrains Mono, monospace' }}>{sector.loser.symbol}</span>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#dc2626', fontFamily: 'JetBrains Mono, monospace' }}>{sector.loser.pct_change}%</span>
                            </div>
                          ) : <div style={{ fontSize: '11px', color: '#8B7355' }}>—</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
