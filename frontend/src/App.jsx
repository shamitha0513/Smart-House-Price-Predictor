import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Compare from './pages/Compare';
import Recommendations from './pages/Recommendations';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import AboutContact from './pages/AboutContact';
import InfoPolicies from './pages/InfoPolicies';
import { 
  Sliders, Compass, TrendingUp, User, Bell, Moon, Sun, 
  Menu, X, Brain, LogIn, LogOut, CheckCircle, AlertCircle, Key, ArrowRight, ShieldAlert
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';



const alertData = [
  { id: 1, text: "XGBoost model retrained with 97.12% accuracy index.", time: "10m ago" },
  { id: 2, text: "Regional price benchmarks in Bandra spiked +5% YoY.", time: "1h ago" },
  { id: 3, text: "Upcoming Metro Line 4 mapping parameters verified.", time: "4h ago" }
];

// Protected Route Guard
const ProtectedRoute = ({ user, children, adminOnly = false }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppContent = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // Auth state
  const [user, setUser] = useState(() => {
    const savedLocal = localStorage.getItem('user');
    const savedSession = sessionStorage.getItem('user');
    const saved = savedLocal || savedSession;
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  };

  // Newsletter state & submit handler
  const [subEmail, setSubEmail] = useState('');
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subEmail || !subEmail.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    alert(`Thank you for subscribing! Market indexing alerts will be sent to: ${subEmail}`);
    setSubEmail('');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col justify-between transition-colors duration-300">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-[500] w-full border-b border-slate-200/40 dark:border-slate-800/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white block">
                SmartPredict <span className="text-primary-600 text-xs font-semibold">AI</span>
              </span>
            </Link>

            {/* Desktop Navigation Links (Dynamic based on login status) */}
            <nav className="hidden lg:flex items-center gap-6 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
              <NavLink to="/" className={({ isActive }) => `hover:text-primary-600 dark:hover:text-primary-400 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>Home</NavLink>
              
              {user ? (
                <>
                  <NavLink to="/predict" className={({ isActive }) => `hover:text-primary-600 dark:hover:text-primary-400 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>Predict Price</NavLink>
                  <NavLink to="/compare" className={({ isActive }) => `hover:text-primary-600 dark:hover:text-primary-400 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>Compare</NavLink>
                  <NavLink to="/recommendations" className={({ isActive }) => `hover:text-primary-600 dark:hover:text-primary-400 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>Recommendations</NavLink>
                  <NavLink to="/analytics" className={({ isActive }) => `hover:text-primary-600 dark:hover:text-primary-400 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>Analytics</NavLink>
                </>
              ) : null}
              
              <NavLink to="/about" className={({ isActive }) => `hover:text-primary-600 dark:hover:text-primary-400 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>About & Contact</NavLink>
              
              {user && user.role === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => `hover:text-primary-600 dark:hover:text-primary-400 ${isActive ? 'text-primary-600 dark:text-primary-400 font-extrabold text-red-500' : 'text-red-500'}`}>Admin Panel</NavLink>
              )}
            </nav>

            {/* Header Right Action icons */}
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              
              {/* Notification bell (only for logged-in users) */}
              {user && (
                <div className="relative">
                  <button 
                    onClick={() => setAlertsOpen(!alertsOpen)}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/40 relative cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500"></span>
                  </button>

                  {/* Alerts modal */}
                  {alertsOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[900] divide-y divide-slate-100 dark:divide-slate-800/60">
                      <div className="px-4 py-2.5 font-bold text-[10px] text-slate-400 uppercase">Recent System Alerts</div>
                      {alertData.map(alert => (
                        <div key={alert.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-semibold">
                          <p className="text-slate-700 dark:text-slate-300 leading-normal">{alert.text}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">{alert.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Dark/Light mode toggle */}
              <button 
                onClick={toggleDarkMode}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Profile dropdown / Login redirect link */}
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/40 border border-primary-500/20 flex items-center justify-center text-primary-600">
                      <User className="w-4.5 h-4.5" />
                    </div>
                  </button>

                  {/* Profile Menu options */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[900] overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-xs text-slate-800 dark:text-white block truncate">{user.name}</span>
                        <span className="text-[9px] text-slate-400 block truncate">{user.email}</span>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setProfileMenuOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" /> Saved Valuations
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-xs hover:bg-red-50 dark:hover:bg-red-950/15 text-red-500 hover:text-red-600 transition-colors font-bold flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 cursor-pointer w-full text-left"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <Link 
                    to="/login"
                    className="text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    className="btn-gradient-primary py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile hamburger menu */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>

          {/* Mobile dropdown menu links */}
          {mobileMenuOpen && (
            <div className="lg:hidden px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-xl space-y-3 font-bold text-xs uppercase text-slate-500 dark:text-slate-400 flex flex-col">
              <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'text-primary-600' : ''}>Home</NavLink>
              
              {user ? (
                <>
                  <NavLink to="/predict" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'text-primary-600' : ''}>Predict Price</NavLink>
                  <NavLink to="/compare" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'text-primary-600' : ''}>Compare</NavLink>
                  <NavLink to="/recommendations" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'text-primary-600' : ''}>Recommendations</NavLink>
                  <NavLink to="/analytics" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'text-primary-600' : ''}>Analytics</NavLink>
                  <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'text-primary-600' : ''}>My Profile</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'text-primary-600' : ''}>Login</NavLink>
                  <NavLink to="/register" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'text-primary-600' : ''}>Register</NavLink>
                </>
              )}
              
              <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'text-primary-600' : ''}>About & Contact</NavLink>
              
              {user && user.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-red-500">Admin Panel</NavLink>
              )}
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<LoginPage user={user} setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage user={user} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/admin-login" element={<AdminLoginPage user={user} setUser={setUser} />} />
            <Route path="/about" element={<AboutContact />} />
            <Route path="/privacy" element={<InfoPolicies defaultTab="privacy" />} />
            <Route path="/terms" element={<InfoPolicies defaultTab="terms" />} />
            <Route path="/license" element={<InfoPolicies defaultTab="license" />} />
            
            {/* Protected Routes */}
            <Route path="/predict" element={
              <ProtectedRoute user={user}><Predict user={user} /></ProtectedRoute>
            } />
            <Route path="/compare" element={
              <ProtectedRoute user={user}><Compare /></ProtectedRoute>
            } />
            <Route path="/recommendations" element={
              <ProtectedRoute user={user}><Recommendations /></ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute user={user}><Analytics /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute user={user}><Profile user={user} /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute user={user} adminOnly={true}><Admin /></ProtectedRoute>
            } />
            
            {/* Fallback route redirection */}
            <Route path="*" element={<Home user={user} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200/40 dark:border-slate-800/40 bg-white dark:bg-slate-900 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                  <Brain className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">SmartPredict</span>
              </div>
              <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                Empowering real estate investors with premium AI property predictions, A/B comparisons, and location intelligence.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-slate-800 dark:text-white mb-2">Engines</h4>
              <Link to="/predict" className="hover:text-primary-600 block">Valuation Prediction</Link>
              <Link to="/compare" className="hover:text-primary-600 block">A/B Comparisons</Link>
              <Link to="/recommendations" className="hover:text-primary-600 block">Property Matchers</Link>
              <Link to="/analytics" className="hover:text-primary-600 block">Market Indicators</Link>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-slate-800 dark:text-white mb-2">Security & Policies</h4>
              <Link to="/privacy" className="hover:text-primary-600 block">Privacy Framework</Link>
              <Link to="/terms" className="hover:text-primary-600 block">Terms of Service</Link>
              <Link to="/license" className="hover:text-primary-600 block">Data Sources License</Link>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] uppercase font-bold text-slate-800 dark:text-white">Stay Updated</h4>
              <p className="text-[10px] text-slate-400 font-light leading-relaxed">Subscribe to local market indexing alerts.</p>
              <form onSubmit={handleSubscribe} className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <input 
                  type="email" 
                  required
                  placeholder="name@domain.com"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  className="flex-1 bg-transparent px-3 text-[10px] focus:outline-none"
                />
                <button type="submit" className="bg-primary-600 text-white font-bold px-3 hover:bg-primary-700 cursor-pointer">
                  Join
                </button>
              </form>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-6 flex justify-between items-center text-[10px] text-slate-400">
            <span>© 2026 SmartPredict AI. All Rights Reserved.</span>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
};

// ================= AUTH STANDALONE PAGES =================

// 1. LoginPage
const LoginPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUser(data.user);
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }
        navigate('/');
      } else {
        setError(data.error || "Login credentials verification failed.");
      }
    } catch (err) {
      console.warn("Auth server offline, fallback to simulation.");
      if (email === 'user@smartpredict.ai' && password === 'user123') {
        const mockUser = { name: "John Doe", email, role: "user" };
        setUser(mockUser);
        if (rememberMe) localStorage.setItem('user', JSON.stringify(mockUser));
        else sessionStorage.setItem('user', JSON.stringify(mockUser));
        navigate('/');
      } else {
        setError("Invalid email or password (simulation mock).");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="glass-card max-w-sm w-full p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Brain className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Welcome Back</h2>
          <p className="text-[10px] text-slate-400 font-light">Access your property dashboard accounts.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-red-200 bg-red-500/10 text-red-500 text-[10px] flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@smartpredict.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <Link to="/forgot-password" className="text-[9px] text-primary-500 font-bold hover:underline uppercase">Forgot?</Link>
            </div>
            <input
              type="password"
              required
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-primary-600 cursor-pointer"
            />
            <label htmlFor="remember" className="text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer">Remember Me</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient-primary w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {loading ? "Logging in..." : "Login"}
            <LogIn className="w-4 h-4" />
          </button>

          <p className="text-center text-[10px] text-slate-400 font-light mt-4">
            Don't have an account? <Link to="/register" className="text-primary-500 font-bold hover:underline">Register Now</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

// 2. RegisterPage
const RegisterPage = ({ user }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (password !== confirmPassword) {
      setError("Confirm password matches do not align.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert("Account registered successfully! Redirecting to login.");
        navigate('/login');
      } else {
        setError(data.error || "Registration pipeline aborted.");
      }
    } catch (err) {
      console.warn("Auth backend offline. Register simulation succeeded.");
      alert("Registration successful (simulation fallback). Redirecting to login.");
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="glass-card max-w-sm w-full p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Brain className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Create Account</h2>
          <p className="text-[10px] text-slate-400 font-light">Join the SmartPredict real-estate portal.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-red-200 bg-red-500/10 text-red-500 text-[10px] flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@smartpredict.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Password</label>
            <input
              type="password"
              required
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="Re-type password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient-secondary w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {loading ? "Registering Account..." : "Register Now"}
            <CheckCircle className="w-4 h-4" />
          </button>

          <p className="text-center text-[10px] text-slate-400 font-light mt-4">
            Already have an account? <Link to="/login" className="text-primary-500 font-bold hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

// 3. ForgotPasswordPage
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="glass-card max-w-sm w-full p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Key className="w-10 h-10 text-primary-600 mx-auto" />
          <h2 className="text-xl font-bold">Recover Password</h2>
          <p className="text-[10px] text-slate-400 font-light">Input your email address below to receive recovery link details.</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <input
                type="email"
                required
                placeholder="user@smartpredict.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500"
              />
            </div>

            <button
              type="submit"
              className="btn-gradient-primary w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Send Reset Token <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-500/10 text-emerald-600 text-[10px] flex items-center gap-2 font-bold justify-center">
              <CheckCircle className="w-4 h-4" /> Reset Email Dispatched!
            </div>
            <p className="text-[10px] text-slate-400 font-light leading-relaxed">
              If an account is associated with this email address, a password recovery reset token will arrive in your inbox shortly.
            </p>
            <Link to="/login" className="btn-outline py-2 px-6 text-[10px] inline-block">Return to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Secret AdminLoginPage
const AdminLoginPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') navigate('/admin');
  }, [user, navigate]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (data.user.role === 'admin') {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/admin');
        } else {
          setError("Unauthorized access. Admin privileges required.");
        }
      } else {
        setError(data.error || "Admin credentials verification failed.");
      }
    } catch (err) {
      console.warn("Auth server offline, fallback to simulation.");
      if (email === 'admin@smartpredict.ai' && password === 'admin123') {
        const mockAdmin = { name: "System Admin", email, role: "admin" };
        setUser(mockAdmin);
        localStorage.setItem('user', JSON.stringify(mockAdmin));
        navigate('/admin');
      } else {
        setError("Invalid admin credentials (simulation fallback).");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="glass-card max-w-sm w-full p-8 border border-red-500/20 bg-slate-950/20 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-red-500 dark:text-red-400">Admin Gateway Terminal</h2>
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Secret Portal</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-red-200 bg-red-500/10 text-red-500 text-[10px] flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Admin email</label>
            <input
              type="email"
              required
              placeholder="admin@smartpredict.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Master password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all text-xs"
          >
            {loading ? "Verifying Keys..." : "Access Control panel"}
            <LogIn className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// Root wrapper with ThemeProvider
const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
