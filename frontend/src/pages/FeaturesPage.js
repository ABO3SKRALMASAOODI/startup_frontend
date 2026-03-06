import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StickyNavbar from "../components/StickyNavbar";

const features = [
  {
    title: "Idea Validation with AI Precision",
    description: "Instantly test your business idea’s viability using trained AI models on successful ventures, so you never waste time building something no one wants.",
    icon: "🧪",
  },
  {
    title: "Strategic Growth Engine",
    description: "Get a tailored, AI-generated roadmap of milestones, KPIs, and action steps based on your industry, market, and current level.",
    icon: "📊",
  },
  {
    title: "Always-On Mentorship",
    description: "Access a 24/7 AI mentor that’s been trained on thousands of startup journeys. It’s like having a founder advisor in your pocket.",
    icon: "🤖",
  },
  {
    title: "Product-Building Assistance",
    description: "From landing pages to MVP logic to content creation, Hustler Bot walks you through the entire build process with intelligent suggestions.",
    icon: "🛠️",
  },
  {
    title: "Privacy & Encryption by Default",
    description: "Every idea and message is end-to-end encrypted. Your entrepreneurial vision is yours alone — always.",
    icon: "🔐",
  },
  {
    title: "Zero-Risk 7-Day Free Trial",
    description: "Try everything, build something real, and only subscribe if you find value. No credit card required to get started.",
    icon: "🎁",
  },
];

const FeaturesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      <StickyNavbar />

      {/* Go Back button (after navbar logo) */}
      <div className="mt-24 px-6">
        <button
          onClick={() => navigate("/")}
          className="bg-gray-800 border border-red-600 text-white px-4 py-2 rounded-xl shadow-[0_0_15px_#ff1a1a] hover:bg-gray-700 transition"
        >
          ← Go Back
        </button>
      </div>

      <section className="pt-12 pb-20 px-6 max-w-6xl mx-auto text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-12 drop-shadow-[0_0_15px_#ff1a1a]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Explore Hustler Bot’s Power Features
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-[#111] border border-red-900 rounded-2xl p-6 text-left shadow-[0_0_25px_rgba(255,26,26,0.2)] hover:border-red-600 hover:shadow-[0_0_25px_#ff1a1a] transition"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-2">{feature.icon} {feature.title}</h2>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Start Trial Button after all features */}
        <div className="mt-16 flex justify-end">
          <button
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-red-600 to-red-900 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_#ff1a1a] hover:scale-105 transition"
          >
            Start Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
