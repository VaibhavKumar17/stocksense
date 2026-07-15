import React, { useState, useEffect, useRef } from 'react';
import { BarChart2, Menu, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Fallback static data shown while fetching
const FALLBACK = [
  { symbol: 'NIFTY 50',   price: 24732, pct_change: 0.43,  up: true  },
  { symbol: 'BANKNIFTY',  price: 52118, pct_change: -0.21, up: false },
  { symbol: 'SENSEX',     price: 81243, pct_change: 0.38,  up: true  },
  { symbol: 'RELIANCE',   price: 2978,  pct_change: 1.12,  up: true  },
  { symbol: 'TCS',        price: 2200,  pct_change: -0.55, up: false },
  { symbol: 'INFY',       price: 1894,  pct_change: 0.72,  up: true  },
  { symbol: 'HDFCBANK',   price: 1731,  pct_change: 0.19,  up: true  },
  { symbol: 'ICICIBANK',  price: 1287,  pct_change: -0.33, up: false },
  { symbol: 'SBIN',       price: 812,   pct_change: 0.55,  up: true  },
  { symbol: 'BHARTIARTL', price: 1654,  pct_change: 1.02,  up: true  },
  { symbol: 'WIPRO',      price: 312,   pct_change: -0.44, up: false },
  { symbol: 'LT',         price: 3445,  pct_change: 0.88,  up: true  },
];

const tabs = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'striker',   label: '⚡ Striker' },
  { id: 'scanner',   label: '🔍 Scanner' },
];

export default function Navbar({ activeTab, setActiveTab }) {
  const [tickers, setTickers] = useState(FALLBACK);
  const [simulatedTickers, setSimulatedTickers] = useState([]);
  const [tickerLive, setTickerLive] = useState(false);
  const [time, setTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real-time clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch live prices
  const fetchTickers = async () => {
    try {
      const r = await fetch(`${API}/ticker-prices`, { signal: AbortSignal.timeout(15000) });
      if (!r.ok) return;
      const d = await r.json();
      if (d.tickers && d.tickers.length > 0) {
        setTickers(d.tickers);
        setTickerLive(true);
      }
    } catch (_) {}
  };

  const isMarketOpen = () => {
    const options = { timeZone: 'Asia/Kolkata', hour12: false };
    const istString = new Date().toLocaleString('en-US', options);
    const istDate = new Date(istString);
    const day = istDate.getDay();
    if (day === 0 || day === 6) return false;
    const h = istDate.getHours();
    const m = istDate.getMinutes();
    const mins = h * 60 + m;
    return mins >= 555 && mins <= 930;
  };

  const marketOpen = isMarketOpen();

  useEffect(() => {
    fetchTickers();
    const intervalMs = marketOpen ? 2000 : 30000;
    const iv = setInterval(fetchTickers, intervalMs);
    return () => clearInterval(iv);
  }, [marketOpen]);

  useEffect(() => {
    setSimulatedTickers(tickers.map(t => ({
      ...t,
      simPrice: t.price,
      tickType: null,
      lastTickTime: 0
    })));
  }, [tickers]);

  // Price simulation during market hours
  useEffect(() => {
    if (!marketOpen) return;
    const interval = setInterval(() => {
      setSimulatedTickers(prev => prev.map(t => {
        const now = Date.now();
        const shouldTick = Math.random() < 0.15;
        if (!shouldTick) return { ...t, tickType: null };
        const direction = Math.random() > 0.5 ? 1 : -1;
        const magnitude = t.simPrice * (Math.random() * 0.0003);
        const newPrice = Math.max(t.simPrice + direction * magnitude, 0.01);
        return {
          ...t,
          simPrice: parseFloat(newPrice.toFixed(2)),
          tickType: direction > 0 ? 'up' : 'down',
          lastTickTime: now,
        };
      }));
    }, 500);
    return () => clearInterval(interval);
  }, [marketOpen, tickers]);

  const getTickStatus = (t) => {
    if (!t.lastTickTime || Date.now() - t.lastTickTime > 600) return null;
    return t.tickType;
  };

  const displayTickers = [...simulatedTickers, ...simulatedTickers];

  const handleTabSelect = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50" style={{ borderBottom: '1px solid rgba(139,90,43,0.1)', backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.95)', position: 'relative' }}>

      {/* ── Ticker tape ─────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(139,90,43,0.08)', background: 'rgba(245,240,235,0.8)', padding: '5px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', gap: '0', animation: 'tickerScroll 40s linear infinite', flexShrink: 0 }}>
            {displayTickers.map((t, i) => {
              const tick = getTickStatus(t);
              const priceColor = tick === 'up' ? '#16a34a' : tick === 'down' ? '#dc2626' : '#1C1410';
              const priceBg = tick === 'up' ? 'rgba(22,163,74,0.12)' : tick === 'down' ? 'rgba(220,38,38,0.12)' : 'transparent';
              const simulatedPct = t.price ? t.pct_change + ((t.simPrice - t.price) / t.price) * 100 : t.pct_change;
              const isUp = simulatedPct >= 0;

              const priceStr = t.simPrice >= 10000
                ? t.simPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })
                : t.simPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              return (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', padding: '0 20px', borderRight: '1px solid rgba(139,90,43,0.06)', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#8B7355', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>{t.symbol}</span>
                  <span style={{
                    color: priceColor,
                    background: priceBg,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace',
                    transition: 'all 0.15s ease-out'
                  }}>{priceStr}</span>
                  <span style={{ color: isUp ? '#16a34a' : '#dc2626', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                    {isUp ? '▲' : '▼'} {Math.abs(simulatedPct || 0).toFixed(2)}%
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main nav bar ────────────────────────────────────── */}
      <div className="navbar-main">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0 }}>
          <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #8B5A2B, #A0522D)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={16} color="white" />
          </div>
          <div style={{ lineHeight: 1 }}>
            <span style={{ fontWeight: 800, fontSize: '15px', color: '#1C1410', letterSpacing: '-0.02em' }}>Stock</span>
            <span style={{ fontWeight: 800, fontSize: '15px', background: 'linear-gradient(135deg, #8B5A2B, #D2691E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>Sense</span>
          </div>
        </div>

        {/* Desktop Tabs */}
        <nav className="navbar-tabs">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease',
                background: activeTab === id ? 'rgba(139,90,43,0.12)' : 'transparent',
                color: activeTab === id ? '#8B5A2B' : '#8B7355',
                boxShadow: activeTab === id ? 'inset 0 0 0 1px rgba(139,90,43,0.18)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right side: market status + clock + hamburger */}
        <div className="navbar-right">
          {/* Live data indicator */}
          <div className="live-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 600, color: tickerLive ? '#16a34a' : '#8B7355' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tickerLive ? '#16a34a' : '#8B7355', display: 'block', animation: tickerLive ? 'pulse-dot 2s ease-in-out infinite' : 'none' }} />
            {tickerLive ? 'LIVE' : 'CACHED'}
          </div>
          {/* Market open/close */}
          <div className="market-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isMarketOpen() ? '#16a34a' : '#d97706', display: 'block' }} />
            <span style={{ color: isMarketOpen() ? '#16a34a' : '#d97706' }}>
              {isMarketOpen() ? 'NSE OPEN' : 'NSE CLOSED'}
            </span>
          </div>
          {/* IST clock */}
          <span className="clock-label" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#8B7355' }}>
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>

          {/* Hamburger for mobile */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} color="#8B5A2B" /> : <Menu size={18} color="#8B5A2B" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ─────────────────────────────── */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Mini status row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 4px 10px', borderBottom: '1px solid rgba(139,90,43,0.1)', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: tickerLive ? '#16a34a' : '#8B7355' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tickerLive ? '#16a34a' : '#8B7355', display: 'block' }} />
            {tickerLive ? 'LIVE' : 'CACHED'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isMarketOpen() ? '#16a34a' : '#d97706', display: 'block' }} />
            <span style={{ color: isMarketOpen() ? '#16a34a' : '#d97706' }}>
              {isMarketOpen() ? 'NSE OPEN' : 'NSE CLOSED'}
            </span>
          </div>
          <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#8B7355', marginLeft: 'auto' }}>
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        {/* Nav Links */}
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleTabSelect(id)}
            className={activeTab === id ? 'active' : ''}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
