import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, Heart, Users, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClinicInfo {
  name: string;
  about_us: string;
  mission: string;
}

export const AboutSection = () => {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinicInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('clinic_info')
          .select('name, about_us, mission')
          .single();
        
        if (error) throw error;
        setClinicInfo(data);
      } catch (error) {
        console.error('Error fetching clinic info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicInfo();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Safe & Sterile",
      description: "State-of-the-art sterilization protocols ensuring your safety"
    },
    {
      icon: Award,
      title: "Expert Care",
      description: "Board-certified dentists with years of specialized experience"
    },
    {
      icon: Heart,
      title: "Patient-Centered",
      description: "Your comfort and satisfaction are our top priorities"
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Extended hours and weekend availability for your convenience"
    }
  ];

  const stats = [
    { icon: Users, number: "5000+", label: "Happy Patients" },
    { icon: Star, number: "4.9", label: "Patient Rating" },
    { icon: Award, number: "15+", label: "Years Experience" },
    { icon: Shield, number: "100%", label: "Safety Record" }
  ];

  if (loading) {
    return (
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              About {clinicInfo?.name || 'Our Clinic'}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              {clinicInfo?.about_us || 'We provide exceptional dental care with a focus on patient comfort and satisfaction.'}
            </p>
            
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-foreground mb-2">Our Mission</h3>
              <p className="text-muted-foreground">
                {clinicInfo?.mission || 'To provide exceptional dental care that enhances the health, function, and beauty of our patients\' smiles.'}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">Why Choose Us?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine advanced dental technology with compassionate care to deliver exceptional results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Advanced Technology</h4>
              <p className="text-sm text-muted-foreground">
                Latest dental equipment and digital imaging for precise diagnosis and treatment
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Gentle Care</h4>
              <p className="text-sm text-muted-foreground">
                Pain-free treatments with sedation options for anxious patients
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Expert Team</h4>
              <p className="text-sm text-muted-foreground">
                Board-certified dentists with specialized training and years of experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};