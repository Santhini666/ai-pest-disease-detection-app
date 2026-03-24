import { motion } from "framer-motion";
import { Camera, Cpu, FileText } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Capture",
    description: "Take a photo of the affected plant or upload from your gallery.",
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    description: "Our AI model identifies pests, diseases, and nutrient deficiencies in seconds.",
  },
  {
    icon: FileText,
    title: "Get Results",
    description: "Receive detailed diagnosis with treatment recommendations and severity levels.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-card">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-display text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground font-body">
            Three simple steps to protect your plants.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-sm font-medium text-primary mb-2">Step {i + 1}</div>
              <h3 className="text-xl font-display text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
