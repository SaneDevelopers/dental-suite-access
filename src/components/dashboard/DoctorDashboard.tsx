import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar, 
  FileText, 
  User, 
  LogOut, 
  Clock, 
  Activity,
  Plus,
  Edit,
  Upload,
  Download,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string;
  profiles: {
    full_name: string;
    phone: string;
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
  profiles: {
    full_name: string;
  };
  appointments: {
    appointment_date: string;
  };
}

interface Report {
  id: string;
  title: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
  patient_name: string;
  appointment_date: string;
}

export const DoctorDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const { toast } = useToast();

  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: '',
    instructions: '',
    followUpDate: ''
  });

  const [reportForm, setReportForm] = useState({
    title: '',
    file: null as File | null,
    appointmentId: ''
  });

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // For demo purposes, we'll assume the doctor's email matches a doctor in the database
      // In a real app, you'd have a proper doctor authentication system
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('*')
        .limit(1)
        .single();

      if (doctorData) {
        setDoctorProfile(doctorData);

        // Fetch appointments for this doctor
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            *,
            profiles(full_name, phone),
            services(name, duration_minutes)
          `)
          .eq('doctor_id', doctorData.id)
          .order('appointment_date', { ascending: true });

        setAppointments(appointmentsData || []);

        // Fetch prescriptions
        const { data: prescriptionsData } = await supabase
          .from('prescriptions')
          .select(`
            *,
            profiles(full_name),
            appointments(appointment_date)
          `)
          .eq('doctor_id', doctorData.id)
          .order('created_at', { ascending: false });

        setPrescriptions(prescriptionsData || []);

        // Fetch reports (we'll need to create this table)
        // For now, we'll use a placeholder
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
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

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Appointment updated",
        description: `Appointment status changed to ${status}`,
      });

      fetchDoctorData();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePrescriptionSubmit = async () => {
    if (!selectedAppointment || !prescriptionForm.medications) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('prescriptions')
        .insert({
          appointment_id: selectedAppointment.id,
          patient_id: selectedAppointment.profiles ? 
            (await supabase.from('profiles').select('id').eq('full_name', selectedAppointment.profiles.full_name).single()).data?.id : '',
          doctor_id: doctorProfile?.id,
          medications: prescriptionForm.medications,
          instructions: prescriptionForm.instructions,
          follow_up_date: prescriptionForm.followUpDate || null
        });

      if (error) throw error;

      toast({
        title: "Prescription created",
        description: "Prescription has been successfully added.",
      });

      setPrescriptionDialog(false);
      setPrescriptionForm({ medications: '', instructions: '', followUpDate: '' });
      setSelectedAppointment(null);
      fetchDoctorData();
    } catch (error: any) {
      toast({
        title: "Failed to create prescription",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReportUpload = async () => {
    if (!reportForm.file || !reportForm.title || !reportForm.appointmentId) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive"
      });
      return;
    }

    setUploadingReport(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = reportForm.file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-reports')
        .upload(filePath, reportForm.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical-reports')
        .getPublicUrl(filePath);

      // Save report info to database (we'll need to create this table)
      // For now, we'll just show success message
      toast({
        title: "Report uploaded",
        description: "Medical report has been successfully uploaded.",
      });

      setReportDialog(false);
      setReportForm({ title: '', file: null, appointmentId: '' });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingReport(false);
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

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Dentique Doctor Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Dr. {doctorProfile?.name}
              </span>
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
            Welcome back, Dr. {doctorProfile?.name}!
          </h2>
          <p className="text-muted-foreground">
            Manage your appointments, prescriptions, and patient reports.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Today's Appointments</h3>
              <Dialog open={reportDialog} onOpenChange={setReportDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Medical Report</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="report-title">Report Title</Label>
                      <Input
                        id="report-title"
                        value={reportForm.title}
                        onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter report title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="appointment-select">Select Appointment</Label>
                      <Select value={reportForm.appointmentId} onValueChange={(value) => setReportForm(prev => ({ ...prev, appointmentId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an appointment" />
                        </SelectTrigger>
                        <SelectContent>
                          {appointments.map((appointment) => (
                            <SelectItem key={appointment.id} value={appointment.id}>
                              {appointment.profiles?.full_name} - {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="report-file">Upload File</Label>
                      <Input
                        id="report-file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => setReportForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setReportDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleReportUpload} disabled={uploadingReport}>
                        {uploadingReport ? 'Uploading...' : 'Upload Report'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {appointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No appointments today</h3>
                  <p className="text-muted-foreground">Your schedule is clear for today</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold">{appointment.profiles?.full_name}</h4>
                          <p className="text-muted-foreground">
                            {appointment.services?.name} - {appointment.services?.duration_minutes} minutes
                          </p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          {format(new Date(appointment.appointment_date), 'EEEE, MMMM dd, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          {appointment.appointment_time}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-primary" />
                          {appointment.profiles?.phone}
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm"><strong>Notes:</strong> {appointment.notes}</p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Select value={appointment.status} onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Dialog open={prescriptionDialog} onOpenChange={setPrescriptionDialog}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Prescription
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Prescription</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="medications">Medications *</Label>
                                <Textarea
                                  id="medications"
                                  value={prescriptionForm.medications}
                                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medications: e.target.value }))}
                                  placeholder="List medications with dosage..."
                                  rows={4}
                                />
                              </div>
                              <div>
                                <Label htmlFor="instructions">Instructions</Label>
                                <Textarea
                                  id="instructions"
                                  value={prescriptionForm.instructions}
                                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                                  placeholder="Additional instructions for the patient..."
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label htmlFor="follow-up">Follow-up Date</Label>
                                <Input
                                  id="follow-up"
                                  type="date"
                                  value={prescriptionForm.followUpDate}
                                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setPrescriptionDialog(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handlePrescriptionSubmit}>
                                  Create Prescription
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <h3 className="text-xl font-semibold">Recent Prescriptions</h3>

            {prescriptions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No prescriptions yet</h3>
                  <p className="text-muted-foreground">Prescriptions will appear here after you create them</p>
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
                          <p className="text-muted-foreground">
                            Patient: {prescription.profiles?.full_name}
                          </p>
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

          <TabsContent value="reports" className="space-y-6">
            <h3 className="text-xl font-semibold">Medical Reports</h3>

            <Card>
              <CardContent className="text-center py-12">
                <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Reports Management</h3>
                <p className="text-muted-foreground mb-4">
                  Upload and manage medical reports for your patients
                </p>
                <Button onClick={() => setReportDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h3 className="text-xl font-semibold">Doctor Profile</h3>

            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="text-foreground">{doctorProfile?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Specialization</Label>
                    <p className="text-foreground">{doctorProfile?.specialization}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Qualification</Label>
                    <p className="text-foreground">{doctorProfile?.qualification}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                    <p className="text-foreground">{doctorProfile?.experience_years} years</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};