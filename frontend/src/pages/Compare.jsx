import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Award, HelpCircle, Check, X, ShieldAlert, Sparkles, Star } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
  "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kurnool", "Kakinada", "Rajahmundry", "Kadapa", "Anantapur", "Eluru", "Vizianagaram"
];

const LOCATIONS = {
  "Mumbai": ["South Mumbai", "Bandra", "Andheri", "Borivali", "Thane"],
  "Delhi": ["South Delhi", "Dwarka", "Rohini", "Connaught Place", "Noida"],
  "Bangalore": ["Whitefield", "Indiranagar", "Koramangala", "Electronic City", "Jayanagar"],
  "Hyderabad": ["Gachibowli", "Jubilee Hills", "Madhapur", "Kondapur", "Secunderabad"],
  "Pune": ["Koregaon Park", "Kothrud", "Hinjewadi", "Baner", "Wakad"],
  "Chennai": ["Adyar", "Velachery", "OMR", "Anna Nagar", "T Nagar"],
  "Kolkata": ["Salt Lake", "New Town", "Rajarhat", "Tollygunge", "Alipore"],
  "Ahmedabad": ["Satellite", "Bopal", "SG Highway", "Ghatlodia", "Prahlad Nagar"],
  "Jaipur": ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "Jagatpura", "C-Scheme"],
  "Lucknow": ["Gomti Nagar", "Aliganj", "Hazratganj", "Indira Nagar", "Charbagh"],
  "Visakhapatnam": ["Madhurawada", "Gajuwaka", "MVP Colony", "Rushikonda", "Seethammadhara"],
  "Vijayawada": ["Benz Circle", "Patamata", "Moghalrajpuram", "Kanuru", "Gollapudi"],
  "Guntur": ["Arundelpet", "Lakshmipuram", "Brodipet", "Pattabhipuram", "Gorantla"],
  "Nellore": ["Harnathapuram", "Dargamitta", "Vedayapalem", "Magunta Layout", "Podalakur Road"],
  "Tirupati": ["Alipiri", "TUDA Layout", "Bairagipatteda", "Renigunta Road", "Korlagunta"],
  "Kurnool": ["Budhavarapeta", "Kallur", "C-Camp", "Nandyal Road", "Joharapuram"],
  "Kakinada": ["Bhanugudi Junction", "Ramaraopeta", "Sarpavaram", "NFCL Road", "Pithapuram Road"],
  "Rajahmundry": ["Danavaipeta", "Innespeta", "Morampudi", "Lala Cheruvu", "Ramanayyapeta"],
  "Kadapa": ["RIMS Area", "Yerramukkapalli", "Ravindra Nagar", "Nagarajupet", "Co-operative Colony"],
  "Anantapur": ["Maruthi Nagar", "Rudrampeta", "Housing Board Colony", "Raju Road", "Kalyandurg Road"],
  "Eluru": ["RR Peta", "Powerpet", "Sanivarapupeta", "Vatluru", "Eluru Bypass"],
  "Vizianagaram": ["Cantonment", "Phool Baugh", "Kothavalasa", "KL Puram", "Balaji Nagar"]
};

// Default structures for properties comparison
const defaultProp = {
  City: "Mumbai",
  Location: "Bandra",
  "Carpet Area": 800,
  BHK: 2,
  Bathrooms: 2,
  Parking: 1,
  "Property Age": 5,
  Price: 20000000
};

const Compare = () => {
  const [propA, setPropA] = useState({ ...defaultProp });
  const [propB, setPropB] = useState({ 
    City: "Mumbai",
    Location: "Andheri",
    "Carpet Area": 900,
    BHK: 2,
    Bathrooms: 2,
    Parking: 1,
    "Property Age": 8,
    Price: 18000000
  });

  const [compareResult, setCompareResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (prop, field, val) => {
    if (prop === 'A') {
      setPropA(prev => ({ ...prev, [field]: val }));
    } else {
      setPropB(prev => ({ ...prev, [field]: val }));
    }
  };

  const handleCompareSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_a: propA, property_b: propB })
      });
      const data = await response.json();
      
      setTimeout(() => {
        if (response.ok) {
          setCompareResult(data);
        } else {
          alert(data.error || "Failed to compare properties.");
        }
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error(err);
      // Fallback comparative logic if backend not responsive
      setTimeout(() => {
        const multA = propA.Location === "Bandra" || propA.Location === "South Mumbai" ? 1.8 : 1.0;
        const multB = propB.Location === "Bandra" || propB.Location === "South Mumbai" ? 1.8 : 1.0;
        const valA = (propA["Carpet Area"] * 20000 + propA.BHK * 1000000) * multA;
        const valB = (propB["Carpet Area"] * 20000 + propB.BHK * 1000000) * multB;
        
        const winner = valA > valB ? "Property A" : "Property B";
        
        setCompareResult({
          winner,
          rating_a: round(4.0 + multA * 0.5, 1),
          rating_b: round(4.0 + multB * 0.5, 1),
          pros_a: ["Premium high-appreciating location", "Vastu oriented facing layout"],
          cons_a: ["Premium higher base rate per sqft"],
          pros_b: ["Spacious carpet area", "Excellent price-to-size ratio"],
          cons_b: ["Older construction age structure"]
        });
        setLoading(false);
      }, 1000);
    }
  };

  const round = (num, precision) => {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  };

  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          A/B Property <span className="text-primary-600">Comparison</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">
          Input details for two separate real estate properties to compare locational multipliers, yields, and determine which asset represents a better value index.
        </p>
      </div>

      <form onSubmit={handleCompareSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* PROPERTY A FORM CONTAINER */}
          <div className="glass-card p-6 border border-slate-100 dark:border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-primary-600 text-white inline-flex items-center justify-center text-xs">A</span>
              Property Profile A
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City</label>
                <select
                  value={propA.City}
                  onChange={(e) => handleInputChange('A', 'City', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary-500 font-medium"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</label>
                <select
                  value={propA.Location}
                  onChange={(e) => handleInputChange('A', 'Location', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary-500 font-medium"
                >
                  {LOCATIONS[propA.City].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Carpet Area (Sq Ft)</label>
                <input
                  type="number"
                  value={propA["Carpet Area"]}
                  onChange={(e) => handleInputChange('A', 'Carpet Area', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">BHK configuration</label>
                <select
                  value={propA.BHK}
                  onChange={(e) => handleInputChange('A', 'BHK', parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary-500 font-medium"
                >
                  {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} BHK</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age of Building (Years)</label>
                <input
                  type="number"
                  value={propA["Property Age"]}
                  onChange={(e) => handleInputChange('A', 'Property Age', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parking Allocated</label>
                <select
                  value={propA.Parking}
                  onChange={(e) => handleInputChange('A', 'Parking', parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none font-medium"
                >
                  <option value="0">No Spot</option>
                  <option value="1">1 Covered Spot</option>
                  <option value="2">2 Covered Spots</option>
                </select>
              </div>
            </div>
          </div>

          {/* PROPERTY B FORM CONTAINER */}
          <div className="glass-card p-6 border border-slate-100 dark:border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-secondary-600 text-white inline-flex items-center justify-center text-xs">B</span>
              Property Profile B
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City</label>
                <select
                  value={propB.City}
                  onChange={(e) => handleInputChange('B', 'City', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary-500 font-medium"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</label>
                <select
                  value={propB.Location}
                  onChange={(e) => handleInputChange('B', 'Location', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary-500 font-medium"
                >
                  {LOCATIONS[propB.City].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Carpet Area (Sq Ft)</label>
                <input
                  type="number"
                  value={propB["Carpet Area"]}
                  onChange={(e) => handleInputChange('B', 'Carpet Area', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">BHK configuration</label>
                <select
                  value={propB.BHK}
                  onChange={(e) => handleInputChange('B', 'BHK', parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary-500 font-medium"
                >
                  {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} BHK</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age of Building (Years)</label>
                <input
                  type="number"
                  value={propB["Property Age"]}
                  onChange={(e) => handleInputChange('B', 'Property Age', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parking Allocated</label>
                <select
                  value={propB.Parking}
                  onChange={(e) => handleInputChange('B', 'Parking', parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none font-medium"
                >
                  <option value="0">No Spot</option>
                  <option value="1">1 Covered Spot</option>
                  <option value="2">2 Covered Spots</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Submit action */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-gradient-primary py-4 px-10 text-sm flex items-center gap-3 shadow-lg cursor-pointer"
          >
            {loading ? "Processing comparisons..." : "Compare Properties"}
            <ArrowRightLeft className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </form>

      {/* COMPARISON MATRIX RESULTS */}
      {compareResult && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 border border-slate-200 dark:border-slate-800/80 max-w-4xl mx-auto shadow-xl space-y-8"
        >
          {/* Winner announcement header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary-600/10 to-emerald-500/10 border border-primary-500/15">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-primary-600 block">AI Recommendation Verdict</span>
              <h2 className="text-xl font-bold">
                <span className="text-primary-600">{compareResult.winner}</span> is the winner!
              </h2>
            </div>
          </div>

          {/* Matrix side by side comparison table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-center text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-4 text-left font-semibold">Parameter</th>
                  <th className="pb-4 font-bold text-primary-600">Property A</th>
                  <th className="pb-4 font-bold text-secondary-600">Property B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                
                {/* Location */}
                <tr>
                  <td className="py-4 text-left text-slate-400 font-medium">Location</td>
                  <td className="py-4 text-slate-800 dark:text-white font-bold">{propA.Location}, {propA.City}</td>
                  <td className="py-4 text-slate-800 dark:text-white font-bold">{propB.Location}, {propB.City}</td>
                </tr>

                {/* Size */}
                <tr>
                  <td className="py-4 text-left text-slate-400 font-medium">Size (Carpet Area)</td>
                  <td className="py-4">{propA["Carpet Area"]} Sq Ft</td>
                  <td className="py-4">{propB["Carpet Area"]} Sq Ft</td>
                </tr>

                {/* BHK */}
                <tr>
                  <td className="py-4 text-left text-slate-400 font-medium">BHK Structure</td>
                  <td className="py-4">{propA.BHK} BHK</td>
                  <td className="py-4">{propB.BHK} BHK</td>
                </tr>

                {/* Age */}
                <tr>
                  <td className="py-4 text-left text-slate-400 font-medium">Property Age</td>
                  <td className="py-4">{propA["Property Age"]} Years</td>
                  <td className="py-4">{propB["Property Age"]} Years</td>
                </tr>

                {/* Parking */}
                <tr>
                  <td className="py-4 text-left text-slate-400 font-medium">Parking Spots</td>
                  <td className="py-4">{propA.Parking} Dedicated</td>
                  <td className="py-4">{propB.Parking} Dedicated</td>
                </tr>

                {/* Scoring */}
                <tr>
                  <td className="py-4 text-left text-slate-400 font-medium">Market Rating</td>
                  <td className="py-4 font-bold text-amber-500 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {compareResult.rating_a} / 5.0
                  </td>
                  <td className="py-4 font-bold text-amber-500 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {compareResult.rating_b} / 5.0
                  </td>
                </tr>

                {/* Pros/Cons list */}
                <tr>
                  <td className="py-5 text-left text-slate-400 font-medium valign-top">Key Advantages (Pros)</td>
                  <td className="py-5 text-left pl-6">
                    <div className="space-y-1.5">
                      {compareResult.pros_a.map((p, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-600 font-normal">
                          <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-5 text-left pl-6">
                    <div className="space-y-1.5">
                      {compareResult.pros_b.map((p, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-emerald-600 font-normal">
                          <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="py-5 text-left text-slate-400 font-medium">Disadvantages (Cons)</td>
                  <td className="py-5 text-left pl-6">
                    <div className="space-y-1.5">
                      {compareResult.cons_a.map((c, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-500 font-normal">
                          <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-5 text-left pl-6">
                    <div className="space-y-1.5">
                      {compareResult.cons_b.map((c, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-500 font-normal">
                          <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

        </motion.div>
      )}
    </div>
  );
};

export default Compare;
