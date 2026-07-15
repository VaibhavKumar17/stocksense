import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Mail, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Bell 
} from 'lucide-react';

function Landing({ onEnterSandbox }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Ticker simulation state
  const [tickerPrices, setTickerPrices] = useState([
    { ticker: 'RELIANCE', price: 2450.45, change: 1.25, isUp: true },
    { ticker: 'TCS', price: 3820.10, change: -0.80, isUp: false },
    { ticker: 'INFY', price: 1480.95, change: 0.45, isUp: true },
    { ticker: 'HDFCBANK', price: 1610.15, change: 2.10, isUp: true },
    { ticker: 'WIPRO', price: 442.30, change: -1.15, isUp: false },
    { ticker: 'ICICIBANK', price: 980.50, change: 0.95, isUp: true },
  ]);

  useEffect(() => {
    // Check if user is already signed up in local storage
    const signedUp = localStorage.getItem('stocksense_waitlist_registered');
    if (signedUp) {
      setIsSubscribed(true);
      setStatus('success');
    }

    // Simulate real-time stock ticker updates
    const interval = setInterval(() => {
      setTickerPrices(prev => 
        prev.map(item => {
          const delta = (Math.random() - 0.48) * 2; // slight upward bias
          const newPrice = Math.max(10, item.price + delta);
          const percentChange = ((newPrice - (item.price - delta * 5)) / item.price) * 100;
          return {
            ...item,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(percentChange.toFixed(2)),
            isUp: delta >= 0
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('stocksense_waitlist_registered', 'true');
      setIsSubscribed(true);
      setStatus('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans select-none">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none"></div>

      {/* Animated Live Ticker */}
      <div className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 py-2.5 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mr-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Mock Feed
          </div>
          <div className="flex items-center gap-8 animate-marquee">
            {tickerPrices.map((stock) => (
              <div key={stock.ticker} className="flex items-center gap-2 text-sm bg-slate-950/40 px-3 py-1 rounded-lg border border-slate-900">
                <span className="font-bold text-slate-300">{stock.ticker}</span>
                <span className="text-slate-400 font-medium">₹{stock.price}</span>
                <span className={`flex items-center text-xs font-bold ${stock.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stock.isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />}
                  {stock.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header / Brand */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">StockSense</span>
            <span className="text-[10px] block font-bold text-emerald-400 tracking-widest uppercase">F&O Screener</span>
          </div>
        </div>
        <div>
          <button 
            onClick={onEnterSandbox}
            className="group relative inline-flex items-center gap-1.5 px-4.5 py-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-emerald-300 transition-all text-xs font-semibold"
          >
            Explore Prototype Sandbox
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col justify-center items-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 z-10">
        
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold tracking-wide uppercase mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Under Construction
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-3xl space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none text-slate-100">
            Option Chain & Sentiment Screener For <span className="bg-gradient-to-r from-emerald-400 via-emerald-200 to-teal-400 bg-clip-text text-transparent">Smart Traders</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg md:text-xl font-normal max-w-2xl mx-auto">
            Automating sentiment-driven options screener with live news feeds, OTM call/put suggestor, and direct capital calculation. We are building the future of derivative screener.
          </p>
        </div>

        {/* Interactive Early Access Waitlist Form */}
        <div className="w-full max-w-md mt-10 p-6 sm:p-8 bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          
          {status !== 'success' ? (
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-200 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  Get Early Access
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Join our exclusive waitlist to secure early access and development updates.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none text-sm transition-colors disabled:opacity-50"
                  />
                </div>
                {status === 'error' && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorMessage}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700/50 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      Adding you to list...
                    </>
                  ) : (
                    <>
                      Request Invitation
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3 animate-fade-in">
              <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">You're on the list!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Thank you for registering. You've unlocked spot **#{Math.floor(Math.random() * 500) + 120}** in line. We will contact you soon.
                </p>
              </div>
              <button 
                onClick={onEnterSandbox}
                className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline transition-all"
              >
                Go ahead and preview the Sandbox Dashboard &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Feature Teasers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-16">
          <div className="p-6 bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-2xl transition-all group">
            <div className="p-3 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-xl w-fit group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-200 mt-4">Sentiment-Driven Screener</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              We scrape financial news using lightweight models to classify sentiment score on major tickers, providing clear Bullish/Bearish alerts.
            </p>
          </div>

          <div className="p-6 bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-2xl transition-all group">
            <div className="p-3 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-xl w-fit group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-200 mt-4">Option Chain Suggester</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Get targeted suggestions for out-of-the-money Call & Put contracts tailored to recent sentiment direction, premiums, and spot price triggers.
            </p>
          </div>

          <div className="p-6 bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-2xl transition-all group">
            <div className="p-3 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-xl w-fit group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-200 mt-4">Required Capital Tracker</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Instantly calculate the exact estimated capital required based on current premiums and standard market contract sizes for instant planning.
            </p>
          </div>
        </div>

        {/* Live Build Roadmap Progress */}
        <div className="w-full max-w-3xl mt-16 p-6 bg-slate-900/10 border border-slate-900/80 rounded-2xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 text-center flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            StockSense Development Timeline
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="flex flex-col items-center text-center p-3 bg-slate-950/60 rounded-xl border border-emerald-500/20 relative">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center mb-2">
                ✓
              </div>
              <span className="text-[11px] font-bold text-slate-300">Phase 1</span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">Sentiment Engine</span>
            </div>

            <div className="flex flex-col items-center text-center p-3 bg-slate-950/60 rounded-xl border border-emerald-500/20 relative">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center mb-2">
                ✓
              </div>
              <span className="text-[11px] font-bold text-slate-300">Phase 2</span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">Option Suggester</span>
            </div>

            <div className="flex flex-col items-center text-center p-3 bg-slate-950/40 rounded-xl border border-slate-900 relative">
              <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold flex items-center justify-center mb-2 animate-pulse">
                IP
              </div>
              <span className="text-[11px] font-bold text-slate-300">Phase 3</span>
              <span className="text-[10px] text-teal-400 font-semibold mt-0.5">WebSockets & API</span>
            </div>

            <div className="flex flex-col items-center text-center p-3 bg-slate-950/20 rounded-xl border border-dashed border-slate-900 opacity-60">
              <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-xs flex items-center justify-center mb-2">
                4
              </div>
              <span className="text-[11px] font-bold text-slate-500">Phase 4</span>
              <span className="text-[10px] text-slate-600 font-semibold mt-0.5">Launch & Beta</span>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-900/60 text-center text-xs text-slate-600 z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} StockSense. Options chain & sentiment indicators.</p>
        <div className="flex items-center gap-4">
          <a href="https://github.com/vaibhavkumar17/stocksense" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors flex items-center gap-1">
            <Bell className="w-3.5 h-3.5 inline" />
            Release Notes
          </a>
          <span className="text-slate-800">•</span>
          <button onClick={onEnterSandbox} className="hover:text-emerald-400 transition-colors">
            Sandbox Sandbox Screeners
          </button>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
