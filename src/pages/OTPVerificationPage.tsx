import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const OTPVerificationPage = () => {
  const [otpInput, setOtpInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [storedOtp, setStoredOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const email = location.state?.email || "";
  const password = location.state?.password || "";
  const fullName = location.state?.fullName || "";
  const initialOtp = location.state?.otp || "";

  useEffect(() => {
    if (!email || !password) {
      navigate("/auth?mode=signup");
      return;
    }
    setStoredOtp(initialOtp);
  }, [email, password, navigate, initialOtp]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otpInput.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code",
      });
      return;
    }

    if (otpInput !== storedOtp) {
      toast({
        variant: "destructive",
        title: "Incorrect code",
        description: "The code you entered is incorrect. Please try again.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // OTP verified, now create the actual account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            email_verified: true,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Account creation failed",
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      if (data.session) {
        toast({
          title: "Email verified!",
          description: "Welcome to Skin Sense. Your account is now active.",
        });
        navigate("/");
      } else if (data.user) {
        // Auto sign in after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          toast({
            title: "Account created!",
            description: "Please sign in with your credentials.",
          });
          navigate("/auth?mode=login");
        } else {
          toast({
            title: "Welcome to Skin Sense!",
            description: "Your account is now active.",
          });
          navigate("/");
        }
      }
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

  const handleResend = async () => {
    setIsResending(true);
    try {
      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { error } = await supabase.functions.invoke("send-otp-email", {
        body: { email, otp: newOtp },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to resend",
          description: error.message || "Could not send verification code.",
        });
      } else {
        setStoredOtp(newOtp);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-rose-light via-background to-teal-light">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 text-center">
          {/* Logo */}
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-secondary" />
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Verify Your Email
          </h1>
          <p className="text-muted-foreground mb-2 font-body">
            We've sent a 6-digit code to
          </p>
          <p className="text-foreground font-medium mb-8">{email}</p>

          <div className="flex justify-center mb-8">
            <InputOTP
              value={otpInput}
              onChange={setOtpInput}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full mb-4"
            onClick={handleVerify}
            disabled={isLoading || otpInput.length !== 6}
          >
            {isLoading ? "Verifying..." : (
              <>
                Verify Email
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

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

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={() => navigate("/auth?mode=signup")}
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
