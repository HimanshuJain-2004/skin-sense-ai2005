import { motion } from "framer-motion";
import { Scan, Shield, Zap, Heart, Sparkles, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "AI Skin Analysis",
    description: "Advanced machine learning algorithms analyze your skin with clinical accuracy.",
    color: "from-primary to-accent",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your photos are encrypted and never shared. Complete privacy guaranteed.",
    color: "from-secondary to-teal-medium",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get comprehensive skin analysis results in under 30 seconds.",
    color: "from-gold to-accent",
  },
  {
    icon: Heart,
    title: "Personalized Care",
    description: "Receive tailored skincare recommendations based on your unique skin profile.",
    color: "from-primary to-rose-medium",
  },
  {
    icon: Sparkles,
    title: "Track Progress",
    description: "Monitor your skin health journey with detailed progress tracking.",
    color: "from-secondary to-primary",
  },
  {
    icon: TrendingUp,
    title: "Expert Insights",
    description: "Access dermatologist-approved tips and treatment suggestions.",
    color: "from-accent to-gold",
  },
];

const FeaturesSection = () => {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Powered by Science,
            <br />
            <span className="gradient-text">Designed for You</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Our cutting-edge AI technology combines with dermatological expertise 
            to deliver the most accurate and helpful skin analysis available.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-8 hover-lift group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
