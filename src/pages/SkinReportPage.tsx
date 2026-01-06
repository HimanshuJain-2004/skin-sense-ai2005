import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Lock, 
  Sparkles, 
  Droplets, 
  Sun, 
  Moon, 
  AlertCircle, 
  TrendingUp,
  CheckCircle2,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Mock analysis data
const mockAnalysis = {
  overallScore: 72,
  skinType: "Combination",
  concerns: [
    { 
      name: "Acne", 
      score: 35, 
      level: "Moderate",
      description: "Some active breakouts detected on T-zone area.",
      icon: AlertCircle,
      locked: false 
    },
    { 
      name: "Pigmentation", 
      score: 45, 
      level: "Mild",
      description: "Minor dark spots visible around cheek area.",
      icon: Sun,
      locked: false 
    },
    { 
      name: "Wrinkles", 
      score: 20, 
      level: "Low",
      description: "Minimal fine lines detected around eyes.",
      icon: TrendingUp,
      locked: true 
    },
    { 
      name: "Dark Circles", 
      score: 55, 
      level: "Moderate",
      description: "Noticeable darkness under eye area.",
      icon: Moon,
      locked: true 
    },
    { 
      name: "Hydration", 
      score: 65, 
      level: "Good",
      description: "Skin hydration levels are within normal range.",
      icon: Droplets,
      locked: true 
    },
    { 
      name: "Elasticity", 
      score: 78, 
      level: "Excellent",
      description: "Skin shows good firmness and bounce.",
      icon: Sparkles,
      locked: true 
    },
  ],
};

const SkinReportPage = () => {
  const [isSubscribed] = useState(false);
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-secondary";
    if (score >= 40) return "text-gold";
    return "text-primary";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 70) return "from-secondary to-teal-medium";
    if (score >= 40) return "from-gold to-accent";
    return "from-primary to-accent";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <CheckCircle2 className="w-4 h-4" />
              Analysis Complete
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your Skin Report
            </h1>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
              Here's a comprehensive analysis of your skin health. 
              Unlock full insights to see personalized recommendations.
            </p>
          </motion.div>

          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-md mx-auto mb-12"
          >
            <div className="glass-card p-8 text-center">
              <h3 className="font-display text-lg text-muted-foreground mb-4">Overall Skin Health</h3>
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted/30"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#scoreGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${mockAnalysis.overallScore * 4.4} 440`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-5xl font-bold text-foreground">
                    {mockAnalysis.overallScore}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10">
                <span className="text-secondary font-medium">Skin Type:</span>
                <span className="text-foreground font-semibold">{mockAnalysis.skinType}</span>
              </div>
            </div>
          </motion.div>

          {/* Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {mockAnalysis.concerns.map((concern, index) => (
              <motion.div
                key={concern.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                className="relative"
              >
                <div className={`glass-card p-6 h-full ${concern.locked && !isSubscribed ? "overflow-hidden" : ""}`}>
                  {/* Locked Overlay */}
                  {concern.locked && !isSubscribed && (
                    <div className="absolute inset-0 bg-card/80 backdrop-blur-md z-10 flex flex-col items-center justify-center rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">Premium Content</p>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getScoreBarColor(concern.score)} flex items-center justify-center`}>
                        <concern.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-foreground">{concern.name}</h4>
                        <span className={`text-sm font-medium ${getScoreColor(concern.score)}`}>
                          {concern.level}
                        </span>
                      </div>
                    </div>
                    <span className={`font-display text-2xl font-bold ${getScoreColor(concern.score)}`}>
                      {concern.score}
                    </span>
                  </div>
                  
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${concern.score}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${getScoreBarColor(concern.score)} rounded-full`}
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground font-body">
                    {concern.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Unlock CTA */}
          {!isSubscribed && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-card p-8 text-center border-2 border-primary/20 shadow-glow">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Crown className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  Unlock Your Full Report
                </h3>
                <p className="text-muted-foreground font-body mb-6 max-w-md mx-auto">
                  Get complete skin analysis, personalized remedies, daily routines, 
                  and ingredient recommendations tailored for your skin.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="lg" onClick={() => navigate("/subscription")}>
                    <Sparkles className="w-5 h-5" />
                    Upgrade to Premium
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate("/#pricing")}>
                    View Plans
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SkinReportPage;
