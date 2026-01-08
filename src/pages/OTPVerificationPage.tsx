import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles, RefreshCw, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type FlowMode = "signup" | "login" | "forgot-password";
type Step = "otp" | "set-password";

const OTPVerificationPage = () => {
  const [otpInput, setOtpInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [step, setStep] = useState<Step>("otp");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const otpRef = useRef<HTMLDivElement>(null);
  
  const email = (location.state?.email as string) || "";
  const mode = (location.state?.mode as FlowMode) || "signup";
  const initialPassword = (location.state?.password as string) || "";

  useEffect(() => {
    if (!email) {
      navigate("/auth?mode=signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus OTP input
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpRef.current?.querySelector('input')?.focus();
      }, 100);
    }
  }, [step]);

  const handleVerifyOtp = async () => {
    if (otpInput.length !== 6) {
      setOtpError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setOtpError("");
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpInput,
        type: "email",
      });

      if (error) {
        setOtpError(
          error.message.includes("expired") 
            ? "Code has expired. Please request a new one." 
            : "Invalid code. Please try again."
        );
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // For forgot password or signup, show set password step
        if (mode === "forgot-password" || mode === "signup") {
          setStep("set-password");
          setIsLoading(false);
          return;
        }

        // For login, user is now authenticated
        toast({
          title: "Welcome back!",
          description: "You've been logged in successfully.",
        });
        navigate("/");
      }
    } catch (error) {
      setOtpError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async () => {
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setPasswordError(passwordResult.error.errors[0].message);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setPasswordError(error.message);
        setIsLoading(false);
        return;
      }

      toast({
        title: mode === "signup" ? "Account created!" : "Password updated!",
        description: mode === "signup" 
          ? "Welcome to Skin Sense! Your account is ready." 
          : "Your password has been reset successfully.",
      });
      navigate("/");
    } catch (error) {
      setPasswordError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setOtpError("");
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === "signup",
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to resend",
          description: error.message,
        });
      } else {
        toast({
          title: "Code resent!",
          description: "Please check your email for the new verification code.",
        });
        setCountdown(60);
        setOtpInput("");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend verification code.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const getTitle = () => {
    if (step === "set-password") {
      return mode === "signup" ? "Set Your Password" : "Create New Password";
    }
    switch (mode) {
      case "signup": return "Verify Your Email";
      case "login": return "Enter Login Code";
      case "forgot-password": return "Verify Your Email";
    }
  };

  const getDescription = () => {
    if (step === "set-password") {
      return "Create a secure password to protect your account";
    }
    return "We've sent a 6-digit verification code to";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          {/* Logo */}
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          {/* Step Indicator */}
          {mode !== "login" && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "otp" ? "bg-primary text-primary-foreground" : "bg-success text-primary-foreground"
              }`}>
                {step === "set-password" ? <CheckCircle className="w-5 h-5" /> : "1"}
              </div>
              <div className="w-12 h-0.5 bg-border" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "set-password" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                2
              </div>
            </div>
          )}

          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            {step === "set-password" ? (
              <Lock className="w-8 h-8 text-primary" />
            ) : (
              <Mail className="w-8 h-8 text-primary" />
            )}
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground mb-2 font-body text-center">
            {getDescription()}
          </p>
          {step === "otp" && (
            <p className="text-foreground font-medium mb-6 text-center">{email}</p>
          )}

          {step === "otp" ? (
            <>
              <div ref={otpRef} className="flex justify-center mb-4">
                <InputOTP
                  value={otpInput}
                  onChange={(value) => { setOtpInput(value); setOtpError(""); }}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {otpError && (
                <p className="text-sm text-destructive flex items-center justify-center gap-1 mb-4">
                  <AlertCircle className="w-4 h-4" />
                  {otpError}
                </p>
              )}

              <Button
                variant="hero"
                size="lg"
                className="w-full mb-4"
                onClick={handleVerifyOtp}
                disabled={isLoading || otpInput.length !== 6}
              >
                {isLoading ? "Verifying..." : (
                  <>
                    Verify Code
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={isResending || countdown > 0}
                >
                  <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                    className="pl-10 pr-10 h-12 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </p>
              )}

              {/* Password requirements */}
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
                <p className="font-medium text-foreground">Password requirements:</p>
                <p className={password.length >= 6 ? "text-success" : ""}>• At least 6 characters</p>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full mt-4"
                onClick={handleSetPassword}
                disabled={isLoading}
              >
                {isLoading ? "Setting password..." : (
                  <>
                    {mode === "signup" ? "Complete Signup" : "Reset Password"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center">
            <button
              onClick={() => navigate("/auth")}
              className="text-sm text-primary hover:underline"
            >
              Use a different email
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerificationPage;
