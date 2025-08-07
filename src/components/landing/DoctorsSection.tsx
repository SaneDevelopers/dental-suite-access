import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  available_days: string[];
  available_hours: string;
}

export const DoctorsSection = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .order('experience_years', { ascending: false });
        
        if (error) throw error;
        setDoctors(data || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <section id="doctors" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Doctors</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="doctors" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet Our Expert Doctors
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our team of experienced dental professionals is dedicated to providing you with the highest quality care
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6">
                {/* Doctor Avatar */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Rating badge */}
                  <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs font-semibold flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    4.9
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-1">{doctor.name}</h3>
                  <Badge variant="secondary" className="mb-2">
                    {doctor.specialization}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-2">{doctor.qualification}</p>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Award className="h-4 w-4 mr-1" />
                    <span>{doctor.experience_years} years experience</span>
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-muted-foreground">Available:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {doctor.available_days.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {day.substring(0, 3)}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{doctor.available_hours}</span>
                  </div>
                </div>

                {/* Book Button */}
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/auth')}
                >
                  Book with {doctor.name.split(' ')[1]}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/auth')}
            className="px-8"
          >
            Book with Any Doctor
          </Button>
        </div>
      </div>
    </section>
  );
};