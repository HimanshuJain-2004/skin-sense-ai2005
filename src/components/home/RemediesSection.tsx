import { motion } from "framer-motion";
import { 
  Droplets, 
  Leaf, 
  Sun as SunIcon, 
  Moon, 
  Sparkles, 
  Heart,
  Coffee,
  Apple
} from "lucide-react";

interface RemediesSectionProps {
  isLocked?: boolean;
}

const remedies = [
  {
    category: "Morning Routine",
    icon: SunIcon,
    color: "from-gold to-accent",
    tips: [
      "Gentle cleanser to remove overnight oil buildup",
      "Vitamin C serum for brightening and protection",
      "Lightweight moisturizer with SPF 30+",
      "Don't skip sunscreen even on cloudy days",
    ],
  },
  {
    category: "Evening Routine",
    icon: Moon,
    color: "from-primary to-rose-medium",
    tips: [
      "Double cleanse to remove makeup and sunscreen",
      "Apply retinol or niacinamide serum",
      "Rich night cream for overnight repair",
      "Use a silk pillowcase to reduce friction",
    ],
  },
  {
    category: "Hydration Tips",
    icon: Droplets,
    color: "from-secondary to-teal-medium",
    tips: [
      "Drink at least 8 glasses of water daily",
      "Use a humidifier in dry environments",
      "Apply hyaluronic acid on damp skin",
      "Mist face throughout the day",
    ],
  },
  {
    category: "Lifestyle Habits",
    icon: Heart,
    color: "from-accent to-gold",
    tips: [
      "Get 7-8 hours of quality sleep",
      "Reduce stress with meditation or yoga",
      "Exercise regularly for better circulation",
      "Avoid touching your face frequently",
    ],
  },
];

const ingredients = [
  { name: "Niacinamide", benefit: "Reduces pores & controls oil", icon: Leaf },
  { name: "Hyaluronic Acid", benefit: "Deep hydration & plumping", icon: Droplets },
  { name: "Vitamin C", benefit: "Brightening & antioxidant", icon: SunIcon },
  { name: "Retinol", benefit: "Anti-aging & cell renewal", icon: Sparkles },
];

const foods = [
  { name: "Avocados", benefit: "Healthy fats for skin barrier" },
  { name: "Green Tea", benefit: "Antioxidants & anti-inflammatory" },
  { name: "Berries", benefit: "Vitamin C & collagen support" },
  { name: "Fatty Fish", benefit: "Omega-3 for moisture retention" },
];

const RemediesSection = ({ isLocked = false }: RemediesSectionProps) => {
  return (
    <section className="section-padding bg-gradient-to-b from-background to-rose-light/20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            Personalized Care
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Skincare Remedies
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Based on your skin analysis, here are personalized recommendations 
            to help you achieve your best skin.
          </p>
        </motion.div>

        {/* Routine Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {remedies.map((remedy, index) => (
            <motion.div
              key={remedy.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-6 hover-lift"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${remedy.color} flex items-center justify-center`}>
                  <remedy.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {remedy.category}
                </h3>
              </div>
              <ul className="space-y-3">
                {remedy.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground font-body">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Ingredients */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="font-display text-2xl font-bold text-foreground text-center mb-8">
            Recommended Ingredients
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ingredients.map((ingredient, index) => (
              <div
                key={ingredient.name}
                className="glass-card p-5 text-center hover-lift"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <ingredient.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-foreground mb-1">
                  {ingredient.name}
                </h4>
                <p className="text-sm text-muted-foreground font-body">
                  {ingredient.benefit}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Foods */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="glass-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-teal-medium flex items-center justify-center">
                <Apple className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Skin-Loving Foods
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add these to your diet for radiant skin
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {foods.map((food) => (
                <div
                  key={food.name}
                  className="p-4 rounded-xl bg-muted/50 text-center"
                >
                  <p className="font-semibold text-foreground mb-1">{food.name}</p>
                  <p className="text-xs text-muted-foreground">{food.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RemediesSection;
