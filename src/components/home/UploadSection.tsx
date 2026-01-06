import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, Image, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UploadSection = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
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
      // For now, just trigger file input - full camera implementation would need more UI
      fileInputRef.current?.click();
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      // Fallback to file input
      fileInputRef.current?.click();
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call - will be replaced with real backend
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    navigate("/report");
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section id="upload-section" className="section-padding bg-gradient-to-b from-background to-rose-light/30">
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
          {!selectedImage ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`glass-card p-12 text-center transition-all duration-300 cursor-pointer hover-lift ${
                dragActive ? "border-primary bg-primary/5 shadow-glow" : ""
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
              
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
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
          ) : (
            <div className="glass-card p-8">
              <div className="relative mb-6">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full max-h-96 object-contain rounded-xl"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-4 right-4 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
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
            </div>
          )}
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            { icon: "💡", title: "Good Lighting", desc: "Natural light works best" },
            { icon: "📷", title: "Clear Photo", desc: "No filters or makeup" },
            { icon: "👤", title: "Face Forward", desc: "Look directly at camera" },
          ].map((tip, index) => (
            <div key={index} className="glass-card p-6 text-center hover-lift">
              <span className="text-3xl mb-3 block">{tip.icon}</span>
              <h4 className="font-display font-semibold text-foreground mb-1">{tip.title}</h4>
              <p className="text-sm text-muted-foreground font-body">{tip.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default UploadSection;
