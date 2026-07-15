import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, TrendingUp, TrendingDown, RefreshCw, AlertCircle,
  Activity, ChevronRight, IndianRupee, CheckCircle2,
  BarChart2, Flame, Minus, ArrowUpRight, ArrowDownRight, Star,
  Wallet, Zap
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
    <div style={{ textAlign: 'center', padding: '16px', color: '#8B7355', fontSize: '12px' }}>
      Option chain available only during market hours (9:15 AM – 3:30 PM)
    </div>
  );

  return (
    <div style={{ overflowX: 'auto', maxHeight: '200px' }}>
      <table className="data-table" style={{ fontSize: '11px' }}>
        <thead>
          <tr>
            <th style={{ color: '#16a34a', textAlign: 'right', padding: '6px' }}>CE OI</th>
            <th style={{ color: '#16a34a', textAlign: 'right', padding: '6px' }}>CE Prem</th>
            <th style={{ textAlign: 'center', background: 'rgba(139,90,43,0.05)', padding: '6px' }}>STRIKE</th>
            <th style={{ color: '#dc2626', padding: '6px' }}>PE Prem</th>
            <th style={{ color: '#dc2626', padding: '6px', textAlign: 'right' }}>PE OI</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const isAtm = row.strike === atm.strike;
            return (
              <tr key={i} className={isAtm ? 'atm-row' : ''} style={{ background: isAtm ? 'rgba(139,90,43,0.08)' : 'transparent' }}>
                <td style={{ textAlign: 'right', color: '#8B7355', padding: '6px' }}>{(row.ce_oi || 0).toLocaleString()}</td>
                <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600, padding: '6px' }}>₹{Number(row.ce_ltp || 0).toFixed(2)}</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: isAtm ? '#8B5A2B' : '#1C1410', background: 'rgba(139,90,43,0.04)', padding: '6px' }}>
                  {isAtm && <span style={{ color: '#8B5A2B', marginRight: '3px' }}>●</span>}{row.strike}
                </td>
                <td style={{ color: '#dc2626', fontWeight: 600, padding: '6px' }}>₹{Number(row.pe_ltp || 0).toFixed(2)}</td>
                <td style={{ color: '#8B7355', padding: '6px', textAlign: 'right' }}>{(row.pe_oi || 0).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Scanner Row ───────────────────────────────────────────────────────────────
function ScanRow({ item, rank, onSelect, selected }) {
  const isBull = item.signal === 'bullish';
  const isBear = item.signal === 'bearish';
  const isNeutral = !isBull && !isBear;
  const conf = Math.round((item.confidence || 0) * 100);
  const priceUp = (item.pct_change || 0) >= 0;
  const isSelected = selected?.symbol === item.symbol;

  return (
    <tr
      onClick={() => onSelect(item)}
      style={{
        background: isSelected ? 'rgba(139,90,43,0.08)' : 'transparent',
        cursor: 'pointer', transition: 'background 0.15s ease',
        borderBottom: '1px solid rgba(15,23,42,0.6)',
      }}
      onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(139,90,43,0.04)')}
      onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
    >
      {/* Rank */}
      <td style={{ padding: '13px 14px', width: '40px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: rank <= 3 ? '#d97706' : '#A0937D', fontFamily: 'JetBrains Mono, monospace' }}>
          {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
        </span>
      </td>
      {/* Symbol */}
      <td style={{ padding: '13px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#1C1410', fontFamily: 'JetBrains Mono, monospace' }}>{item.symbol}</span>
          {isBull && <span className="badge-bullish" style={{ fontSize: '10px', padding: '2px 7px' }}><TrendingUp size={8} /> BUY CE</span>}
          {isBear && <span className="badge-bearish" style={{ fontSize: '10px', padding: '2px 7px' }}><TrendingDown size={8} /> BUY PE</span>}
          {isNeutral && <span className="badge-neutral" style={{ fontSize: '10px', padding: '2px 7px' }}><Minus size={8} /> NEUTRAL</span>}
        </div>
        {item.sector && <div style={{ fontSize: '10px', color: '#A0937D', marginTop: '2px' }}>{item.sector}</div>}
      </td>
      {/* Price */}
      <td style={{ padding: '13px 8px', fontFamily: 'JetBrains Mono, monospace' }}>
        {item.current_price > 0 ? (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C1410' }}>₹{Number(item.current_price).toLocaleString('en-IN')}</div>
            {item.pct_change !== undefined && (
              <div style={{ fontSize: '11px', color: priceUp ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '2px' }}>
                {priceUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {item.pct_change > 0 ? '+' : ''}{Number(item.pct_change).toFixed(2)}%
              </div>
            )}
          </div>
        ) : <span style={{ color: '#A0937D' }}>—</span>}
      </td>
      {/* Strike */}
      <td style={{ padding: '13px 8px', fontFamily: 'JetBrains Mono, monospace' }}>
        {item.strike ? (
          <span style={{ fontSize: '12px', background: 'rgba(139,90,43,0.1)', color: '#8B5A2B', border: '1px solid rgba(139,90,43,0.2)', borderRadius: '5px', padding: '2px 8px', fontWeight: 700 }}>
            {item.option_type} {item.strike}
          </span>
        ) : <span style={{ color: '#A0937D' }}>—</span>}
      </td>
      {/* Premium */}
      <td style={{ padding: '13px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: isBull ? '#16a34a' : isBear ? '#dc2626' : '#8B7355', fontWeight: 600 }}>
        {item.premium ? `₹${Number(item.premium).toFixed(2)}` : '—'}
      </td>
      {/* Capital */}
      <td style={{ padding: '13px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#5C4033' }}>
        {item.capital_required ? `₹${Number(item.capital_required).toLocaleString('en-IN')}` : '—'}
      </td>
      {/* Confidence bar */}
      <td style={{ padding: '13px 14px', minWidth: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${conf}%`, background: isBull ? '#16a34a' : isBear ? '#dc2626' : '#A0937D' }} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: isBull ? '#16a34a' : isBear ? '#dc2626' : '#8B7355', fontFamily: 'JetBrains Mono, monospace', width: '28px', textAlign: 'right' }}>{conf}%</span>
        </div>
      </td>
      {/* Arrow */}
      <td style={{ padding: '13px 10px' }}>
        <ChevronRight size={14} color={isSelected ? '#8B5A2B' : '#B8A99A'} />
      </td>
    </tr>
  );
}

// ─── Detail drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ item, onClose }) {
  const isBull = item.signal === 'bullish';
  const conf = Math.round((item.confidence || 0) * 100);

  const [chainData, setChainData] = useState(null);
  const [chainLoading, setChainLoading] = useState(false);

  useEffect(() => {
    if (!item?.symbol) return;
    let active = true;
    setChainLoading(true);
    fetch(`${API}/option-chain/${item.symbol}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (active) setChainData(d);
      })
      .catch(e => console.error("Error fetching option chain", e))
      .finally(() => {
        if (active) setChainLoading(false);
      });
    return () => { active = false; };
  }, [item?.symbol]);

  return (
    <div className="animate-slideInRight glass-card" style={{ padding: '22px', position: 'sticky', top: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#1C1410', fontFamily: 'JetBrains Mono, monospace' }}>{item.symbol}</span>
          <span className={isBull ? 'badge-bullish' : 'badge-bearish'}>{isBull ? '▲ BUY CE' : '▼ BUY PE'}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#A0937D', cursor: 'pointer', fontSize: '18px' }}>×</button>
      </div>

      {/* Option details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { l: 'Strike', v: `${item.option_type} ${item.strike}`, color: '#8B5A2B' },
          { l: 'ATM Strike', v: item.atm_strike || '—', color: '#5C4033' },
          { l: 'Premium', v: `₹${Number(item.premium || 0).toFixed(2)}`, color: isBull ? '#16a34a' : '#dc2626' },
          { l: 'Capital', v: `₹${Number(item.capital_required || 0).toLocaleString('en-IN')}`, color: '#1C1410' },
          { l: 'Lot Size', v: item.lot_size || '—', color: '#5C4033' },
          { l: 'Open Interest', v: (item.open_interest || 0).toLocaleString(), color: '#5C4033' },
        ].map(({ l, v, color }) => (
          <div key={l} style={{ background: 'rgba(245,240,235,0.7)', borderRadius: '8px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', color: '#A0937D', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Confidence */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
          <span style={{ color: '#A0937D' }}>AI Confidence</span>
          <span style={{ color: isBull ? '#16a34a' : '#dc2626', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{conf}%</span>
        </div>
        <div className="progress-bar" style={{ height: '6px' }}>
          <div className="progress-fill" style={{ width: `${conf}%`, background: isBull ? 'linear-gradient(90deg,#15803d,#16a34a)' : 'linear-gradient(90deg,#b91c1c,#dc2626)' }} />
        </div>
      </div>

      {/* Reasoning */}
      {item.reasoning && (
        <div style={{ background: 'rgba(139,90,43,0.05)', border: '1px solid rgba(139,90,43,0.1)', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#5C4033', lineHeight: '1.55', marginBottom: '14px' }}>
          {item.reasoning}
        </div>
      )}

      {/* Macro event */}
      {item.macro_event && (
        <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#d97706', marginBottom: '14px' }}>
          📊 Macro: {item.macro_event}
        </div>
      )}

      {/* Live Option Chain */}
      <div style={{ marginTop: '18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Live Option Chain
        </div>
        {chainLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ background: 'rgba(245,240,235,0.4)', borderRadius: '8px', padding: '10px' }}>
                <Sk h="10px" style={{ marginBottom: '6px' }} />
                <Sk w="50%" h="8px" />
              </div>
            ))}
          </div>
        ) : chainData ? (
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(139,90,43,0.15)', borderRadius: '8px', background: '#FFFFFF' }}>
            <OptionChainTable data={chainData} />
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#8B7355', fontStyle: 'italic', padding: '10px', background: 'rgba(245,240,235,0.4)', borderRadius: '8px', textAlign: 'center' }}>
            Option chain data not available for this ticker.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Capital Prompt Screen ───────────────────────────────────────────────────
function CapitalPrompt({ onConfirm }) {
  const [capital, setCapital] = useState('');

  return (
    <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 24px' }}>
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(139,90,43,0.1)', border: '1px solid rgba(139,90,43,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <Wallet size={26} color="#8B5A2B" />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1410', marginBottom: '8px' }}>
          What's your trading capital?
        </h2>
        <p style={{ fontSize: '13px', color: '#8B7355', marginBottom: '24px', lineHeight: '1.6' }}>
          Enter your available capital so the AI can scan and rank options that fit your budget. This prevents picking trades you can't afford.
        </p>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: '#8B7355', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>₹</div>
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
          <Zap size={16} /> Scan F&O Options
        </button>

        {capital && parseFloat(capital) < 1000 && (
          <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '8px' }}>Minimum capital: ₹1,000</p>
        )}
      </div>
    </div>
  );
}


// ─── Main Scanner ──────────────────────────────────────────────────────────────
export default function Scanner() {
  const [stage, setStage] = useState('prompt'); // 'prompt' | 'result'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [budget, setBudget] = useState('');
  const [budgetApplied, setBudgetApplied] = useState(null);
  const [lastScan, setLastScan] = useState(null);
  const [sortBy, setSortBy] = useState('confidence');

  const runScan = useCallback(async (bgt) => {
    setLoading(true);
    setError(null);
    try {
      const body = {};
      if (bgt) body.budget = parseFloat(bgt);
      const r = await fetch(`${API}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });
      if (!r.ok) throw new Error(`Server ${r.status}`);
      const d = await r.json();
      const items = Array.isArray(d) ? d : (d.results || d.alerts || d.top_picks || []);
      setResults(items);
      setLastScan(new Date());
      if (items.length > 0) setSelected(items[0]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCapitalConfirm = (cap) => {
    setBudget(String(cap));
    setBudgetApplied(cap);
    setStage('result');
    runScan(cap);
  };

  const applyBudget = () => { setBudgetApplied(budget || null); runScan(budget); };

  const sorted = [...results]
    .filter(r => filter === 'all' || r.signal === filter)
    .sort((a, b) => {
      if (sortBy === 'confidence') return (b.confidence || 0) - (a.confidence || 0);
      if (sortBy === 'capital') return (a.capital_required || 0) - (b.capital_required || 0);
      if (sortBy === 'premium') return (a.premium || 0) - (b.premium || 0);
      return 0;
    });

  const bullCount = results.filter(r => r.signal === 'bullish').length;
  const bearCount = results.filter(r => r.signal === 'bearish').length;

  if (stage === 'prompt') {
    return (
      <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
        <CapitalPrompt onConfirm={handleCapitalConfirm} />
      </div>
    );
  }

  return (
    <div className="page-container">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <Search size={18} color="#8B5A2B" />
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1C1410', letterSpacing: '-0.03em' }}>
              Market{' '}
              <span style={{ background: 'linear-gradient(135deg, #8B5A2B, #D2691E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scanner</span>
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#A0937D' }}>
            Full AI scan · Ranked by news sentiment strength
            {lastScan && <span style={{ color: '#8B5A2B', marginLeft: '6px' }}>· Last scan {lastScan.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
            <button onClick={() => setStage('prompt')} style={{ color: '#8B7355', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline', marginLeft: '8px' }}>Change Budget</button>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Budget */}
          <div style={{ position: 'relative' }}>
            <IndianRupee size={13} color="#8B7355" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input className="ticker-input" style={{ paddingLeft: '28px', width: '145px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}
              placeholder="Max capital" type="number" value={budget} onChange={e => setBudget(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyBudget()} />
          </div>
          <button className="btn-ghost" onClick={applyBudget} style={{ fontSize: '13px', padding: '8px 14px' }}>Apply</button>
          <button className="btn-primary" onClick={() => runScan(budget)} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', opacity: loading ? 0.7 : 1 }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
            {loading ? 'Scanning…' : 'Re-scan'}
          </button>
        </div>
      </div>

      {/* Budget banner */}
      {budgetApplied && (
        <div style={{ background: 'rgba(139,90,43,0.07)', border: '1px solid rgba(139,90,43,0.2)', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8B5A2B' }}>
          <CheckCircle2 size={13} /> Filtered: capital ≤ ₹{Number(budgetApplied).toLocaleString('en-IN')}
          <button onClick={() => { setBudget(''); setBudgetApplied(null); runScan(''); }} style={{ marginLeft: 'auto', fontSize: '12px', color: '#8B7355', background: 'none', border: 'none', cursor: 'pointer' }}>Clear ×</button>
        </div>
      )}

      {/* Summary cards */}
      {!loading && results.length > 0 && (
        <div className="summary-strip animate-fadeInUp">
          {[
            { l: 'Total Scanned', v: results.length, c: '#8B5A2B' },
            { l: 'Bullish', v: bullCount, c: '#16a34a' },
            { l: 'Bearish', v: bearCount, c: '#dc2626' },
            { l: 'Top Pick', v: results[0]?.symbol || '—', c: '#d97706' },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ background: 'rgba(245,240,235,0.8)', border: '1px solid rgba(139,90,43,0.07)', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ fontSize: '10px', color: '#A0937D', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: c, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertCircle size={14} color="#dc2626" />
          <span style={{ fontSize: '13px', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', border: '3px solid rgba(139,90,43,0.15)', borderTop: '3px solid #8B5A2B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#A0937D' }}>Running AI scan across all F&O stocks…</p>
            <p style={{ fontSize: '12px', color: '#B8A99A' }}>Fetching news · Classifying sentiment · Ranking by influence</p>
          </div>
        </div>
      )}

      {/* Table + Detail */}
      {!loading && sorted.length > 0 && (
        <div className={`watchboard-grid ${!selected ? 'no-panel' : ''}`}>

          {/* Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {/* Controls */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(139,90,43,0.08)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: '3px', background: 'rgba(245,240,235,0.7)', border: '1px solid rgba(139,90,43,0.08)', borderRadius: '7px', padding: '2px' }}>
                {[['all','All'],['bullish','▲ Bullish'],['bearish','▼ Bearish']].map(([k,l]) => (
                  <button key={k} onClick={() => setFilter(k)} style={{
                    padding: '4px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer',
                    fontSize: '11px', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease',
                    background: filter === k ? k === 'bullish' ? 'rgba(22,163,74,0.2)' : k === 'bearish' ? 'rgba(220,38,38,0.2)' : 'rgba(139,90,43,0.2)' : 'transparent',
                    color: filter === k ? k === 'bullish' ? '#16a34a' : k === 'bearish' ? '#dc2626' : '#8B5A2B' : '#8B7355',
                  }}>{l}</button>
                ))}
              </div>
              {/* Sort */}
              <select className="ticker-input" style={{ fontSize: '12px', padding: '4px 30px 4px 10px', width: 'auto' }}
                value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="confidence">Sort: Confidence</option>
                <option value="capital">Sort: Cheapest Capital</option>
                <option value="premium">Sort: Cheapest Premium</option>
              </select>
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#A0937D' }}>{sorted.length} results</span>
            </div>

            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Symbol</th>
                  <th>Price</th>
                  <th>Strike</th>
                  <th>Premium</th>
                  <th>Capital</th>
                  <th>Confidence</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item, i) => (
                  <ScanRow key={`${item.symbol}-${i}`} item={item} rank={i + 1} onSelect={setSelected} selected={selected} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail drawer */}
          {selected && <DetailDrawer item={selected} onClose={() => setSelected(null)} />}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(139,90,43,0.06)', border: '1px solid rgba(139,90,43,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <BarChart2 size={28} color="#A0937D" />
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#A0937D', marginBottom: '6px' }}>No actionable picks found</p>
          <p style={{ fontSize: '13px', color: '#B8A99A', maxWidth: '360px', margin: '0 auto 16px', lineHeight: '1.6' }}>Market is in a neutral zone. AI will surface opportunities when sentiment shifts on any stock.</p>
          <button className="btn-primary" onClick={() => runScan(budget)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={13} /> Scan Again
          </button>
        </div>
      )}
    </div>
  );
}
