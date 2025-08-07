import { Button } from "@/components/ui/button";
import { Calendar, Star, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-40 right-32 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Star className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Trusted by 5000+ Patients</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Your Smile is Our
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Priority
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Experience exceptional dental care with our team of expert dentists. 
              From routine checkups to advanced treatments, we're here to keep your smile bright and healthy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate('/auth')}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Your Appointment
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Our Services
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2 mx-auto">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">5000+</div>
                <div className="text-sm text-muted-foreground">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mb-2 mx-auto">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-foreground">15+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2 mx-auto">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">4.9</div>
                <div className="text-sm text-muted-foreground">Patient Rating</div>
              </div>
            </div>
          </div>
          
          {/* Image placeholder */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 backdrop-blur-sm border border-border">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Modern Dental Care</h3>
                  <p className="text-muted-foreground">State-of-the-art equipment and techniques</p>
                </div>
              </div>
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Next Available</div>
                  <div className="text-xs text-muted-foreground">Today 2:30 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};