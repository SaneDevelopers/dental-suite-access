import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { DoctorsSection } from "@/components/landing/DoctorsSection";
import { EventsSection } from "@/components/landing/EventsSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { User } from "@supabase/supabase-js";
import { PatientDashboard } from "@/components/dashboard/PatientDashboard";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is logged in, show patient dashboard
  if (user) {
    return <PatientDashboard />;
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <DoctorsSection />
      <EventsSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;