import { motion } from "framer-motion";
import { Sun, Moon, Droplets, Sparkles, Shield, Leaf, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RoutineStep {
  step: number;
  name: string;
  description: string;
  reason: string;
  icon: React.ReactNode;
}

const amRoutine: RoutineStep[] = [
  {
    step: 1,
    name: "Gentle Cleanser",
    description: "Start with a mild, hydrating cleanser to remove overnight buildup.",
    reason: "Prepares skin for product absorption without stripping natural oils.",
    icon: <Droplets className="w-5 h-5" />,
  },
  {
    step: 2,
    name: "Vitamin C Serum",
    description: "Apply antioxidant serum to protect and brighten.",
    reason: "Fights free radical damage and helps fade pigmentation over time.",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    step: 3,
    name: "Lightweight Moisturizer",
    description: "Lock in hydration with a non-greasy formula.",
    reason: "Maintains skin barrier function and prevents transepidermal water loss.",
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    step: 4,
    name: "Sunscreen SPF 30+",
    description: "Finish with broad-spectrum sun protection.",
    reason: "Prevents UV damage, premature aging, and dark spot formation.",
    icon: <Shield className="w-5 h-5" />,
  },
];

const pmRoutine: RoutineStep[] = [
  {
    step: 1,
    name: "Oil Cleanser / Micellar",
    description: "Remove makeup and sunscreen thoroughly.",
    reason: "First cleanse dissolves oil-based impurities for deeper clean.",
    icon: <Droplets className="w-5 h-5" />,
  },
  {
    step: 2,
    name: "Gentle Cleanser",
    description: "Follow with water-based cleanser for double cleansing.",
    reason: "Ensures all residue is removed without over-stripping skin.",
    icon: <Droplets className="w-5 h-5" />,
  },
  {
    step: 3,
    name: "Active Treatment",
    description: "Apply retinol, AHA/BHA, or targeted treatment.",
    reason: "Night is optimal for actives as skin repairs while you sleep.",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    step: 4,
    name: "Night Cream / Repair",
    description: "Seal everything with a nourishing night cream.",
    reason: "Supports overnight cell regeneration and deep hydration.",
    icon: <Moon className="w-5 h-5" />,
  },
];

interface RoutineRecommenderProps {
  isLocked?: boolean;
}

const RoutineRecommender = ({ isLocked = false }: RoutineRecommenderProps) => {
  const renderRoutine = (routine: RoutineStep[], time: "AM" | "PM") => (
    <div className="space-y-4">
      {routine.map((step, index) => (
        <motion.div
          key={step.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`glass-card p-4 ${isLocked ? "blur-sm pointer-events-none" : ""}`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              time === "AM" 
                ? "bg-gold/20 text-gold" 
                : "bg-primary/20 text-primary"
            }`}>
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {step.step}
                </span>
              </div>
              <h4 className="font-display font-semibold text-foreground mb-1">
                {step.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                {step.description}
              </p>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {step.reason}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="am" className="space-y-4">
        <AccordionItem value="am" className="glass-card border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                <Sun className="w-5 h-5 text-gold" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-semibold text-foreground">
                  Morning Routine
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cleanse • Treat • Hydrate • Protect
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {renderRoutine(amRoutine, "AM")}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pm" className="glass-card border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-semibold text-foreground">
                  Evening Routine
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cleanse • Actives • Repair
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {renderRoutine(pmRoutine, "PM")}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default RoutineRecommender;
