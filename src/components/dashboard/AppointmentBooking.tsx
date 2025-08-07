import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  available_days: string[];
  available_hours: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

interface AppointmentBookingProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AppointmentBooking = ({ onBack, onSuccess }: AppointmentBookingProps) => {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  const [bookingData, setBookingData] = useState({
    doctorId: '',
    serviceId: '',
    date: undefined as Date | undefined,
    time: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);
      }

      // Fetch doctors
      const { data: doctorsData } = await supabase
        .from('doctors')
        .select('*')
        .order('name');
      setDoctors(doctorsData || []);

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleSubmit = async () => {
    if (!userProfile) {
      toast({
        title: "Error",
        description: "User profile not found. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!bookingData.doctorId || !bookingData.date || !bookingData.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: userProfile.id,
          doctor_id: bookingData.doctorId,
          service_id: bookingData.serviceId || null,
          appointment_date: format(bookingData.date, 'yyyy-MM-dd'),
          appointment_time: bookingData.time,
          notes: bookingData.notes,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Appointment booked!",
        description: "Your appointment has been successfully scheduled.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find(d => d.id === bookingData.doctorId);
  const selectedService = services.find(s => s.id === bookingData.serviceId);

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-primary">Book Appointment</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={cn(
                    "w-12 h-1 mx-2",
                    step > num ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Step {step} of 3: {
              step === 1 ? "Select Doctor & Service" :
              step === 2 ? "Choose Date & Time" :
              "Confirm Details"
            }
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Select Doctor & Service"}
              {step === 2 && "Choose Date & Time"}
              {step === 3 && "Confirm Your Appointment"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                {/* Doctor Selection */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Choose a Doctor</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {doctors.map((doctor) => (
                      <Card 
                        key={doctor.id} 
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          bookingData.doctorId === doctor.id ? "ring-2 ring-primary bg-primary/5" : ""
                        )}
                        onClick={() => setBookingData(prev => ({ ...prev, doctorId: doctor.id }))}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">Dr. {doctor.name}</h4>
                              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Available: {doctor.available_days.join(', ')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Hours: {doctor.available_hours}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Service Selection */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Choose a Service (Optional)</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card 
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        !bookingData.serviceId ? "ring-2 ring-primary bg-primary/5" : ""
                      )}
                      onClick={() => setBookingData(prev => ({ ...prev, serviceId: '' }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">General Consultation</h4>
                            <p className="text-sm text-muted-foreground">
                              Discuss during appointment
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {services.map((service) => (
                      <Card 
                        key={service.id} 
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          bookingData.serviceId === service.id ? "ring-2 ring-primary bg-primary/5" : ""
                        )}
                        onClick={() => setBookingData(prev => ({ ...prev, serviceId: service.id }))}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                              <Stethoscope className="h-5 w-5 text-accent" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{service.name}</h4>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm font-medium">${service.price}</span>
                                <span className="text-xs text-muted-foreground">{service.duration_minutes} min</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!bookingData.doctorId}
                  >
                    Next: Choose Date & Time
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Date Selection */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !bookingData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {bookingData.date ? format(bookingData.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={bookingData.date}
                        onSelect={(date) => setBookingData(prev => ({ ...prev, date }))}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Select Time</Label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={bookingData.time === time ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setBookingData(prev => ({ ...prev, time }))}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-base font-medium">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific concerns or requirements..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Previous
                  </Button>
                  <Button 
                    onClick={() => setStep(3)}
                    disabled={!bookingData.date || !bookingData.time}
                  >
                    Next: Confirm
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                {/* Confirmation */}
                <div className="space-y-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Appointment Summary</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Doctor</h4>
                        <p className="font-medium">Dr. {selectedDoctor?.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedDoctor?.specialization}</p>
                      </div>
                      
                      {selectedService && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Service</h4>
                          <p className="font-medium">{selectedService.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${selectedService.price} • {selectedService.duration_minutes} minutes
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Date & Time</h4>
                        <p className="font-medium">
                          {bookingData.date && format(bookingData.date, "EEEE, MMMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-muted-foreground">{bookingData.time}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Patient</h4>
                        <p className="font-medium">{userProfile?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{userProfile?.phone}</p>
                      </div>
                    </div>
                    
                    {bookingData.notes && (
                      <div className="mt-4 pt-4 border-t border-primary/20">
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Notes</h4>
                        <p className="text-sm">{bookingData.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Important Information:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Please arrive 15 minutes before your appointment</li>
                      <li>• Bring a valid ID and insurance card</li>
                      <li>• You will receive a confirmation email shortly</li>
                      <li>• For cancellations, please contact us 24 hours in advance</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Previous
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Booking...' : 'Confirm Appointment'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};