import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, MapPin, Building, Star, Award, Heart, Check, Trash } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';




const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
  "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kurnool", "Kakinada", "Rajahmundry", "Kadapa", "Anantapur", "Eluru", "Vizianagaram"
];

const formatINR = (value) => {
  if (value >= 10000000) return `₹ ${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹ ${(value / 100000).toFixed(2)} L`;
  return `₹ ${value.toLocaleString('en-IN')}`;
};

const Recommendations = () => {
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [selectedBhk, setSelectedBhk] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tracking saved statuses local states to give micro feedback
  const [savedPropIds, setSavedPropIds] = useState(new Set());

  const fetchRecommendations = async () => {
    setLoading(true);
    let url = `${API_URL}/api/recommendations?city=${selectedCity}`;
    if (selectedBhk) url += `&bhk=${selectedBhk}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setRecommendations(data);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.warn("Backend recommendations offline. Rendering localized mock recommended properties.");
      // Local fallbacks
      const mockRecs = [
        {
          id: "rec_0",
          title: `Luxury 3 BHK Penthouse in Bandra`,
          price: 65000000,
          formatted_price: formatINR(65000000),
          location: "Bandra",
          city: "Mumbai",
          bhk: 3,
          bathrooms: 3,
          rating: 4.9,
          investment_score: 9.6,
          growth_rate: "+12.4% YoY",
          image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
          reason: "Growing area with close proximity to Bandra-Kurla Complex commercial business hubs and upcoming metro."
        },
        {
          id: "rec_1",
          title: `Premium 2 BHK Apartment in Andheri`,
          price: 24000000,
          formatted_price: formatINR(24000000),
          location: "Andheri",
          city: "Mumbai",
          bhk: 2,
          bathrooms: 2,
          rating: 4.6,
          investment_score: 8.8,
          growth_rate: "+9.2% YoY",
          image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
          reason: "High tenant demand due to proximity to corporate offices, metro connectivity, and schools."
        },
        {
          id: "rec_2",
          title: `Spacious 4 BHK Villa in South Mumbai`,
          price: 185000000,
          formatted_price: formatINR(185000000),
          location: "South Mumbai",
          city: "Mumbai",
          bhk: 4,
          bathrooms: 4,
          rating: 4.8,
          investment_score: 9.2,
          growth_rate: "+14.8% YoY",
          image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
          reason: "Rare premium residential villa asset representing high scarcity value in Mumbai prime core land."
        }
      ];
      
      // Filter BHK locally if specified
      const filtered = selectedBhk 
        ? mockRecs.filter(r => r.bhk === parseInt(selectedBhk))
        : mockRecs;
        
      setRecommendations(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCity, selectedBhk]);

  const handleSaveToProfile = async (item) => {
    setSavedPropIds(prev => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });

    try {
      await fetch(`${API_URL}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: "user@smartpredict.ai",
          title: item.title,
          price: item.price,
          location: item.location,
          city: item.city,
          bhk: item.bhk,
          bathrooms: item.bathrooms,
          rating: item.rating,
          image_url: item.image_url
        })
      });
      alert(`"${item.title}" successfully added to saved properties wishlist.`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          AI Property <span className="text-primary-600">Recommendations</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">
          Review top-rated properties in core metropolitan sectors. Our valuation models analyze pricing indexes and transit routes to select high-ROI residential acquisitions.
        </p>
      </div>

      {/* Filters toolbar */}
      <div className="glass-card p-5 max-w-3xl mx-auto border border-slate-200/50 dark:border-slate-800/80 shadow-md flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase">
          <Compass className="w-4 h-4 text-primary-600 animate-pulse" /> Filters
        </div>
        
        <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
          {/* City */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <span className="text-[10px] uppercase font-bold text-slate-400">City</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500 font-semibold"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* BHK */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <span className="text-[10px] uppercase font-bold text-slate-400">BHK</span>
            <select
              value={selectedBhk}
              onChange={(e) => setSelectedBhk(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500 font-semibold"
            >
              <option value="">All configurations</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards list */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            // Skeleton loadings
            [1, 2, 3].map(i => (
              <div key={i} className="glass-card h-96 overflow-hidden border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="skeleton h-48 w-full"></div>
                <div className="p-6 space-y-3">
                  <div className="skeleton h-6 w-3/4 rounded"></div>
                  <div className="skeleton h-4 w-1/2 rounded"></div>
                  <div className="skeleton h-12 w-full rounded-xl"></div>
                </div>
              </div>
            ))
          ) : recommendations.length > 0 ? (
            recommendations.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -6 }}
                className="glass-card overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo container */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
                    <span className="bg-primary-600 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                      <Award className="w-3 h-3" /> Score {item.investment_score}/10
                    </span>
                    <span className="bg-emerald-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
                      {item.growth_rate}
                    </span>
                  </div>
                </div>

                {/* Info block */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-slate-800 dark:text-white leading-tight text-base">{item.title}</h3>
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {item.rating}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}</span>
                      <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-slate-400" /> {item.bhk} BHK</span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      <span className="font-bold text-primary-600 dark:text-primary-400 block mb-0.5">AI Analysis:</span>
                      {item.reason}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block font-bold leading-none">Valuation</span>
                      <span className="text-base font-extrabold text-slate-800 dark:text-white leading-none">{item.formatted_price}</span>
                    </div>

                    <button
                      onClick={() => handleSaveToProfile(item)}
                      disabled={savedPropIds.has(item.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shadow transition-all active:scale-90 cursor-pointer ${
                        savedPropIds.has(item.id)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-red-500'
                      }`}
                    >
                      {savedPropIds.has(item.id) ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center glass-card border border-slate-200/50 dark:border-slate-800/80 p-8">
              <Compass className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-bold">No properties recommended</h3>
              <p className="text-slate-400 text-xs font-light mt-1">Try expanding your search parameters or choosing a different city.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Recommendations;
