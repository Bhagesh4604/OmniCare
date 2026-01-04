import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Shield, Activity, Clock, Zap,
  MapPin, Phone, Mail, ChevronRight, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { HealthIdentityCard, PhoneMockup, TestimonialCard } from '@/components/landing/KlarityComponents';
import { ParallaxScroll } from '@/components/landing/ParallaxScroll';
import { InfiniteMarquee } from '@/components/landing/InfiniteMarquee';
import { WhatsAppShowcase } from '@/components/landing/WhatsAppShowcase';
import { DynamicHero } from '@/components/landing/DynamicHero';
import TriageChatModal from '@/components/TriageChatModal';
import { HorizontalScrollFeatures } from '@/components/landing/HorizontalScrollFeatures';
import { HealthInsightsSection } from '@/components/landing/HealthInsightsSection';
import { ScrollingFeatureShowcase } from '@/components/ui/interactive-scrolling-story-component';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showTriageModal, setShowTriageModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden font-sans text-slate-900 selection:bg-teal-200 selection:text-teal-900">

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Omni Care</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
            <a href="#app" className="hover:text-teal-600 transition-colors">Mobile App</a>
            <a href="#testimonials" className="hover:text-teal-600 transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="hidden md:block text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors"
            >
              Log In
            </button>
            <Button
              onClick={() => navigate('/register/patient')}
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 shadow-lg shadow-slate-900/20"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <DynamicHero />

      {/* --- FEATURES SECTION (Horizontal Scroll) --- */}
      <HorizontalScrollFeatures />

      {/* --- SCROLLING STORY SECTION (Life at Omni Care) --- */}
      <ScrollingFeatureShowcase onOpenTriage={() => setShowTriageModal(true)} />

      {/* --- APP SHOWCASE SECTION --- */}
      {/* --- WHATSAPP INTEGRATION SHOWCASE --- */}
      <WhatsAppShowcase />

      {/* --- TESTIMONIALS --- */}
      <section id="testimonials" className="py-20 bg-[#F8FAFC] relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900">What our patients say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Johnson"
              role="Recovered Patient"
              text="The AI symptom checker saved me a trip to the ER. It accurately diagnosed my issue and guided me to a specialist immediately."
            />
            <TestimonialCard
              name="Michael Chen"
              role="Diabetic Patient"
              text="The 3D Digital Twin feature is mind-blowing. Seeing my health data visually helps me understand my condition so much better."
            />
            <TestimonialCard
              name="Priya Patel"
              role="Mother of two"
              text="Booking an ambulance for my father was seamless. The live tracking gave us peace of mind during a very stressful time."
            />
          </div>
        </div>
      </section>

      {/* --- HEALTH INSIGHTS SECTION (Replaces old CTA) --- */}
      <HealthInsightsSection />

      {/* --- FOOTER LINKS --- */}
      <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
            <p className="text-slate-500">Advanced healthcare management system powered by AI.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Services</h4>
            <ul className="space-y-4 text-slate-500">
              <li><a href="#" className="hover:text-teal-600">Ambulance</a></li>
              <li><a href="#" className="hover:text-teal-600">Telemedicine</a></li>
              <li><a href="#" className="hover:text-teal-600">Lab Tests</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4 text-slate-500">
              <li><a href="#" className="hover:text-teal-600">About Us</a></li>
              <li><a href="#" className="hover:text-teal-600">Careers</a></li>
              <li><a href="#" className="hover:text-teal-600">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Contact</h4>
            <div className="space-y-4 text-slate-500">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@shreemedicare.com</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 123 456 7890</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Mumbai, India</p>
            </div>
          </div>
        </div>
        <div className="text-center text-slate-400 text-sm">
          &copy; 2026 Omni Care. All rights reserved.
        </div>
      </footer>

      {showTriageModal && <TriageChatModal onClose={() => setShowTriageModal(false)} />}
    </div >
  );
}