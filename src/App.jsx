import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Striker from './pages/Striker';
import Scanner from './pages/Scanner';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [strikerPreselect, setStrikerPreselect] = useState(null);

  // Called from Dashboard when user clicks "Find Best Option" on a stock
  const handleNavigateToStriker = (stockItem) => {
    setStrikerPreselect(stockItem);
    setActiveTab('striker');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigateToStriker={handleNavigateToStriker} />;
      case 'striker':
        return <Striker preselected={strikerPreselect} />;
      case 'scanner':
        return <Scanner />;
      default:
        return <Dashboard onNavigateToStriker={handleNavigateToStriker} />;
    }
  };

  const handleSetActiveTab = (tab) => {
    if (tab !== 'striker') {
      setStrikerPreselect(null);
    }
    setActiveTab(tab);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }} className="bg-grid">
      {/* Warm ambient glow blobs */}
      <div style={{
        position: 'fixed', top: '-200px', left: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(139,90,43,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-200px', right: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(160,82,45,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', top: '40%', left: '50%',
        width: '800px', height: '800px',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(210,105,30,0.03) 0%, transparent 60%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ===== Floating Stock Market SVG Background Elements ===== */}

      {/* Candlestick 1 — top-left area */}
      <svg
        className="bg-stock-element"
        style={{ top: '10%', left: '5%', width: '40px', height: '100px', animation: 'floatCandle 12s ease-in-out infinite' }}
        viewBox="0 0 40 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="20" y1="0" x2="20" y2="100" stroke="currentColor" strokeWidth="2" />
        <rect x="10" y="25" width="20" height="40" rx="2" fill="currentColor" />
      </svg>

      {/* Candlestick 2 — center-right area, larger */}
      <svg
        className="bg-stock-element"
        style={{ top: '35%', right: '8%', width: '50px', height: '120px', animation: 'floatCandle 16s ease-in-out infinite 2s' }}
        viewBox="0 0 40 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="20" y1="5" x2="20" y2="95" stroke="currentColor" strokeWidth="2" />
        <rect x="8" y="30" width="24" height="35" rx="2" fill="currentColor" />
      </svg>

      {/* Candlestick 3 — bottom-center area, small */}
      <svg
        className="bg-stock-element"
        style={{ bottom: '15%', left: '45%', width: '30px', height: '80px', animation: 'riseCandle 10s ease-in-out infinite 1s' }}
        viewBox="0 0 40 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="20" y1="0" x2="20" y2="100" stroke="currentColor" strokeWidth="2" />
        <rect x="12" y="20" width="16" height="45" rx="2" fill="currentColor" />
      </svg>

      {/* Bull silhouette — top-right area */}
      <svg
        className="bg-stock-element"
        style={{ top: '8%', right: '12%', width: '120px', height: '100px', animation: 'floatBull 18s ease-in-out infinite' }}
        viewBox="0 0 120 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simple bull head with horns */}
        <path d="M10 45 Q5 20 20 10 Q30 15 35 30 L40 35 Q50 20 60 20 Q70 20 80 35 L85 30 Q90 15 100 10 Q115 20 110 45 Q108 55 100 62 Q90 72 75 75 L78 90 L70 90 L68 78 Q60 80 52 78 L50 90 L42 90 L45 75 Q30 72 20 62 Q12 55 10 45 Z M38 50 Q40 47 44 48 Q46 50 44 53 Q41 53 38 50 Z M76 50 Q78 47 82 48 Q84 50 82 53 Q79 53 76 50 Z M52 62 Q55 58 60 58 Q65 58 68 62 Q65 66 60 67 Q55 66 52 62 Z" />
      </svg>

      {/* Bear silhouette — bottom-left area */}
      <svg
        className="bg-stock-element"
        style={{ bottom: '10%', left: '8%', width: '110px', height: '100px', animation: 'floatBear 20s ease-in-out infinite 3s' }}
        viewBox="0 0 120 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simple bear head */}
        <circle cx="25" cy="20" r="15" />
        <circle cx="95" cy="20" r="15" />
        <ellipse cx="60" cy="55" rx="40" ry="35" />
        <circle cx="45" cy="45" r="4" fill="var(--bg-base)" />
        <circle cx="75" cy="45" r="4" fill="var(--bg-base)" />
        <ellipse cx="60" cy="60" rx="8" ry="5" fill="var(--bg-base)" />
      </svg>

      {/* Drifting chart line 1 — upper area */}
      <svg
        className="bg-stock-element"
        style={{ top: '22%', left: '0', width: '300px', height: '80px', animation: 'driftChart 25s linear infinite' }}
        viewBox="0 0 300 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="0,60 30,50 60,55 90,30 120,35 150,15 180,25 210,10 240,20 270,5 300,18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Drifting chart line 2 — mid area */}
      <svg
        className="bg-stock-element"
        style={{ top: '55%', left: '0', width: '350px', height: '80px', animation: 'driftChart 30s linear infinite 8s' }}
        viewBox="0 0 350 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="0,40 40,45 80,20 120,50 160,30 200,55 240,25 280,40 320,15 350,30"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Drifting chart line 3 — lower area */}
      <svg
        className="bg-stock-element"
        style={{ top: '78%', left: '0', width: '280px', height: '60px', animation: 'driftChart 22s linear infinite 4s' }}
        viewBox="0 0 280 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="0,50 35,35 70,45 105,20 140,30 175,10 210,25 245,15 280,28"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* ===== End Background Elements ===== */}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar activeTab={activeTab} setActiveTab={handleSetActiveTab} />
        <main style={{ minHeight: 'calc(100vh - 120px)' }}>
          {renderPage()}
        </main>
        <footer style={{
          borderTop: '1px solid rgba(139,90,43,0.1)',
          padding: '18px 24px', textAlign: 'center',
          fontSize: '11px', color: '#8B7355',
        }}>
          © {new Date().getFullYear()} StockSense · AI Options Screener · NSE/BSE F&O · Data via yFinance & Google News
        </footer>
      </div>
    </div>
  );
}

export default App;
