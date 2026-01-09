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
  Crown,
  Eye,
  Fingerprint,
  Wind,
  Thermometer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useSubscription } from "@/hooks/useSubscription";
import RoutineRecommender from "@/components/report/RoutineRecommender";
import AISummary from "@/components/report/AISummary";
import DailyLimitBanner from "@/components/report/DailyLimitBanner";

// Mock analysis data - 15 parameters
const mockAnalysis = {
  overallScore: 72,
  skinType: "Combination",
  scansToday: 2,
  maxScansPerDay: 5,
  concerns: [
    { 
      name: "Acne", 
      score: 35, 
      level: "Moderate",
      description: "Some active breakouts detected on T-zone area. Consider salicylic acid treatment.",
      icon: AlertCircle,
      locked: false 
    },
    { 
      name: "Pigmentation", 
      score: 45, 
      level: "Mild",
      description: "Minor dark spots visible around cheek area. Vitamin C can help.",
      icon: Sun,
      locked: false 
    },
    { 
      name: "Wrinkles", 
      score: 85, 
      level: "Low",
      description: "Minimal fine lines detected. Great skin elasticity for your age.",
      icon: TrendingUp,
      locked: false 
    },
    { 
      name: "Dark Circles", 
      score: 55, 
      level: "Moderate",
      description: "Noticeable darkness under eye area. May indicate need for more sleep.",
      icon: Moon,
      locked: true 
    },
    { 
      name: "Hydration", 
      score: 65, 
      level: "Good",
      description: "Skin hydration levels are within normal range. Keep drinking water!",
      icon: Droplets,
      locked: true 
    },
    { 
      name: "Elasticity", 
      score: 78, 
      level: "Excellent",
      description: "Skin shows good firmness and bounce. Collagen production is healthy.",
      icon: Sparkles,
      locked: true 
    },
    { 
      name: "Pore Size", 
      score: 60, 
      level: "Moderate",
      description: "Some enlarged pores on nose and cheeks. Niacinamide can help minimize.",
      icon: Eye,
      locked: true 
    },
    { 
      name: "Texture", 
      score: 70, 
      level: "Good",
      description: "Mostly smooth with minor rough patches. Regular exfoliation recommended.",
      icon: Fingerprint,
      locked: true 
    },
    { 
      name: "Redness", 
      score: 75, 
      level: "Low",
      description: "Minimal redness detected. Skin barrier appears healthy.",
      icon: Thermometer,
      locked: true 
    },
    { 
      name: "Oil Balance", 
      score: 50, 
      level: "Moderate",
      description: "T-zone shows excess oil, cheeks are normal. Classic combination skin.",
      icon: Wind,
      locked: true 
    },
  ],
};

const SkinReportPage = () => {
  const { hasActiveSubscription, loading } = useSubscription();
  const navigate = useNavigate();
  const isSubscribed = hasActiveSubscription;
  
  // For free users, only show 30-40% of analysis (first 3-4 cards unlocked)
  const freeVisibleCards = 3;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-secondary";
    if (score >= 40) return "text-gold";
    return "text-destructive";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 70) return "bg-secondary";
    if (score >= 40) return "bg-gold";
    return "bg-destructive";
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "Excellent":
      case "Low":
        return "bg-secondary/10 text-secondary";
      case "Good":
        return "bg-primary/10 text-primary";
      case "Moderate":
        return "bg-gold/10 text-gold";
      default:
        return "bg-destructive/10 text-destructive";
    }
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
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <CheckCircle2 className="w-4 h-4" />
              Analysis Complete
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your Skin Report
            </h1>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
              {isSubscribed 
                ? "Here's your comprehensive 15-parameter skin analysis with personalized recommendations."
                : "Unlock full insights to see all 15 parameters and personalized recommendations."
              }
            </p>
          </motion.div>

          {/* Daily Limit Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <DailyLimitBanner 
              scansToday={mockAnalysis.scansToday} 
              maxScans={mockAnalysis.maxScansPerDay} 
            />
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
                      <stop offset="100%" stopColor="hsl(var(--secondary))" />
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                <span className="text-primary font-medium">Skin Type:</span>
                <span className="text-foreground font-semibold">{mockAnalysis.skinType}</span>
              </div>
            </div>
          </motion.div>

          {/* Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {mockAnalysis.concerns.map((concern, index) => {
              const isLocked = !isSubscribed && index >= freeVisibleCards;
              
              return (
                <motion.div
                  key={concern.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                  className="relative"
                >
                  <div className={`glass-card p-6 h-full ${isLocked ? "overflow-hidden" : ""}`}>
                    {/* Locked Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-card/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">Premium Content</p>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${getScoreBarColor(concern.score)} flex items-center justify-center`}>
                          <concern.icon className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-display font-semibold text-foreground">{concern.name}</h4>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(concern.level)}`}>
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
                        transition={{ duration: 1, delay: 0.5 + index * 0.05 }}
                        className={`h-full ${getScoreBarColor(concern.score)} rounded-full`}
                      />
                    </div>
                    
                    <p className="text-sm text-muted-foreground font-body">
                      {concern.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AI Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <AISummary 
              overallScore={mockAnalysis.overallScore}
              skinType={mockAnalysis.skinType}
              isLocked={!isSubscribed}
            />
          </motion.div>

          {/* Routine Recommender */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
              Your Personalized Routine
            </h2>
            <RoutineRecommender isLocked={!isSubscribed} />
          </motion.div>

          {/* Unlock CTA */}
          {!isSubscribed && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-card p-8 text-center border-2 border-primary/20">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary flex items-center justify-center">
                  <Crown className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  Unlock Your Full Report
                </h3>
                <p className="text-muted-foreground font-body mb-6 max-w-md mx-auto">
                  Get complete 15-parameter analysis, AI insights, personalized routines, 
                  and daily tracking to transform your skin.
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
