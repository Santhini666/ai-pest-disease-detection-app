import { motion } from "framer-motion";
import { Camera, Shield, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-leaf.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Lush green leaf" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-accent/50" />
      </div>

      <div className="container relative z-10 px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 backdrop-blur-sm px-4 py-2 mb-6"
          >
            <Shield className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">AI-Powered Detection</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-display text-primary-foreground leading-tight mb-6">
            Protect Your Crops with{" "}
            <span className="italic">Intelligent</span> Detection
          </h1>

          <p className="text-lg text-primary-foreground/80 font-body mb-8 max-w-md">
            Snap a photo of any plant and instantly identify pests and diseases with our advanced AI technology.
          </p>

          <div className="flex flex-wrap gap-4">
            <motion.a
              href="#scan"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Camera className="w-5 h-5" />
              Start Scanning
            </motion.a>
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 border-2 border-primary-foreground/30 text-primary-foreground font-semibold px-6 py-3.5 rounded-xl backdrop-blur-sm hover:bg-primary-foreground/10 transition-colors"
            >
              <Leaf className="w-5 h-5" />
              Learn More
            </motion.a>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-wrap gap-8 mt-16"
        >
          {[
            { value: "500+", label: "Pests Identified" },
            { value: "98%", label: "Accuracy Rate" },
            { value: "2s", label: "Detection Speed" },
          ].map((stat) => (
            <div key={stat.label} className="text-primary-foreground">
              <div className="text-3xl font-display">{stat.value}</div>
              <div className="text-sm text-primary-foreground/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
