import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Image, X, Loader2, Sparkles, Sun, Focus, AlertTriangle, Check, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ImageQuality {
  lighting: "good" | "poor" | "unknown";
  centered: "good" | "poor" | "unknown";
  clarity: "good" | "poor" | "unknown";
}

const UploadSection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageQuality, setImageQuality] = useState<ImageQuality>({
    lighting: "unknown",
    centered: "unknown",
    clarity: "unknown",
  });
  const [showGuidance, setShowGuidance] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const simulateQualityCheck = () => {
    // Simulate image quality analysis (will be replaced by real ML)
    setTimeout(() => {
      setImageQuality({
        lighting: Math.random() > 0.3 ? "good" : "poor",
        centered: Math.random() > 0.2 ? "good" : "poor",
        clarity: Math.random() > 0.25 ? "good" : "poor",
      });
    }, 500);
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setImageQuality({ lighting: "unknown", centered: "unknown", clarity: "unknown" });
        simulateQualityCheck();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      fileInputRef.current?.click();
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      fileInputRef.current?.click();
    }
  };

  const isQualityAcceptable = () => {
    const checks = [imageQuality.lighting, imageQuality.centered, imageQuality.clarity];
    const poorCount = checks.filter(c => c === "poor").length;
    return poorCount < 2;
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to analyze your skin.",
      });
      navigate("/auth?mode=login");
      return;
    }

    if (!isQualityAcceptable()) {
      toast({
        variant: "destructive",
        title: "Image quality issue",
        description: "Please upload a clearer photo for accurate results.",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate API call - will be replaced with real backend
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    navigate("/report");
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageQuality({ lighting: "unknown", centered: "unknown", clarity: "unknown" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const QualityIndicator = ({ status, label }: { status: "good" | "poor" | "unknown"; label: string }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
      status === "good" ? "bg-success/10 text-success" :
      status === "poor" ? "bg-destructive/10 text-destructive" :
      "bg-muted text-muted-foreground"
    }`}>
      {status === "good" ? <Check className="w-4 h-4" /> :
       status === "poor" ? <AlertTriangle className="w-4 h-4" /> :
       <Loader2 className="w-4 h-4 animate-spin" />}
      {label}
    </div>
  );

  return (
    <section id="upload-section" className="section-padding bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Upload Your Photo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Take a clear, well-lit photo of your face for the most accurate analysis. 
            Our AI will examine your skin and provide detailed insights.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {!selectedImage ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`bg-card border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer hover:border-primary ${
                    dragActive ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Image className="w-10 h-10 text-primary" />
                  </div>
                  
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                    Drag & Drop Your Image
                  </h3>
                  <p className="text-muted-foreground mb-8 font-body">
                    or click to browse from your device
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="hero" size="lg" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                      <Upload className="w-5 h-5" />
                      Upload Photo
                    </Button>
                    <Button variant="outline" size="lg" onClick={(e) => { e.stopPropagation(); handleCameraCapture(); }}>
                      <Camera className="w-5 h-5" />
                      Use Camera
                    </Button>
                  </div>
                </div>

                {/* Photo Guidelines */}
                <div className="mt-8">
                  <button
                    onClick={() => setShowGuidance(!showGuidance)}
                    className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors"
                  >
                    <span className="font-medium text-foreground">📸 Tips for the Best Photo</span>
                    <span className="text-primary text-sm">{showGuidance ? "Hide" : "Show"}</span>
                  </button>
                  
                  <AnimatePresence>
                    {showGuidance && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {[
                            { icon: Sun, title: "Good Lighting", desc: "Natural daylight works best. Avoid harsh shadows.", good: true },
                            { icon: Focus, title: "Face Centered", desc: "Position your face in the center of the frame.", good: true },
                            { icon: UserCircle, title: "Full Face Visible", desc: "Forehead to chin should be visible.", good: true },
                            { icon: X, title: "No Filters", desc: "Skip beauty filters and heavy makeup.", good: false },
                          ].map((tip, index) => (
                            <div key={index} className={`p-4 rounded-xl border ${tip.good ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tip.good ? "bg-success/10" : "bg-destructive/10"}`}>
                                  <tip.icon className={`w-5 h-5 ${tip.good ? "text-success" : "text-destructive"}`} />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground">{tip.title}</h4>
                                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="relative mb-6">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full max-h-96 object-contain rounded-xl"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-4 right-4 p-2 rounded-full bg-card/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Image Quality Feedback */}
                <div className="mb-6">
                  <h4 className="font-medium text-foreground mb-3">Image Quality Check</h4>
                  <div className="flex flex-wrap gap-2">
                    <QualityIndicator status={imageQuality.lighting} label="Lighting" />
                    <QualityIndicator status={imageQuality.centered} label="Face Centered" />
                    <QualityIndicator status={imageQuality.clarity} label="Clarity" />
                  </div>
                  
                  {!isQualityAcceptable() && imageQuality.lighting !== "unknown" && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                    >
                      <AlertTriangle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                      Please retake your photo with better lighting and ensure your face is centered.
                    </motion.p>
                  )}
                </div>
                
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || imageQuality.lighting === "unknown"}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Your Skin...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Now
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    You'll need to sign in to view your results
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default UploadSection;
