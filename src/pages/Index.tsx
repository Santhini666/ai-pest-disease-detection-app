import { useState, useCallback } from "react";
import AppHeader from "@/components/AppHeader";
import HeroSection from "@/components/HeroSection";
import ScanUpload from "@/components/ScanUpload";
import ScanHistory from "@/components/ScanHistory";
import HowItWorks from "@/components/HowItWorks";

const Index = () => {
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const handleScanComplete = useCallback(() => {
    setHistoryRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-16">
        <HeroSection />
        <ScanUpload onScanComplete={handleScanComplete} />
        <ScanHistory refreshKey={historyRefreshKey} />
        <HowItWorks />
      </main>
      <footer className="py-8 px-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 CropGuard. AI-powered plant protection.
        </p>
      </footer>
    </div>
  );
};

export default Index;
