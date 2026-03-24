import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2, Bug, AlertTriangle, CheckCircle, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

type DetectionResult = {
  name: string;
  type: "pest" | "disease";
  confidence: number;
  severity: "low" | "medium" | "high";
  description: string;
  treatment: string;
};

const ScanUpload = ({ onScanComplete }: { onScanComplete?: () => void }) => {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DetectionResult[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const analyze = useCallback(async () => {
    if (!image || !user) return;
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("detect-pests", {
        body: { imageBase64: image },
      });

      if (error) {
        throw new Error(error.message || "Analysis failed");
      }

      if (data?.error) {
        toast({
          title: "Analysis Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      const detections = data.detections || [];
      setResults(detections);

      try {
        await supabase.from("scan_history").insert({
          detections: detections as any,
          detection_count: detections.length,
          user_id: user.id,
        });
        onScanComplete?.();
      } catch (saveErr) {
        console.error("Failed to save scan:", saveErr);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [image, user, toast, onScanComplete]);

  const reset = useCallback(() => {
    setImage(null);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const severityColor = (s: string) => {
    if (s === "high") return "bg-destructive/10 text-destructive";
    if (s === "medium") return "bg-warning/10 text-warning-foreground";
    return "bg-success/10 text-success";
  };

  return (
    <section id="scan" className="py-20 px-6">
      <div className="container max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-display text-foreground mb-3">
            Scan Your Plant
          </h2>
          <p className="text-muted-foreground font-body">
            Upload or capture a photo to detect pests and diseases instantly.
          </p>
        </motion.div>

        {!user ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center bg-card"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Sign in to scan plants</p>
                <p className="text-sm text-muted-foreground mb-4">Create a free account to start detecting pests and diseases</p>
              </div>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center bg-card hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Tap to capture or upload</p>
                    <p className="text-sm text-muted-foreground">Drag & drop an image or click to browse</p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                      <Camera className="w-3.5 h-3.5" /> Camera
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                      <Upload className="w-3.5 h-3.5" /> Gallery
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img src={image} alt="Uploaded plant" className="w-full max-h-80 object-cover" />
                  <button
                    onClick={reset}
                    className="absolute top-3 right-3 bg-foreground/60 backdrop-blur-sm text-primary-foreground rounded-full p-2 hover:bg-foreground/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {!results && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={analyze}
                    disabled={isAnalyzing}
                    className="w-full mt-4 bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Bug className="w-5 h-5" />
                        Analyze Plant
                      </>
                    )}
                  </motion.button>
                )}

                <AnimatePresence>
                  {results && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 space-y-4"
                    >
                      {results.length === 0 ? (
                        <div className="flex items-center gap-2 text-success font-semibold">
                          <CheckCircle className="w-5 h-5" />
                          Your plant looks healthy! No issues detected.
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                          <AlertTriangle className="w-5 h-5 text-warning" />
                          {results.length} issue{results.length !== 1 && "s"} detected
                        </div>
                      )}

                      {results.map((r, i) => (
                        <motion.div
                          key={r.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className="bg-card rounded-xl p-5 border border-border"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {r.type === "pest" ? (
                                  <Bug className="w-4 h-4 text-destructive" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-warning" />
                                )}
                                <h4 className="font-semibold text-foreground font-body">{r.name}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(r.severity)}`}>
                                  {r.severity} severity
                                </span>
                                <span className="text-xs text-muted-foreground">{r.confidence}% confidence</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{r.description}</p>
                          <div className="bg-success/5 border border-success/20 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-success text-sm font-medium mb-1">
                              <CheckCircle className="w-4 h-4" />
                              Treatment
                            </div>
                            <p className="text-sm text-muted-foreground">{r.treatment}</p>
                          </div>
                        </motion.div>
                      ))}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={reset}
                        className="w-full bg-secondary text-secondary-foreground font-semibold py-3 rounded-xl"
                      >
                        Scan Another Plant
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

export default ScanUpload;
