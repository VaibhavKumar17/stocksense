import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap, TrendingUp, TrendingDown, RefreshCw, AlertCircle,
  BarChart3, ChevronRight, IndianRupee, Activity,
  ArrowUpRight, ArrowDownRight, Star, CheckCircle2, Wallet
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Sk({ w = '100%', h = '14px' }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: '6px' }} />;
}

// ─── Option Chain Table ────────────────────────────────────────────────────────
function OptionChainTable({ data }) {
  const { current_price, option_chain = [] } = data;
  const sorted = [...option_chain].sort((a, b) => a.strike - b.strike);
  const atm = sorted.reduce((c, r) => Math.abs(r.strike - current_price) < Math.abs(c.strike - current_price) ? r : c, sorted[0] || {});

  if (!sorted.length) return (
    <div style={{ textAlign: 'center', padding: '24px', color: '#A0937D', fontSize: '13px' }}>
      Option chain available only during market hours (9:15 AM – 3:30 PM)
    </div>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ color: '#16a34a', textAlign: 'right' }}>CE OI</th>
            <th style={{ color: '#16a34a', textAlign: 'right' }}>CE IV</th>
            <th style={{ color: '#16a34a', textAlign: 'right' }}>CE Prem</th>
            <th style={{ textAlign: 'center', background: 'rgba(139,90,43,0.05)' }}>STRIKE</th>
            <th style={{ color: '#dc2626' }}>PE Prem</th>
            <th style={{ color: '#dc2626' }}>PE IV</th>
            <th style={{ color: '#dc2626' }}>PE OI</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const isAtm = row.strike === atm.strike;
            return (
              <tr key={i} className={isAtm ? 'atm-row' : ''}>
                <td style={{ textAlign: 'right', color: '#8B7355' }}>{(row.ce_oi || 0).toLocaleString()}</td>
                <td style={{ textAlign: 'right', color: '#8B7355' }}>{row.ce_iv || '-'}</td>
                <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>₹{Number(row.ce_ltp || 0).toFixed(2)}</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: isAtm ? '#8B5A2B' : '#1C1410', background: 'rgba(139,90,43,0.04)' }}>
                  {isAtm && <span style={{ color: '#8B5A2B', marginRight: '3px' }}>●</span>}{row.strike}
                </td>
                <td style={{ color: '#dc2626', fontWeight: 600 }}>₹{Number(row.pe_ltp || 0).toFixed(2)}</td>
                <td style={{ color: '#8B7355' }}>{row.pe_iv || '-'}</td>
                <td style={{ color: '#8B7355' }}>{(row.pe_oi || 0).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Recommendation Card ───────────────────────────────────────────────────────
function RecoCard({ rec, isTop }) {
  const isBull = rec.signal === 'bullish';
  const conf = Math.round((rec.confidence || 0) * 100);

  return (
    <div style={{
      background: isTop ? 'linear-gradient(135deg, rgba(139,90,43,0.07), rgba(139,90,43,0.04))' : 'rgba(245,240,235,0.8)',
      border: `1px solid ${isTop ? 'rgba(139,90,43,0.3)' : isBull ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
      borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {isTop && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(139,90,43,0.15)', border: '1px solid rgba(139,90,43,0.3)', borderRadius: '99px', padding: '2px 10px', fontSize: '10px', fontWeight: 700, color: '#8B5A2B' }}>
          <Star size={9} fill="#8B5A2B" /> TOP PICK
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: isBull ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isBull ? <TrendingUp size={18} color="#16a34a" /> : <TrendingDown size={18} color="#dc2626" />}
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#1C1410', fontFamily: 'JetBrains Mono, monospace' }}>
            {rec.symbol} {rec.option_type} {rec.strike}
          </div>
          <div style={{ fontSize: '11px', color: '#8B7355' }}>{isBull ? 'Bullish Call Option' : 'Bearish Put Option'} · ATM {rec.atm_strike}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {[
          { l: 'Premium', v: `₹${Number(rec.premium || 0).toFixed(2)}` },
          { l: 'Capital Required', v: `₹${Number(rec.capital_required || 0).toLocaleString('en-IN')}` },
          { l: 'Lot Size', v: rec.lot_size || '-' },
          { l: 'Spot Price', v: `₹${Number(rec.current_price || 0).toLocaleString('en-IN')}` },
        ].map(({ l, v }) => (
          <div key={l} style={{ background: 'rgba(245,240,235,0.7)', borderRadius: '8px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', color: '#A0937D', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C1410', fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
          <span style={{ color: '#A0937D' }}>AI Confidence</span>
          <span style={{ color: isBull ? '#16a34a' : '#dc2626', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{conf}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${conf}%`, background: isBull ? 'linear-gradient(90deg,#15803d,#16a34a)' : 'linear-gradient(90deg,#b91c1c,#dc2626)' }} />
        </div>
      </div>
      {rec.reasoning && (
        <div style={{ background: 'rgba(139,90,43,0.05)', border: '1px solid rgba(139,90,43,0.1)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#5C4033', lineHeight: '1.55' }}>
          {rec.reasoning}
        </div>
      )}
    </div>
  );
}

// ─── Capital Input Screen ──────────────────────────────────────────────────────
function CapitalPrompt({ preselected, onConfirm }) {
  const [capital, setCapital] = useState('');
  const isBull = preselected?.signal === 'bullish';
  const isBear = preselected?.signal === 'bearish';

  return (
    <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 24px' }}>
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
        {/* Icon */}
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(139,90,43,0.1)', border: '1px solid rgba(139,90,43,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <Wallet size={26} color="#8B5A2B" />
        </div>

        {/* If came from a specific stock */}
        {preselected && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#1C1410', fontFamily: 'JetBrains Mono, monospace' }}>{preselected.symbol}</span>
              {isBull && <span className="badge-bullish"><TrendingUp size={10} /> BULLISH</span>}
              {isBear && <span className="badge-bearish"><TrendingDown size={10} /> BEARISH</span>}
            </div>
            <p style={{ fontSize: '13px', color: '#8B7355' }}>
              AI detected a <strong style={{ color: isBull ? '#16a34a' : '#dc2626' }}>{preselected.signal}</strong> signal · confidence {Math.round((preselected.confidence || 0) * 100)}%
            </p>
          </div>
        )}

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1410', marginBottom: '8px' }}>
          What's your trading capital?
        </h2>
        <p style={{ fontSize: '13px', color: '#8B7355', marginBottom: '24px', lineHeight: '1.6' }}>
          Enter your available capital so the AI can recommend options that fit your budget. This prevents picking trades you can't afford.
        </p>

        {/* Input */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: '#8B5A2B', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>₹</div>
          <input
            className="ticker-input"
            style={{ width: '100%', paddingLeft: '38px', fontSize: '18px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, height: '52px', textAlign: 'left' }}
            placeholder="e.g. 25000"
            type="number"
            min="1000"
            value={capital}
            onChange={e => setCapital(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && capital && onConfirm(parseFloat(capital))}
            autoFocus
          />
        </div>

        {/* Quick amounts */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[5000, 10000, 25000, 50000, 100000].map(amt => (
            <button key={amt} onClick={() => setCapital(String(amt))}
              style={{ padding: '5px 12px', borderRadius: '7px', border: '1px solid rgba(139,90,43,0.2)', background: capital === String(amt) ? 'rgba(139,90,43,0.2)' : 'transparent', color: capital === String(amt) ? '#8B5A2B' : '#8B7355', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s ease' }}>
              ₹{(amt / 1000).toFixed(0)}K
            </button>
          ))}
        </div>

        <button
          className="btn-primary"
          disabled={!capital || parseFloat(capital) < 1000}
          onClick={() => onConfirm(parseFloat(capital))}
          style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', padding: '13px', fontSize: '15px', fontWeight: 700, opacity: (!capital || parseFloat(capital) < 1000) ? 0.5 : 1 }}
        >
          <Zap size={16} /> Find Best Option
        </button>

        {capital && parseFloat(capital) < 1000 && (
          <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '8px' }}>Minimum capital: ₹1,000</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Striker ──────────────────────────────────────────────────────────────
export default function Striker({ preselected }) {
  const [activePreselected, setActivePreselected] = useState(preselected);
  const [stage, setStage] = useState('prompt'); // 'prompt' | 'loading' | 'result'
  const [capital, setCapital] = useState(null);
  const [picks, setPicks] = useState([]);
  const [singleRec, setSingleRec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [chainData, setChainData] = useState(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Sync activePreselected when parent prop preselected changes
  useEffect(() => {
    setActivePreselected(preselected);
  }, [preselected]);

  // Reset stage to prompt when activePreselected changes, ensuring capital is always asked first
  useEffect(() => {
    setStage('prompt');
    setCapital(null);
    setSingleRec(null);
    setSelected(null);
  }, [activePreselected]);

  // ── Fetch single stock strike (when from Dashboard) ────────────────────────
  const fetchSingleStrike = useCallback(async (capitalVal) => {
    if (!activePreselected) return;
    setLoading(true);
    setError(null);
    setSingleRec(null);
    try {
      const r = await fetch(`${API}/strikes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: activePreselected.symbol,
          signal: activePreselected.signal,
          budget: capitalVal,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!r.ok) throw new Error(`Server ${r.status}`);
      const d = await r.json();
      setSingleRec(d);
      setSelected(d);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activePreselected]);

  // ── Fetch full scan (when entering Striker directly) ───────────────────────
  const fetchAllPicks = useCallback(async (capitalVal) => {
    setLoading(true);
    setError(null);
    setPicks([]);
    try {
      const body = capitalVal ? { budget: capitalVal } : {};
      const r = await fetch(`${API}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });
      if (!r.ok) throw new Error(`Server ${r.status}`);
      const d = await r.json();
      const items = Array.isArray(d) ? d : (d.results || d.alerts || d.top_picks || []);
      setPicks(items);
      setSelected(items[0] || null);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load option chain when selected changes ────────────────────────────────
  useEffect(() => {
    if (!selected?.symbol) { setChainData(null); return; }
    setChainLoading(true);
    setChainData(null);
    fetch(`${API}/option-chain/${selected.symbol}`, { signal: AbortSignal.timeout(20000) })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setChainData(d))
      .catch(() => {})
      .finally(() => setChainLoading(false));
  }, [selected?.symbol]);

  // ── Capital confirmed ──────────────────────────────────────────────────────
  const handleCapitalConfirm = (cap) => {
    setCapital(cap);
    setStage('result');
    if (activePreselected) {
      fetchSingleStrike(cap);
    } else {
      fetchAllPicks(cap);
    }
  };

  const handleRescan = () => {
    if (capital) {
      setStage('result');
      if (activePreselected) fetchSingleStrike(capital);
      else fetchAllPicks(capital);
    } else {
      setStage('prompt');
    }
  };

  // ── Capital prompt stage ───────────────────────────────────────────────────
  if (stage === 'prompt') {
    return (
      <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
        <CapitalPrompt preselected={activePreselected} onConfirm={handleCapitalConfirm} />
      </div>
    );
  }

  // ── Results stage ──────────────────────────────────────────────────────────
  const allPicks = activePreselected ? (singleRec ? [singleRec] : []) : picks;
  const isBull = activePreselected?.signal === 'bullish';
  const isBear = activePreselected?.signal === 'bearish';

  return (
    <div className="page-container">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <Zap size={18} color="#8B5A2B" />
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1C1410', letterSpacing: '-0.03em' }}>
              {activePreselected ? (
                <>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{activePreselected.symbol}</span>
                  {' '}— {isBull ? 'Call' : 'Put'} Option{' '}
                  <span style={{ background: 'linear-gradient(135deg, #8B5A2B, #D2691E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Recommendation</span>
                </>
              ) : (
                <>AI Option <span style={{ background: 'linear-gradient(135deg, #8B5A2B, #D2691E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Picks</span></>
              )}
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#A0937D', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#16a34a', fontWeight: 700 }}>₹{Number(capital).toLocaleString('en-IN')}</span> capital budget
            {lastRefresh && <span style={{ color: '#8B5A2B' }}>· {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
            <button onClick={() => setStage('prompt')} style={{ color: '#8B7355', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}>Change Budget</button>
            {activePreselected && (
              <button 
                onClick={() => {
                  setActivePreselected(null);
                  setStage('prompt');
                  setCapital(null);
                  setSingleRec(null);
                  setSelected(null);
                }} 
                style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline', marginLeft: '6px', fontWeight: 700 }}
              >
                Clear Stock Filter (Unlock Page)
              </button>
            )}
          </p>
        </div>
        <button className="btn-primary" onClick={handleRescan} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', opacity: loading ? 0.7 : 1 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
          {loading ? 'Fetching…' : 'Re-fetch'}
        </button>
      </div>

      {/* Error */}
      {error && !loading && (
        <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertCircle size={14} color="#dc2626" />
          <span style={{ fontSize: '13px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '70px 20px' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid rgba(139,90,43,0.15)', borderTop: '3px solid #8B5A2B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#A0937D' }}>
              {activePreselected ? `Fetching ${activePreselected.symbol} option chain…` : 'AI scanning all F&O stocks…'}
            </p>
            <p style={{ fontSize: '12px', color: '#B8A99A' }}>Budget: ₹{Number(capital).toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && allPicks.length > 0 && (
        <div className={`watchboard-grid ${activePreselected ? 'no-panel' : ''}`} style={{ gridTemplateColumns: !activePreselected ? '280px 1fr' : undefined }}>

          {/* Left picks list (only in full-scan mode) */}
          {!activePreselected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#A0937D', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Activity size={11} /> AI Picks ({allPicks.length})
              </div>
              {allPicks.map((pick, i) => {
                const isB = pick.signal === 'bullish';
                const isSel = selected?.symbol === pick.symbol;
                return (
                  <button key={`${pick.symbol}-${i}`} onClick={() => setSelected(pick)} style={{
                    background: isSel ? 'rgba(139,90,43,0.1)' : 'rgba(245,240,235,0.8)',
                    border: `1px solid ${isSel ? 'rgba(139,90,43,0.35)' : isB ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)'}`,
                    borderRadius: '10px', padding: '11px 13px', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s ease', fontFamily: 'inherit',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {i === 0 && <Star size={10} color="#d97706" fill="#d97706" />}
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#1C1410', fontFamily: 'JetBrains Mono, monospace' }}>{pick.symbol}</span>
                        <span style={{ fontSize: '10px', background: isB ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)', color: isB ? '#16a34a' : '#dc2626', border: `1px solid ${isB ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)'}`, borderRadius: '4px', padding: '1px 5px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                          {pick.option_type} {pick.strike}
                        </span>
                      </div>
                      <ChevronRight size={12} color={isSel ? '#8B5A2B' : '#B8A99A'} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: '#8B7355', fontFamily: 'JetBrains Mono, monospace' }}>₹{Number(pick.capital_required || 0).toLocaleString('en-IN')}</span>
                      <span style={{ color: isB ? '#16a34a' : '#dc2626', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{Math.round((pick.confidence || 0) * 100)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Right: detail */}
          {selected && (
            <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <RecoCard rec={selected} isTop={!activePreselected && selected === allPicks[0]} />

              {/* Option Chain */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#A0937D', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BarChart3 size={11} /> Option Chain — {selected.symbol}
                  {chainLoading && <div className="spinner" style={{ width: '12px', height: '12px', marginLeft: '8px' }} />}
                </div>
                {chainLoading ? (
                  <div className="glass-card" style={{ padding: '16px' }}>
                    {[...Array(5)].map((_, i) => <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}><Sk w="70px" /><Sk w="50px" /><Sk w="80px" /><Sk w="50px" /><Sk w="80px" /></div>)}
                  </div>
                ) : chainData?.option_chain?.length > 0 ? (
                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(139,90,43,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, color: '#1C1410', fontFamily: 'JetBrains Mono, monospace' }}>{selected.symbol}</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1410', fontFamily: 'JetBrains Mono, monospace' }}>₹{chainData.current_price?.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '11px', color: '#8B7355' }}>{chainData.total_strikes} strikes · ● ATM</span>
                    </div>
                    <OptionChainTable data={chainData} />
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: '18px', textAlign: 'center', color: '#A0937D', fontSize: '13px' }}>
                    Option chain data available only during market hours
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No picks */}
      {!loading && !error && allPicks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '70px 20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'rgba(139,90,43,0.06)', border: '1px solid rgba(139,90,43,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Zap size={26} color="#A0937D" />
          </div>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#A0937D', marginBottom: '8px' }}>No options found within ₹{Number(capital).toLocaleString('en-IN')}</p>
          <p style={{ fontSize: '13px', color: '#B8A99A', maxWidth: '360px', margin: '0 auto 16px', lineHeight: '1.6' }}>
            Try increasing your budget or check back when market sentiment shifts.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn-ghost" onClick={() => setStage('prompt')} style={{ fontSize: '13px' }}>Change Budget</button>
            <button className="btn-primary" onClick={handleRescan} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <RefreshCw size={13} /> Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
