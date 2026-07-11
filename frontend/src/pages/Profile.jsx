import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  User, Mail, Calendar, Heart, Sliders, Trash2, 
  Clock, FileText, X, Printer, Download, CheckCircle
} from 'lucide-react';

const formatINR = (value) => {
  if (value >= 10000000) return `₹ ${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹ ${(value / 100000).toFixed(2)} L`;
  return `₹ ${value.toLocaleString('en-IN')}`;
};

const Profile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('saved');
  const [wishlist, setWishlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const email = user?.email || "user@smartpredict.ai";

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${API_URL}/api/wishlist?email=${email}`);
      const data = await res.json();
      if (res.ok) {
        setWishlist(data);
      }
    } catch (err) {
      console.warn("Wishlist API offline. Fallback mock.");
      setWishlist([
        {
          id: 1,
          title: "Luxury 3 BHK Penthouse in Bandra",
          price: 65000000,
          formatted_price: formatINR(65000000),
          location: "Bandra",
          city: "Mumbai",
          bhk: 3,
          bathrooms: 3,
          rating: 4.9,
          image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
        }
      ]);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/predictions-history?email=${email}`);
      const data = await res.json();
      if (res.ok) {
        setHistory(data);
      }
    } catch (err) {
      console.warn("History API offline. Fallback mock.");
      setHistory([
        {
          id: 1,
          user_email: email,
          timestamp: new Date().toISOString(),
          city: "Mumbai",
          location: "Bandra",
          bhk: 2,
          carpet_area: 800,
          predicted_price: 24000000,
          confidence_score: 94.5,
          algorithm: "Random Forest",
          inputs_json: JSON.stringify({
            City: "Mumbai",
            Location: "Bandra",
            "Carpet Area": 800,
            "Built-up Area": 960,
            "Super Built-up Area": 1200,
            BHK: 2,
            Bathrooms: 2,
            Balcony: 1,
            Floor: 5,
            "Total Floors": 10,
            "Property Age": 5,
            Facing: "East",
            "Property Type": "Apartment",
            Furnishing: "Semi-Furnished"
          })
        }
      ]);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchWishlist(), fetchHistory()]).finally(() => setLoading(false));
  }, [email]);

  const handleRemoveWishlistItem = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setWishlist(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      setWishlist(prev => prev.filter(item => item.id !== id));
    }
  };

  const handlePrintPastReport = () => {
    if (!selectedReport) return;
    const originalTitle = document.title;
    document.title = `SmartPredict-AI-Past-Report-${selectedReport.city}-${selectedReport.location}`;
    window.print();
    document.title = originalTitle;
  };

  // Safe JSON extraction
  const getInputs = (item) => {
    if (item.inputs) return item.inputs;
    if (item.inputs_json) {
      try {
        return JSON.parse(item.inputs_json);
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      
      {/* Sidebar: Profile card details */}
      <div className="glass-card p-6 border border-slate-100 dark:border-slate-800 space-y-6 h-fit text-center lg:col-span-1">
        <div className="relative w-24 h-24 mx-auto rounded-full border-4 border-primary-600/10 flex items-center justify-center bg-slate-50 dark:bg-slate-900 shadow-md">
          <User className="w-12 h-12 text-primary-600" />
          <span className="absolute bottom-0 right-1.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{user?.name || "Premium User"}</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-extrabold uppercase text-[9px] mt-2 inline-block">
            {user?.role === 'admin' ? "System Administrator" : "Premium Investor"}
          </span>
        </div>

        <div className="text-xs text-left space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-6 font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Joined: July 2026</span>
          </div>
        </div>
      </div>

      {/* Main Tab Panel */}
      <div className="glass-card border border-slate-200/50 dark:border-slate-800/80 p-8 shadow-xl lg:col-span-3 space-y-8">
        
        {/* Navigation tabs */}
        <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800 pb-3 font-bold text-xs uppercase text-slate-400">
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'saved' ? 'border-primary-600 text-primary-600' : 'border-transparent hover:text-slate-600'}`}
          >
            Saved properties ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'history' ? 'border-primary-600 text-primary-600' : 'border-transparent hover:text-slate-600'}`}
          >
            Prediction History ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'settings' ? 'border-primary-600 text-primary-600' : 'border-transparent hover:text-slate-600'}`}
          >
            System Settings
          </button>
        </div>

        {/* Tab 1: Saved properties wishlist */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [1, 2].map(i => <div key={i} className="skeleton h-24 rounded-xl"></div>)
              ) : wishlist.length > 0 ? (
                wishlist.map((item, idx) => (
                  <motion.div
                    key={item.id || idx}
                    layout
                    className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 hover:border-slate-200 dark:hover:border-slate-800 hover:shadow-sm transition-all"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">
                        {item.bhk} BHK • {item.location}, {item.city}
                      </p>
                      <div className="text-xs font-extrabold text-primary-600 dark:text-primary-400 mt-1">
                        {item.formatted_price || formatINR(item.price)}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveWishlistItem(item.id)}
                      className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 hover:text-red-500 flex items-center justify-center shadow-sm cursor-pointer text-slate-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 font-light italic">
                  No properties saved to wishlist yet. Save property predictions to view them here.
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tab 2: Prediction history logs */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [1, 2].map(i => <div key={i} className="skeleton h-20 rounded-xl"></div>)
              ) : history.length > 0 ? (
                history.map((item, idx) => {
                  const inputs = getInputs(item);
                  return (
                    <motion.div
                      key={item.id || idx}
                      layout
                      onClick={() => setSelectedReport(item)}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 hover:border-primary-500/30 hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                            {inputs.BHK || item.bhk} BHK {inputs["Property Type"] || "Flat"} in {item.location}
                          </h4>
                          <span className="text-[10px] text-slate-400 block font-light">
                            {new Date(item.timestamp).toLocaleString()} • {item.algorithm || "Random Forest"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-800 dark:text-white">
                          {item.formatted_price || formatINR(item.predicted_price)}
                        </div>
                        <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">
                          Confidence: {item.confidence_score}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 font-light italic">
                  No prediction history logged yet. Run a valuation prediction first.
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tab 3: System Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6 text-xs max-w-xl">
            <h3 className="font-bold text-base flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-4">
              <Sliders className="w-4 h-4 text-primary-600" /> Account Preferences
            </h3>
            
            <div className="space-y-4">
              {[
                { label: "Notification alerts", desc: "Receive email summaries on trending micro-locations and appreciation triggers." },
                { label: "High-accuracy calculation mode", desc: "Allows models to compute broader ranges with minor iterations delay." },
                { label: "Strict Vastu layout checks", desc: "Default predictions highlight east-facing and vastu configurations." }
              ].map((cfg, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                  <input type="checkbox" defaultChecked={i === 1} className="w-4 h-4 accent-primary-600 cursor-pointer mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-white block">{cfg.label}</span>
                    <span className="text-[10px] text-slate-400 leading-relaxed font-light block">{cfg.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= REOPENED PAST VALUATION REPORT MODAL ================= */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 no-print">
          <div className="glass-card max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl relative space-y-6">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold">Valuation Report Log</h3>
                <span className="text-[10px] text-slate-400">Captured on: {new Date(selectedReport.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPastReport}
                  className="btn-gradient-primary py-2 px-4 rounded-xl text-[10px] flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> Save PDF
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="btn-outline py-2 px-4 rounded-xl text-[10px] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Property Type</span>
                  <span className="font-bold text-sm block mt-1">
                    {getInputs(selectedReport).BHK || selectedReport.bhk} BHK {getInputs(selectedReport)["Property Type"] || "Apartment"}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{selectedReport.location}, {selectedReport.city}</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">AI Estimate</span>
                  <span className="font-extrabold text-sm text-primary-600 dark:text-primary-400 block mt-1">
                    {selectedReport.formatted_price || formatINR(selectedReport.predicted_price)}
                  </span>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mt-0.5">
                    Confidence: {selectedReport.confidence_score}%
                  </span>
                </div>
              </div>

              {/* Specification Table */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Parameters Audited</span>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-semibold">
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-900 pb-1">
                    <span className="text-slate-400">Carpet Area:</span>
                    <span>{getInputs(selectedReport)["Carpet Area"] || selectedReport.carpet_area} SqFt</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-900 pb-1">
                    <span className="text-slate-400">Furnishing:</span>
                    <span>{getInputs(selectedReport).Furnishing || "Semi-Furnished"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-900 pb-1">
                    <span className="text-slate-400">Property Age:</span>
                    <span>{getInputs(selectedReport)["Property Age"] || 3} Years</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-900 pb-1">
                    <span className="text-slate-400">Facing:</span>
                    <span>{getInputs(selectedReport).Facing || "East"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-900 pb-1">
                    <span className="text-slate-400">Metro Proximity:</span>
                    <span>{getInputs(selectedReport)["Nearby Metro"] ? "Nearby (<1km)" : "Distant"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-900 pb-1">
                    <span className="text-slate-400">Regression Engine:</span>
                    <span>{selectedReport.algorithm || "Random Forest"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[10px] leading-relaxed font-light text-slate-500 dark:text-slate-400">
                This report confirms a valuation of {selectedReport.formatted_price || formatINR(selectedReport.predicted_price)} estimated using {selectedReport.algorithm || "Random Forest Regressor"} based on the property specifications recorded in {selectedReport.city}.
              </div>
            </div>

            {/* Hidden Printable frame inside the modal (Will only show during print) */}
            <div id="printable-valuation-report" className="print-only hidden">
              <style>{`
                @media print {
                  body * { visibility: hidden !important; }
                  #printable-valuation-report, #printable-valuation-report * {
                    visibility: visible !important;
                    display: block !important;
                  }
                  #printable-valuation-report {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    background: white !important;
                    color: black !important;
                    padding: 30px !important;
                  }
                  .print-table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin-top: 15px !important;
                  }
                  .print-table th, .print-table td {
                    border: 1px solid #cbd5e1 !important;
                    padding: 8px 12px !important;
                    text-align: left !important;
                    font-size: 11px !important;
                  }
                  .print-table th {
                    background-color: #f1f5f9 !important;
                    font-weight: bold !important;
                  }
                }
              `}</style>
              
              <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-6">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">SmartPredict AI Valuation Report</h1>
                  <p className="text-[10px] text-slate-500 font-light mt-0.5">Commercial-Grade Real Estate Asset Intelligence Platform</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-800 block">REPORT ID: SP-{Math.floor(100000 + Math.random() * 900000)}</span>
                  <span className="text-[9px] text-slate-400 block">{new Date(selectedReport.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Target Property</span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {getInputs(selectedReport).BHK || selectedReport.bhk} BHK {getInputs(selectedReport)["Property Type"] || "Apartment"}
                  </h3>
                  <p className="text-[10px] text-slate-600 font-medium">{selectedReport.location}, {selectedReport.city}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">AI Valuation Result</span>
                  <h3 className="text-base font-extrabold text-primary-600">
                    {selectedReport.formatted_price || formatINR(selectedReport.predicted_price)}
                  </h3>
                  <p className="text-[9px] text-slate-500">Carpet Area: {getInputs(selectedReport)["Carpet Area"] || selectedReport.carpet_area} SqFt</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">Specifications Audited</h4>
                <table className="print-table">
                  <tbody>
                    <tr>
                      <th>City</th>
                      <td>{selectedReport.city}</td>
                      <th>Location Neighborhood</th>
                      <td>{selectedReport.location}</td>
                    </tr>
                    <tr>
                      <th>Carpet Area</th>
                      <td>{getInputs(selectedReport)["Carpet Area"] || selectedReport.carpet_area} Sq Ft</td>
                      <th>BHK Configuration</th>
                      <td>{getInputs(selectedReport).BHK || selectedReport.bhk} BHK</td>
                    </tr>
                    <tr>
                      <th>Bathrooms</th>
                      <td>{getInputs(selectedReport).Bathrooms || 2}</td>
                      <th>Property Age</th>
                      <td>{getInputs(selectedReport)["Property Age"] || 3} Years</td>
                    </tr>
                    <tr>
                      <th>Furnishing Status</th>
                      <td>{getInputs(selectedReport).Furnishing || "Semi-Furnished"}</td>
                      <th>Facing Direction</th>
                      <td>{getInputs(selectedReport).Facing || "East"}</td>
                    </tr>
                    <tr>
                      <th>Metro Proximity</th>
                      <td>{getInputs(selectedReport)["Nearby Metro"] ? "Nearby (< 1km)" : "Distant"}</td>
                      <th>Confidence Score</th>
                      <td>{selectedReport.confidence_score}%</td>
                    </tr>
                    <tr>
                      <th>Regression Engine</th>
                      <td>{selectedReport.algorithm || "Random Forest"}</td>
                      <th>Reference Accuracy</th>
                      <td>R2 Score: 96.47%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">Asset Executive Summary</h4>
                <p className="text-[10px] text-slate-700 leading-relaxed font-light">
                  This {getInputs(selectedReport).BHK || selectedReport.bhk} BHK {getInputs(selectedReport)["Property Type"] || "Apartment"} in {selectedReport.location}, {selectedReport.city} features a carpet area of {getInputs(selectedReport)["Carpet Area"] || selectedReport.carpet_area} Sq Ft. The property is valued at {selectedReport.formatted_price || formatINR(selectedReport.predicted_price)} using the {selectedReport.algorithm || "Random Forest"} pipeline.
                </p>
              </div>

              <div className="text-[8px] text-slate-400 font-light leading-relaxed text-center border-t border-slate-200 pt-4 mt-6">
                Disclaimer: This valuation report is generated by a machine learning model based on historical transaction coefficients. Use this report for advisory investment analysis only.
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
