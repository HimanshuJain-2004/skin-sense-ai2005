import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Calendar,
  Crown,
  Sparkles,
  History,
  Edit2,
  Save,
  X,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  age: number | null;
  gender: string | null;
  skin_concerns: string[] | null;
  avatar_url: string | null;
  created_at: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  last_payment_date: string | null;
}

interface SkinAnalysis {
  id: string;
  overall_score: number | null;
  skin_type: string | null;
  analyzed_at: string;
}

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<SkinAnalysis[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({
    full_name: "",
    age: "",
    gender: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }
      
      if (profileData) {
        setProfile(profileData);
        setEditForm({
          full_name: profileData.full_name || "",
          age: profileData.age?.toString() || "",
          gender: profileData.gender || "",
        });
      }

      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (subError && subError.code !== "PGRST116") {
        console.error("Subscription fetch error:", subError);
      }
      
      if (subData) {
        setSubscription(subData);
      }

      // Fetch analysis history
      const { data: historyData, error: historyError } = await supabase
        .from("skin_analysis_history")
        .select("id, overall_score, skin_type, analyzed_at")
        .eq("user_id", user.id)
        .order("analyzed_at", { ascending: false })
        .limit(10);
      
      if (historyError) {
        console.error("History fetch error:", historyError);
      }
      
      if (historyData) {
        setAnalysisHistory(historyData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name || null,
          age: editForm.age ? parseInt(editForm.age) : null,
          gender: editForm.gender || null,
        })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
      
      setIsEditing(false);
      fetchProfileData();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      free: "Free Plan",
      monthly: "Monthly Premium",
      quarterly: "Quarterly Premium",
      yearly: "Yearly Premium",
    };
    return labels[plan] || plan;
  };

  const isPremium = subscription?.plan && subscription.plan !== "free";

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              My Profile
            </h1>
            <p className="text-lg text-muted-foreground font-body">
              Manage your account and view your skin analysis journey
            </p>
          </motion.div>

          <div className="grid gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Account Details
                </h2>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground text-sm">Full Name</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="mt-1"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-foreground font-medium mt-1">
                      {profile?.full_name || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <p className="text-foreground font-medium mt-1">
                    {profile?.email || user?.email || "Not set"}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Age</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      className="mt-1"
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                    />
                  ) : (
                    <p className="text-foreground font-medium mt-1">
                      {profile?.age || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Gender</Label>
                  {isEditing ? (
                    <Select
                      value={editForm.gender}
                      onValueChange={(value) => setEditForm({ ...editForm, gender: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground font-medium mt-1 capitalize">
                      {profile?.gender?.replace("_", " ") || "Not set"}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="text-muted-foreground text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </Label>
                  <p className="text-foreground font-medium mt-1">
                    {formatDate(profile?.created_at || null)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Subscription Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                  <Crown className="w-5 h-5 text-gold" />
                  Subscription Status
                </h2>
                {!isPremium && (
                  <Button variant="hero" size="sm" onClick={() => navigate("/subscription")}>
                    <Sparkles className="w-4 h-4" />
                    Upgrade
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground text-sm">Current Plan</Label>
                  <p className="text-foreground font-medium mt-1 flex items-center gap-2">
                    {subscription ? getPlanLabel(subscription.plan) : "Free Plan"}
                    {isPremium && (
                      <span className="px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Status</Label>
                  <p className="text-foreground font-medium mt-1 capitalize">
                    {subscription?.status || "Active"}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Started On</Label>
                  <p className="text-foreground font-medium mt-1">
                    {formatDate(subscription?.started_at || null)}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">Last Payment</Label>
                  <p className="text-foreground font-medium mt-1">
                    {subscription?.last_payment_date 
                      ? formatDate(subscription.last_payment_date)
                      : "No payments yet"}
                  </p>
                </div>

                {subscription?.expires_at && (
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground text-sm">Expires On</Label>
                    <p className="text-foreground font-medium mt-1">
                      {formatDate(subscription.expires_at)}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Analysis History */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-6 md:p-8"
            >
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-secondary" />
                Skin Analysis History
              </h2>

              {analysisHistory.length > 0 ? (
                <div className="space-y-3">
                  {analysisHistory.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate("/report")}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-primary-foreground font-bold">
                            {analysis.overall_score || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            {analysis.skin_type || "Analysis"} Report
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(analysis.analyzed_at)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                    <History className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No analysis history yet</p>
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Get Your First Analysis
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;