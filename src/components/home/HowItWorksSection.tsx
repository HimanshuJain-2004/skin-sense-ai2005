import { motion } from "framer-motion";
import { UserPlus, Upload, BarChart3, CalendarCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up Securely",
    description: "Create your account with email or Google. Your data stays private and protected.",
  },
  {
    icon: Upload,
    step: "02",
    title: "Upload a Clear Photo",
    description: "Take a well-lit selfie with your face centered. No makeup or filters needed.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Get 15-Parameter Analysis",
    description: "Our AI analyzes acne, pigmentation, hydration, wrinkles, and more in seconds.",
  },
  {
    icon: CalendarCheck,
    step: "04",
    title: "Follow Your Routine",
    description: "Get personalized AM/PM skincare routines tailored to your skin's unique needs.",
  },
];

const HowItWorksSection = () => {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="section-padding bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple 4-Step Process
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            How Skin Sense Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Get your complete skin analysis in just four simple steps. 
            No appointments, no waiting rooms, no expensive consultations.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-card transition-shadow h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      Step {step.step}
                    </span>
                  </div>
                  
                  <div className="w-16 h-16 mx-auto mt-4 mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/auth?mode=signup")}
            className="group"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            No credit card required • Free skin analysis included
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
