import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Bug, AlertTriangle, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

type ScanRecord = {
  id: string;
  detections: Array<{
    name: string;
    type: "pest" | "disease";
    confidence: number;
    severity: "low" | "medium" | "high";
    description: string;
    treatment: string;
  }>;
  detection_count: number;
  created_at: string;
};

const severityColor = (s: string) => {
  if (s === "high") return "bg-destructive/10 text-destructive";
  if (s === "medium") return "bg-warning/10 text-warning-foreground";
  return "bg-success/10 text-success";
};

const ScanHistory = ({ refreshKey }: { refreshKey: number }) => {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchScans = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scan_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setScans(data as unknown as ScanRecord[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans, refreshKey]);

  if (loading) {
    return (
      <section className="py-16 px-6">
        <div className="container max-w-2xl mx-auto text-center text-muted-foreground">
          Loading scan history...
        </div>
      </section>
    );
  }

  if (!user || scans.length === 0) return null;

  return (
    <section id="history" className="py-16 px-6 bg-card">
      <div className="container max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-display text-foreground mb-3">
            Scan History
          </h2>
          <p className="text-muted-foreground font-body">
            Your recent plant analyses
          </p>
        </motion.div>

        <div className="space-y-3">
          {scans.map((scan, i) => {
            const isExpanded = expandedId === scan.id;
            const detections = scan.detections || [];

            return (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-background rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : scan.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      scan.detection_count === 0
                        ? "bg-success/10"
                        : "bg-warning/10"
                    }`}>
                      {scan.detection_count === 0 ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Bug className="w-5 h-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {scan.detection_count === 0
                          ? "Healthy Plant"
                          : `${scan.detection_count} issue${scan.detection_count !== 1 ? "s" : ""} detected`}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {detections.length > 0 && (
                    isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && detections.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {detections.map((d) => (
                          <div key={d.name} className="bg-muted/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              {d.type === "pest" ? (
                                <Bug className="w-3.5 h-3.5 text-destructive" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                              )}
                              <span className="font-medium text-sm text-foreground">{d.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(d.severity)}`}>
                                {d.severity}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto">{d.confidence}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{d.description}</p>
                            <p className="text-xs text-success"><strong>Treatment:</strong> {d.treatment}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ScanHistory;
