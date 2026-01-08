import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles, Chrome, AlertCircle, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
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

  const validatePassword = () => {
    if (mode === "forgot-password") return true;
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailPasswordLogin = async () => {
    // Try password login first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If invalid credentials, switch to OTP fallback
      if (error.message.includes("Invalid login credentials")) {
        return { success: false, shouldFallbackToOtp: true };
      }
      return { success: false, error: error.message, shouldFallbackToOtp: false };
    }

    return { success: true, data };
  };

  const handleSignup = async () => {
    // For signup, use OTP flow (no password initially, set after OTP verification)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      if (error.message.includes("rate limit")) {
        return { success: false, error: "Too many requests. Please wait a moment." };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const handleForgotPassword = async () => {
    // Check if email exists in profiles first
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      return { success: false, error: "Could not verify email. Please try again." };
    }

    if (!profile) {
      return { success: false, error: "Email not registered. Please sign up first." };
    }

    // Send OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    
    if (!validateEmail()) return;
    if (mode !== "forgot-password" && mode !== "signup" && !validatePassword()) return;
    
    setIsLoading(true);

    try {
      if (mode === "login") {
        // Try email + password login first
        const result = await handleEmailPasswordLogin();
        
        if (result.success) {
          toast({
            title: "Welcome back!",
            description: "You've been logged in successfully.",
          });
          navigate("/");
          return;
        }

        if (result.shouldFallbackToOtp) {
          // Password incorrect or doesn't exist, send OTP
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false,
            },
          });

          if (error) {
            if (error.message.includes("Signups not allowed")) {
              setGeneralError("Account not found. Please sign up first.");
            } else {
              setGeneralError(error.message);
            }
            setIsLoading(false);
            return;
          }

          toast({
            title: "Verification code sent!",
            description: "Password incorrect or not set. We've sent you a login code.",
          });

          navigate("/verify-email", {
            state: { email, mode: "login" },
          });
          return;
        }

        if (result.error) {
          setGeneralError(result.error);
          setIsLoading(false);
          return;
        }
      } else if (mode === "signup") {
        const result = await handleSignup();
        
        if (!result.success) {
          setGeneralError(result.error || "Failed to send verification code");
          setIsLoading(false);
          return;
        }

        toast({
          title: "Verification code sent!",
          description: "Please check your email for the 6-digit code.",
        });

        navigate("/verify-email", {
          state: { email, mode: "signup", password },
        });
      } else if (mode === "forgot-password") {
        const result = await handleForgotPassword();
        
        if (!result.success) {
          setEmailError(result.error || "Failed to send reset code");
          setIsLoading(false);
          return;
        }

        toast({
          title: "Reset code sent!",
          description: "Please check your email for the 6-digit code.",
        });

        navigate("/verify-email", {
          state: { email, mode: "forgot-password" },
        });
      }
    } catch (error) {
      setGeneralError("An unexpected error occurred. Please try again.");
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
        description: "Please try again or use email sign in.",
      });
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "signup": return "Create Account";
      case "login": return "Welcome Back";
      case "forgot-password": return "Reset Password";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signup": return "Start your journey to healthier skin";
      case "login": return "Sign in to continue your skincare journey";
      case "forgot-password": return "We'll send you a code to reset your password";
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      if (mode === "login") return "Signing in...";
      if (mode === "signup") return "Creating account...";
      return "Sending code...";
    }
    switch (mode) {
      case "signup": return "Create Account";
      case "login": return "Sign In";
      case "forgot-password": return "Send Reset Code";
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-semibold text-foreground">
              Skin Sense
            </span>
          </div>

          {/* Mode Tabs */}
          {mode !== "forgot-password" && (
            <div className="flex gap-2 mb-8 p-1 bg-muted rounded-xl">
              <button
                onClick={() => { setMode("signup"); setGeneralError(""); }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === "signup" 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => { setMode("login"); setGeneralError(""); }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === "login" 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
            </div>
          )}

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground mb-6 font-body">
            {getDescription()}
          </p>

          {/* General Error */}
          {generalError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{generalError}</span>
            </div>
          )}

          {mode !== "forgot-password" && (
            <>
              {/* Google Auth */}
              <Button
                variant="outline"
                size="lg"
                className="w-full mb-4"
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
                  <span className="bg-background px-4 text-muted-foreground">or</span>
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
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
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

            {/* Password field - only for login mode */}
            {mode === "login" && (
              <div>
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                    className={`pl-10 pr-10 h-12 rounded-xl ${passwordError ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {passwordError}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Don't remember your password? We'll send you a login code.
                </p>
              </div>
            )}

            {/* For signup, we use OTP */}
            {mode === "signup" && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <User className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                We'll send a 6-digit verification code to your email
              </p>
            )}

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
                  onClick={() => { setMode("login"); setGeneralError(""); }}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              mode === "login" && (
                <p className="text-muted-foreground font-body">
                  <button
                    onClick={() => { setMode("forgot-password"); setGeneralError(""); }}
                    className="text-primary font-medium hover:underline"
                  >
                    Forgot your password?
                  </button>
                </p>
              )
            )}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex w-1/2 bg-primary items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-primary to-navy-hover" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-sand/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-sand/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-sand/20 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-sand" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
            AI-Powered Skin Analysis
          </h2>
          <p className="text-sand/80 font-body leading-relaxed">
            Join thousands of users who've discovered their skin's true potential 
            with our advanced AI technology. Get personalized insights and 
            recommendations tailored just for you.
          </p>
          
          {/* Trust indicators */}
          <div className="mt-8 flex justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-sand">10K+</div>
              <div className="text-xs text-sand/60">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sand">15</div>
              <div className="text-xs text-sand/60">Skin Parameters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sand">99%</div>
              <div className="text-xs text-sand/60">Accuracy</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
