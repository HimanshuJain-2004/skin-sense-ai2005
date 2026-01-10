import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, CreditCard, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: 299,
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
    id: "quarterly",
    name: "Quarterly",
    price: 699,
    period: "/3 months",
    originalPrice: 897,
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
    id: "yearly",
    name: "Yearly",
    price: 1999,
    period: "/year",
    originalPrice: 3588,
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

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load payment gateway. Please refresh the page.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!razorpayLoaded) {
      toast({
        title: "Please Wait",
        description: "Payment gateway is loading...",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const selectedPlanData = plans.find((p) => p.id === selectedPlan);
      if (!selectedPlanData) throw new Error("Invalid plan");

      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Create order
      const orderResponse = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          plan_id: selectedPlan,
          amount: selectedPlanData.price,
        },
      });

      console.log("Order response:", orderResponse);

      if (orderResponse.error) {
        throw new Error(orderResponse.error.message || "Failed to create order");
      }

      if (!orderResponse.data || orderResponse.data.error) {
        throw new Error(orderResponse.data?.error || "Failed to create order");
      }

      const { order_id, amount, currency, key_id } = orderResponse.data;

      if (!order_id || !key_id) {
        throw new Error("Invalid order response from server");
      }

      // Open Razorpay checkout
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "Skin Sense",
        description: `${selectedPlanData.name} Subscription`,
        order_id: order_id,
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#0B2C5F",
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: selectedPlan,
              },
            });

            if (verifyResponse.error) {
              throw new Error(verifyResponse.error.message || "Payment verification failed");
            }

            toast({
              title: "Payment Successful! 🎉",
              description: `You're now subscribed to the ${selectedPlanData.name} plan.`,
            });

            navigate("/report");
          } catch (error: any) {
            console.error("Verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support if amount was deducted.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        toast({
          title: "Payment Failed",
          description: response.error?.description || "Something went wrong",
          variant: "destructive",
        });
        setIsProcessing(false);
      });
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

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
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              Premium Plans
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
              Unlock the full power of AI skin analysis. 
              Cancel anytime, no questions asked.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative cursor-pointer ${plan.popular ? "lg:-mt-4 lg:mb-4" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div
                  className={`glass-card p-8 h-full flex flex-col transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? "border-2 border-primary ring-2 ring-primary/20"
                      : plan.popular
                        ? "border-2 border-primary/30"
                        : plan.best
                          ? "border border-gold/30"
                          : ""
                  }`}
                >
                  {/* Radio indicator */}
                  <div className="absolute top-6 right-6">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedPlan === plan.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {selectedPlan === plan.id && (
                        <Check className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-display text-4xl font-bold text-foreground">
                        ₹{plan.price}
                      </span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    {plan.originalPrice && (
                      <p className="text-sm text-muted-foreground line-through mt-1">
                        ₹{plan.originalPrice}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground font-body">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-md mx-auto"
          >
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Selected plan</p>
                  <p className="font-display font-semibold text-foreground">
                    {selectedPlanData?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    ₹{selectedPlanData?.price}
                  </p>
                </div>
              </div>

              <Button
                variant="hero"
                size="xl"
                className="w-full mb-4"
                onClick={handlePayment}
                disabled={isProcessing || !razorpayLoaded}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : !razorpayLoaded ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay with Razorpay
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure payment • Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubscriptionPage;
