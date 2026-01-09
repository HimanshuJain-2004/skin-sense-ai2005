import { motion } from "framer-motion";
import { Brain, TrendingUp, AlertTriangle, Heart, Sparkles } from "lucide-react";

interface AISummaryProps {
  overallScore: number;
  skinType: string;
  isLocked?: boolean;
}

const AISummary = ({ overallScore, skinType, isLocked = false }: AISummaryProps) => {
  // Generate dynamic summary based on score
  const getImprovements = () => {
    if (overallScore >= 70) {
      return [
        "Hydration levels are well-maintained",
        "Good elasticity indicates healthy collagen",
        "Minimal signs of UV damage",
      ];
    } else if (overallScore >= 50) {
      return [
        "Some areas show good moisture retention",
        "Skin barrier is functioning adequately",
        "Natural oil balance is improving",
      ];
    }
    return [
      "Focus areas have been identified for improvement",
      "Basic skin care routine is showing initial results",
    ];
  };

  const getWarnings = () => {
    if (overallScore < 50) {
      return [
        "Consider increasing water intake for better hydration",
        "Sun protection may need to be more consistent",
      ];
    } else if (overallScore < 70) {
      return [
        "Some areas may benefit from extra attention",
        "Consider adjusting product routine for better results",
      ];
    }
    return ["Continue current routine for maintenance"];
  };

  const getEncouragement = () => {
    if (overallScore >= 70) {
      return "Your skin is looking great! Keep up the excellent work with your skincare routine. Consistency is key to maintaining these results.";
    } else if (overallScore >= 50) {
      return "You're on the right track! With a few adjustments to your routine, you'll see noticeable improvements. Every step counts toward healthier skin.";
    }
    return "Every skincare journey starts somewhere. Focus on the basics—cleanse, moisturize, protect—and you'll see progress. Be patient and kind to your skin!";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 ${isLocked ? "relative overflow-hidden" : ""}`}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-card/80 backdrop-blur-md z-10 flex flex-col items-center justify-center rounded-2xl">
          <Brain className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground font-medium">
            Upgrade for AI Summary
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">
            AI Analysis Summary
          </h3>
          <p className="text-sm text-muted-foreground">
            Personalized insights for {skinType} skin
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Improvements */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <h4 className="font-medium text-foreground">What's Going Well</h4>
          </div>
          <ul className="space-y-2">
            {getImprovements().map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Warnings (non-medical) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-gold" />
            <h4 className="font-medium text-foreground">Areas to Watch</h4>
          </div>
          <ul className="space-y-2">
            {getWarnings().map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-2" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Encouragement */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              {getEncouragement()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AISummary;
