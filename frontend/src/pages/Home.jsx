import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Compass, Sliders, Activity, Shield, 
  ChevronRight, Brain, Zap, CheckCircle, Calculator, MapPin, 
  ArrowRight, BookOpen, MessageSquare, PlusCircle
} from 'lucide-react';

const statsData = [
  { label: 'Properties Evaluated', value: 24500, suffix: '+' },
  { label: 'Major Cities covered', value: 5, suffix: '' },
  { label: 'AI Predictions Made', value: 12400, suffix: '+' },
  { label: 'Model Accuracy Rate', value: 96.4, suffix: '%' },
  { label: 'Satisfied Investors', value: 98.7, suffix: '%' },
];

const features = [
  {
    icon: Brain,
    title: "AI Property Valuation",
    desc: "Estimate property valuations instantaneously with confidence intervals trained on historical real estate metrics.",
    color: "from-blue-500 to-indigo-600"
  },
  {
    icon: Compass,
    title: "Property Recommendation",
    desc: "Discover matching real estate investment assets optimized for high potential yields and localized appreciation.",
    color: "from-emerald-400 to-teal-500"
  },
  {
    icon: Sliders,
    title: "A/B Property Comparison",
    desc: "Compare two properties side-by-side on prices, locational ratings, nearby infrastructure, and projected yields.",
    color: "from-orange-400 to-amber-500"
  },
  {
    icon: TrendingUp,
    title: "Future Appreciation Forecast",
    desc: "View 1, 3, 5, and 10-year appreciation projections dynamically matching regional infrastructure growths.",
    color: "from-violet-500 to-purple-600"
  },
  {
    icon: Calculator,
    title: "Interactive EMI Calculator",
    desc: "Evaluate loan interest schedules, down-payment limits, and monthly payments with clean analytical charts.",
    color: "from-pink-500 to-rose-600"
  },
  {
    icon: MapPin,
    title: "Location Intelligence Map",
    desc: "Assess locations based on walking distances to key schools, hospitals, transit terminals, and shopping hubs.",
    color: "from-cyan-500 to-blue-600"
  },
  {
    icon: Activity,
    title: "Market Trends Analysis",
    desc: "Track pricing trends, city benchmarks, and demand/supply scores on dynamic graphing modules.",
    color: "from-amber-500 to-orange-600"
  },
  {
    icon: Shield,
    title: "Investment Quality Auditing",
    desc: "Analyze safety margins and volatility scores, and receive an automated 'Buy/Hold/Sell' market rating.",
    color: "from-teal-500 to-emerald-600"
  }
];

const benefits = [
  { icon: CheckCircle, title: "High Accuracy", text: "Trained on 5,000+ realistic transaction files using robust machine learning models." },
  { icon: Brain, title: "AI-Powered Decisions", text: "Removes subjective bias by evaluating 25+ parameters concurrently." },
  { icon: Zap, title: "Real-Time Insights", text: "Instantaneous predictions with immediate neighborhood transit profiling." },
  { icon: Activity, title: "Fast Execution", text: "Responsive pipelines deliver investment predictions in under 2 seconds." },
  { icon: Shield, title: "Trusted Analytics", text: "Backed by mathematical metrics including R2 scores, mean absolute errors, and yields." },
  { icon: Sliders, title: "Interactive Dashboards", text: "Clean, visual charts outlining long-term valuations, loans, and comparisons." }
];

const timelineSteps = [
  { step: "01", title: "Select Target City", desc: "Filter across top metropolitan growth corridors (Mumbai, Delhi, Bangalore, Hyderabad, Pune)." },
  { step: "02", title: "Specify Neighborhood Location", desc: "Pinpoint the exact micro-market zone to apply localized compounding multipliers." },
  { step: "03", title: "Enter Asset Details", desc: "Input 20+ parameters including carpet area, BHK, balconies, age, amenities, and floor levels." },
  { step: "04", title: "Run Machine Learning Inference", desc: "AI pipeline executes Random Forest and XGBoost regressions and estimates confidence scoring." },
  { step: "05", title: "Review Recommendations & ROI", desc: "Inspect neighborhood transit maps, EMI plans, appreciation curves, and similar listings." }
];

const CountUp = ({ end, suffix }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const Home = ({ user }) => {
  const navigate = useNavigate();

  // Unified CTA Handler
  const handleGetStarted = () => {
    if (user) {
      navigate('/predict');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="space-y-24 grid-bg pb-12">
      
      {/* Hero / Central Dashboard Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80" 
            alt="Luxury Apartments Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] bg-gradient-to-tr from-slate-950 via-slate-950/85 to-transparent"></div>
        </div>

        {/* Content Panel */}
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8 py-20 w-full">
          
          {!user ? (
            // ================= GUEST HERO VIEW =================
            <div className="space-y-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 font-semibold text-xs tracking-wider uppercase backdrop-blur-sm mx-auto"
              >
                <Brain className="w-4 h-4 animate-bounce" /> SmartPredict AI Real-Estate System
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight"
              >
                Predict Smarter. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-400 to-accent-400">Invest Better.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-2xl mx-auto text-sm md:text-base text-slate-300 font-light leading-relaxed"
              >
                Use Artificial Intelligence to estimate accurate property prices, compare houses, discover investment opportunities and receive intelligent recommendations.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-4 pt-4"
              >
                <button 
                  onClick={handleGetStarted}
                  className="btn-gradient-primary flex items-center gap-2 group cursor-pointer shadow-lg"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="btn-outline border-white/20 text-white hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  Learn More
                </button>
              </motion.div>
            </div>
          ) : (
            // ================= LOGGED IN CENTRAL DASHBOARD VIEW =================
            <div className="space-y-8 w-full max-w-5xl mx-auto">
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm"
                >
                  Verified Session: {user.role === 'admin' ? 'Administrator' : 'Premium Account'}
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">{user.name}</span>
                </h1>
                <p className="text-xs text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
                  Welcome to your Central Intelligence Hub. Click on any of the core dashboard portals below to perform valuations, comparatives, or retrains.
                </p>
              </div>

              {/* 6 Grid Dashboard Portals */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {[
                  {
                    icon: Brain,
                    title: "Property Price Prediction",
                    desc: "Configure 20+ variables (carpet area, BHK, age, transit levels) to estimate market pricing values.",
                    path: "/predict",
                    color: "border-primary-500/20 bg-primary-600/15 text-primary-400"
                  },
                  {
                    icon: Compass,
                    title: "AI Property Recommendation",
                    desc: "Explore investment-grade properties sorted by highest CAGR yields and connectivity metrics.",
                    path: "/recommendations",
                    color: "border-emerald-500/20 bg-emerald-600/15 text-emerald-400"
                  },
                  {
                    icon: Sliders,
                    title: "Compare Properties Matrix",
                    desc: "Perform side-by-side A/B comparisons to evaluate pros, cons, ratings, and determine layout winners.",
                    path: "/compare",
                    color: "border-orange-500/20 bg-orange-600/15 text-orange-400"
                  },
                  {
                    icon: TrendingUp,
                    title: "Market Analytics Dashboard",
                    desc: "Examine neighborhood price schedules, supply-demand curves, and localized benchmarks.",
                    path: "/analytics",
                    color: "border-violet-500/20 bg-violet-600/15 text-violet-400"
                  },
                  {
                    icon: BookOpen,
                    title: "System Pipeline Pipeline",
                    desc: "Review Random Forest/XGBoost preprocessing, standard scaling, and R2 scoring details.",
                    path: "/about",
                    color: "border-cyan-500/20 bg-cyan-600/15 text-cyan-400"
                  },
                  {
                    icon: MessageSquare,
                    title: "Help & Contact Support",
                    desc: "FAQ accordions and interactive contact forms to submit inquiries directly to our system database.",
                    path: "/about", // Redirect to contact
                    color: "border-pink-500/20 bg-pink-600/15 text-pink-400"
                  }
                ].map((portal, idx) => {
                  const Icon = portal.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03, y: -4 }}
                      onClick={() => navigate(portal.path)}
                      className={`glass-card p-6 border ${portal.color} text-left cursor-pointer transition-all duration-300 shadow-lg flex flex-col justify-between h-48`}
                    >
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center text-white border border-white/10">
                          <Icon className="w-5.5 h-5.5" />
                        </div>
                        <h3 className="font-bold text-sm text-white">{portal.title}</h3>
                        <p className="text-[10px] text-slate-300 font-light leading-normal">{portal.desc}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider self-end mt-4 text-white opacity-60 hover:opacity-100 transition-opacity">
                        Enter Portal <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pt-16 max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-6 rounded-2xl bg-white/5 dark:bg-slate-900/40 backdrop-blur-md border border-white/10 dark:border-slate-800/40">
              {statsData.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl md:text-3xl font-extrabold text-white">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Intelligent <span className="text-primary-600 dark:text-primary-400">Decision-Making Engines</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">
            Empower your financial property purchases with analytics dashboards configured to map real estate market dynamics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="glass-card p-6 flex flex-col justify-between border border-slate-100 dark:border-slate-800/50 hover:border-primary-500/20 dark:hover:border-primary-500/10 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feat.color} text-white shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold">{feat.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Commercial-Grade <span className="text-secondary-500">System Pipeline</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">
              Our framework provides mathematically backed predictions and comparative indexes to guide investments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center text-secondary-600 dark:text-secondary-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base">{benefit.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">{benefit.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            How The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">AI Valuation Operates</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base font-light">
            Go from search city selection to multi-parametric regression results in five simple, structured processes.
          </p>
        </div>

        {/* Animated Timeline */}
        <div className="relative pt-6 max-w-5xl mx-auto">
          {/* Vertical line connector (desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-secondary-500 to-accent-500 -translate-x-1/2"></div>
          
          <div className="space-y-12 md:space-y-16">
            {timelineSteps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 text-center md:text-left ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Content Box */}
                <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                  <div className={`glass-card p-6 border border-slate-100 dark:border-slate-800/80 shadow-md max-w-md w-full relative ${idx % 2 === 1 ? 'md:text-left' : 'md:text-right'}`}>
                    <span className="text-4xl font-extrabold text-slate-200 dark:text-slate-800 block mb-2">{step.step}</span>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>

                {/* Badge Center */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-900 text-white border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center z-10 font-bold text-xs">
                  {step.step}
                </div>

                {/* Placeholder column to balance the grid layout */}
                <div className="hidden md:block w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;
