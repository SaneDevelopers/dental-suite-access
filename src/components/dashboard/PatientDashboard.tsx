import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  FileText, 
  User, 
  LogOut, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  Activity,
  Bell,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AppointmentBooking } from "./AppointmentBooking";

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string;
  doctors: {
    name: string;
    specialization: string;
  };
  services: {
    name: string;
    duration_minutes: number;
  };
}

interface Prescription {
  id: string;
  medications: string;
  instructions: string;
  follow_up_date: string;
  created_at: string;
  doctors: {
    name: string;
  };
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
}

export const PatientDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showBooking, setShowBooking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        // Fetch appointments
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            *,
            doctors(name, specialization),
            services(name, duration_minutes)
          `)
          .eq('patient_id', profileData.id)
          .order('appointment_date', { ascending: false });

        setAppointments(appointmentsData || []);

        // Fetch prescriptions
        const { data: prescriptionsData } = await supabase
          .from('prescriptions')
          .select(`
            *,
            doctors(name)
          `)
          .eq('patient_id', profileData.id)
          .order('created_at', { ascending: false });

        setPrescriptions(prescriptionsData || []);
      }

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('is_public', true)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date')
        .limit(5);

      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-accent text-accent-foreground';
      case 'scheduled': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-secondary text-secondary-foreground';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showBooking) {
    return (
      <AppointmentBooking 
        onBack={() => setShowBooking(false)}
        onSuccess={() => {
          setShowBooking(false);
          fetchUserData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Dentique Patient Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowBooking(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name || user?.email}!
          </h2>
          <p className="text-muted-foreground">
            Manage your appointments, view prescriptions, and stay updated with clinic events.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                      <p className="text-2xl font-bold">{appointments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-accent" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Prescriptions</p>
                      <p className="text-2xl font-bold">{prescriptions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
                      <p className="text-2xl font-bold">{events.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.slice(0, 3).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No appointments yet</p>
                    <Button className="mt-4" onClick={() => setShowBooking(true)}>
                      Book Your First Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.services?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Dr. {appointment.doctors?.name} • {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No upcoming events</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                        <Bell className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.event_date), 'MMM dd, yyyy')} 
                            {event.event_time && ` at ${event.event_time}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">My Appointments</h3>
              <Button onClick={() => setShowBooking(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </div>

            {appointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
                  <p className="text-muted-foreground mb-6">Book your first appointment to get started</p>
                  <Button onClick={() => setShowBooking(true)}>
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold">{appointment.services?.name}</h4>
                          <p className="text-muted-foreground">
                            Dr. {appointment.doctors?.name} - {appointment.doctors?.specialization}
                          </p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          {format(new Date(appointment.appointment_date), 'EEEE, MMMM dd, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          {appointment.appointment_time}
                        </div>
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-primary" />
                          {appointment.services?.duration_minutes} minutes
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm"><strong>Notes:</strong> {appointment.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <h3 className="text-xl font-semibold">My Prescriptions</h3>

            {prescriptions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No prescriptions yet</h3>
                  <p className="text-muted-foreground">Your prescriptions will appear here after appointments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold">Prescription</h4>
                          <p className="text-muted-foreground">Dr. {prescription.doctors?.name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(prescription.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium mb-2">Medications:</h5>
                          <p className="text-muted-foreground whitespace-pre-line">{prescription.medications}</p>
                        </div>
                        
                        {prescription.instructions && (
                          <div>
                            <h5 className="font-medium mb-2">Instructions:</h5>
                            <p className="text-muted-foreground whitespace-pre-line">{prescription.instructions}</p>
                          </div>
                        )}
                        
                        {prescription.follow_up_date && (
                          <div className="bg-primary/5 p-3 rounded-lg">
                            <p className="text-sm">
                              <strong>Follow-up Date:</strong> {format(new Date(prescription.follow_up_date), 'MMMM dd, yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h3 className="text-xl font-semibold">My Profile</h3>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="text-foreground">{profile?.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-foreground">{profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    <p className="text-foreground">
                      {profile?.date_of_birth 
                        ? format(new Date(profile.date_of_birth), 'MMMM dd, yyyy')
                        : 'Not provided'
                      }
                    </p>
                  </div>
                </div>
                
                {profile?.address && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <p className="text-foreground">{profile.address}</p>
                  </div>
                )}
                
                {(profile?.emergency_contact || profile?.emergency_phone) && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium mb-3">Emergency Contact</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {profile.emergency_contact && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Contact Name</Label>
                          <p className="text-foreground">{profile.emergency_contact}</p>
                        </div>
                      )}
                      {profile.emergency_phone && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Contact Phone</Label>
                          <p className="text-foreground">{profile.emergency_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};