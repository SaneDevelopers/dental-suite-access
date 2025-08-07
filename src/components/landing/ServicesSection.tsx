import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Smile, Shield, Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

const getServiceIcon = (name: string) => {
  if (name.toLowerCase().includes('cleaning')) return Sparkles;
  if (name.toLowerCase().includes('whitening')) return Smile;
  if (name.toLowerCase().includes('consultation')) return Heart;
  if (name.toLowerCase().includes('root canal')) return Shield;
  return Heart;
};

export const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('price');
        
        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive dental care services designed to keep your smile healthy and beautiful
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = getServiceIcon(service.name);
            return (
              <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">${service.price}</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{service.duration_minutes} mins</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>Insurance accepted</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate('/auth')}
                  >
                    Book This Service
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="px-8"
          >
            Book Any Service Now
          </Button>
        </div>
      </div>
    </section>
  );
};