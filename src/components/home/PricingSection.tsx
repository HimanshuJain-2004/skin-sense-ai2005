import { motion } from "framer-motion";
import { Check, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Monthly",
    price: "₹299",
    period: "/month",
    description: "Perfect for trying out",
    features: [
      "Full skin analysis reports",
      "Personalized remedies",
      "Progress tracking",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Quarterly",
    price: "₹699",
    period: "/3 months",
    originalPrice: "₹897",
    description: "Most popular choice",
    features: [
      "Everything in Monthly",
      "Unlimited analyses",
      "Priority support",
      "Exclusive tips & content",
      "Save 22%",
    ],
    popular: true,
  },
  {
    name: "Yearly",
    price: "₹1,999",
    period: "/year",
    originalPrice: "₹3,588",
    description: "Best value for serious users",
    features: [
      "Everything in Quarterly",
      "Dermatologist consultations",
      "Advanced AI insights",
      "Early feature access",
      "Save 44%",
    ],
    popular: false,
    best: true,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="section-padding bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-light/20 to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
            <Crown className="w-4 h-4 inline mr-1" />
            Premium Plans
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Unlock Your Full
            <br />
            <span className="gradient-text">Skin Potential</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Choose the plan that fits your skincare journey. 
            All plans include our AI-powered analysis and personalized recommendations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold shadow-glow">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`glass-card p-8 h-full flex flex-col ${
                plan.popular 
                  ? "border-2 border-primary/30 shadow-glow" 
                  : plan.best 
                    ? "border border-gold/30" 
                    : ""
              }`}>
                <div className="text-center mb-6">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-display text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through mt-1">
                      {plan.originalPrice}
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-secondary" />
                      </div>
                      <span className="text-sm text-foreground font-body">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : plan.best ? "premium" : "outline"}
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/subscription")}
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          🔒 Secure payment powered by Razorpay. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
