import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles, Chrome, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

type AuthMode = "signup" | "login" | "forgot-password";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "forgot-password") return "forgot-password";
    if (urlMode === "login") return "login";
    return "signup";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signInWithGoogle } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateEmail = () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsLoading(true);
    setEmailError("");

    try {
      if (mode === "forgot-password") {
        // Check if email exists in profiles first
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("email", email)
          .maybeSingle();

        if (profileError) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not verify email. Please try again.",
          });
          setIsLoading(false);
          return;
        }

        if (!profile) {
          setEmailError("Email not registered. Please sign up first.");
          setIsLoading(false);
          return;
        }
      }

      // Use Supabase's built-in OTP
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === "signup",
        },
      });

      if (error) {
        if (error.message.includes("rate limit")) {
          toast({
            variant: "destructive",
            title: "Too many requests",
            description: "Please wait a moment before requesting another code.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Failed to send OTP",
            description: error.message,
          });
        }
        setIsLoading(false);
        return;
      }

      toast({
        title: "Verification code sent!",
        description: "Please check your email for the 6-digit code.",
      });

      // Navigate to OTP verification page
      navigate("/verify-email", {
        state: {
          email,
          mode,
        },
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: "Google OAuth requires configuration. Please use email sign in for now.",
      });
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "signup": return "Create your account";
      case "login": return "Welcome back";
      case "forgot-password": return "Reset your password";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signup": return "Start your journey to healthier skin today";
      case "login": return "Sign in to continue your skincare journey";
      case "forgot-password": return "We'll send you a code to reset your password";
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Sending code...";
    switch (mode) {
      case "signup": return "Get Started";
      case "login": return "Send Login Code";
      case "forgot-password": return "Send Reset Code";
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-semibold text-foreground">
              Skin Sense
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground mb-8 font-body">
            {getDescription()}
          </p>

          {mode !== "forgot-password" && (
            <>
              {/* Google Auth */}
              <Button
                variant="outline"
                size="lg"
                className="w-full mb-6"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <Chrome className="w-5 h-5" />
                Continue with Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground">or continue with email</span>
                </div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 h-12 rounded-xl ${emailError ? 'border-destructive' : ''}`}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {emailError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {getButtonText()}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === "forgot-password" ? (
              <p className="text-muted-foreground font-body">
                Remember your password?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <>
                <p className="text-muted-foreground font-body">
                  {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                    className="text-primary font-medium hover:underline"
                  >
                    {mode === "signup" ? "Sign in" : "Sign up"}
                  </button>
                </p>
                {mode === "login" && (
                  <p className="text-muted-foreground font-body">
                    <button
                      onClick={() => setMode("forgot-password")}
                      className="text-primary font-medium hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-rose-light via-background to-teal-light items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            AI-Powered Skin Analysis
          </h2>
          <p className="text-muted-foreground font-body leading-relaxed">
            Join thousands of users who've discovered their skin's true potential 
            with our advanced AI technology. Get personalized insights and 
            recommendations tailored just for you.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
