import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
}

export const ContactSection = () => {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchClinicInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('clinic_info')
          .select('name, address, phone, email, opening_hours')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setFormData({ name: '', email: '', phone: '', message: '' });
    setSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <section id="contact" className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to take the first step towards a healthier smile? Contact us today to schedule your appointment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Visit Our Clinic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {clinicInfo?.address || '123 Health Street, Medical District, City 12345'}
                </p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="aspect-video bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Phone className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="font-semibold">Call Us</h3>
                  </div>
                  <p className="text-muted-foreground">{clinicInfo?.phone || '+1 (555) 123-4567'}</p>
                  <Button size="sm" className="mt-3" onClick={() => window.open(`tel:${clinicInfo?.phone}`)}>
                    Call Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Mail className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="font-semibold">Email Us</h3>
                  </div>
                  <p className="text-muted-foreground">{clinicInfo?.email || 'info@brightsmile.com'}</p>
                  <Button size="sm" className="mt-3" onClick={() => window.open(`mailto:${clinicInfo?.email}`)}>
                    Send Email
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-semibold">Office Hours</h3>
                </div>
                <p className="text-muted-foreground whitespace-pre-line">
                  {clinicInfo?.opening_hours || 'Mon-Fri: 8:00 AM - 6:00 PM\nSat: 9:00 AM - 3:00 PM\nSun: Closed'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-semibold text-primary">Emergency Care</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Dental emergencies can happen anytime. We offer emergency appointments for urgent cases.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/auth')}
                >
                  Book Emergency Appointment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your dental needs or ask any questions..."
                    rows={5}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>

                <div className="text-center pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Ready to book an appointment?
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment Online
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};