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
  Eye,
  Trash2,
  DollarSign,
  UserPlus,
  Stethoscope,
  Star,
  TrendingUp
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

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  user_id: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string;
  patient_id: string;
  profiles: {
    id: string;
    full_name: string;
    phone: string;
  };
  services: {
    name: string;
    duration_minutes: number;
    price: number;
  };
}

interface Prescription {
  id: string;
  medications: string;
  instructions: string;
  follow_up_date: string;
  created_at: string;
  patient_id: string;
  profiles: {
    full_name: string;
  };
  appointments: {
    appointment_date: string;
  };
}

interface MedicalReport {
  id: string;
  title: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
  patient_id: string;
  profiles: {
    full_name: string;
  };
}

interface BillingRecord {
  id: string;
  service_type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export const DoctorDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [billing, setBilling] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [patientDialog, setPatientDialog] = useState(false);
  const [billingDialog, setBillingDialog] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const { toast } = useToast();

  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: '',
    instructions: '',
    followUpDate: '',
    patientId: '',
    charge: '',
    chargeDescription: ''
  });

  const [reportForm, setReportForm] = useState({
    title: '',
    file: null as File | null,
    patientId: '',
    charge: '',
    chargeDescription: ''
  });

  const [patientForm, setPatientForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    email: '',
    password: ''
  });

  const [billingForm, setBillingForm] = useState({
    patientId: '',
    serviceType: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Get the first doctor for demo purposes
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (doctorData) {
        setDoctorProfile(doctorData);

        // Fetch all patients
        const { data: patientsData } = await supabase
          .from('profiles')
          .select('*')
          .order('full_name');

        setPatients(patientsData || []);

        // Fetch appointments for this doctor
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            *,
            profiles(id, full_name, phone),
            services(name, duration_minutes, price)
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

        // Fetch medical reports
        const { data: reportsData } = await supabase
          .from('medical_reports')
          .select(`
            *,
            profiles(full_name)
          `)
          .eq('doctor_id', doctorData.id)
          .order('uploaded_at', { ascending: false });

        setReports(reportsData || []);

        // Fetch billing records
        const { data: billingData } = await supabase
          .from('billing')
          .select(`
            *,
            profiles(full_name)
          `)
          .eq('doctor_id', doctorData.id)
          .order('created_at', { ascending: false });

        setBilling(billingData || []);
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

  const handleAddPatient = async () => {
    if (!patientForm.fullName || !patientForm.email || !patientForm.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create auth user for patient
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: patientForm.email,
        password: patientForm.password,
        user_metadata: {
          full_name: patientForm.fullName,
          phone: patientForm.phone,
        }
      });

      if (authError) throw authError;

      // The profile will be created automatically via trigger
      toast({
        title: "Patient added successfully",
        description: `${patientForm.fullName} has been added to your patients.`,
      });

      setPatientDialog(false);
      setPatientForm({
        fullName: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        email: '',
        password: ''
      });
      fetchDoctorData();
    } catch (error: any) {
      toast({
        title: "Failed to add patient",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePrescriptionSubmit = async () => {
    if (!prescriptionForm.patientId || !prescriptionForm.medications) {
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
          patient_id: prescriptionForm.patientId,
          doctor_id: doctorProfile?.id,
          medications: prescriptionForm.medications,
          instructions: prescriptionForm.instructions,
          follow_up_date: prescriptionForm.followUpDate || null
        });

      if (error) throw error;

      // Add billing if there's a charge
      if (prescriptionForm.charge && parseFloat(prescriptionForm.charge) > 0) {
        await supabase
          .from('billing')
          .insert({
            patient_id: prescriptionForm.patientId,
            doctor_id: doctorProfile?.id,
            service_type: 'prescription',
            amount: parseFloat(prescriptionForm.charge),
            description: prescriptionForm.chargeDescription || 'Prescription fee',
            status: 'pending'
          });
      }

      toast({
        title: "Prescription created",
        description: "Prescription has been successfully added.",
      });

      setPrescriptionDialog(false);
      setPrescriptionForm({ 
        medications: '', 
        instructions: '', 
        followUpDate: '', 
        patientId: '',
        charge: '',
        chargeDescription: ''
      });
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
    if (!reportForm.file || !reportForm.title || !reportForm.patientId) {
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

      // Save report info to database
      const { error: dbError } = await supabase
        .from('medical_reports')
        .insert({
          patient_id: reportForm.patientId,
          doctor_id: doctorProfile?.id,
          title: reportForm.title,
          file_url: publicUrl,
          file_name: reportForm.file.name,
          file_type: reportForm.file.type
        });

      if (dbError) throw dbError;

      // Add billing if there's a charge
      if (reportForm.charge && parseFloat(reportForm.charge) > 0) {
        await supabase
          .from('billing')
          .insert({
            patient_id: reportForm.patientId,
            doctor_id: doctorProfile?.id,
            service_type: 'report',
            amount: parseFloat(reportForm.charge),
            description: reportForm.chargeDescription || 'Medical report fee',
            status: 'pending'
          });
      }

      toast({
        title: "Report uploaded",
        description: "Medical report has been successfully uploaded.",
      });

      setReportDialog(false);
      setReportForm({ 
        title: '', 
        file: null, 
        patientId: '',
        charge: '',
        chargeDescription: ''
      });
      fetchDoctorData();
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

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      toast({
        title: "Patient deleted",
        description: "Patient has been successfully removed.",
      });

      fetchDoctorData();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddBilling = async () => {
    if (!billingForm.patientId || !billingForm.amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('billing')
        .insert({
          patient_id: billingForm.patientId,
          doctor_id: doctorProfile?.id,
          service_type: billingForm.serviceType,
          amount: parseFloat(billingForm.amount),
          description: billingForm.description,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Billing record created",
        description: "Billing record has been successfully added.",
      });

      setBillingDialog(false);
      setBillingForm({
        patientId: '',
        serviceType: '',
        amount: '',
        description: ''
      });
      fetchDoctorData();
    } catch (error: any) {
      toast({
        title: "Failed to create billing record",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-accent text-accent-foreground';
      case 'scheduled': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-secondary text-secondary-foreground';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      case 'paid': return 'bg-accent text-accent-foreground';
      case 'pending': return 'bg-primary/10 text-primary';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getDashboardStats = () => {
    const todayAppointments = appointments.filter(apt => 
      new Date(apt.appointment_date).toDateString() === new Date().toDateString()
    ).length;
    
    const totalPatients = patients.length;
    const pendingBilling = billing.filter(bill => bill.status === 'pending').length;
    const totalRevenue = billing.filter(bill => bill.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);

    return { todayAppointments, totalPatients, pendingBilling, totalRevenue };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = getDashboardStats();

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Dentique Doctor Portal
                  </h1>
                  <p className="text-xs text-muted-foreground">Professional Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Dr. {doctorProfile?.name}</p>
                <p className="text-xs text-muted-foreground">{doctorProfile?.specialization}</p>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="group">
                <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-background border border-border">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Patients</span>
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Prescriptions</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, Dr. {doctorProfile?.name}!
              </h2>
              <p className="text-muted-foreground">
                Here's your practice overview for today.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">Today's Appointments</p>
                      <p className="text-3xl font-bold text-primary">{stats.todayAppointments}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-accent">Total Patients</p>
                      <p className="text-3xl font-bold text-accent">{stats.totalPatients}</p>
                    </div>
                    <User className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Pending Bills</p>
                      <p className="text-3xl font-bold text-orange-600">{stats.pendingBilling}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Revenue</p>
                      <p className="text-3xl font-bold text-green-600">${stats.totalRevenue}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Recent Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{appointment.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(appointment.appointment_date), 'MMM dd')} at {appointment.appointment_time}
                        </p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-accent" />
                    Recent Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {prescriptions.slice(0, 3).map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{prescription.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(prescription.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Appointments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-border">
                <thead>
                  <tr className="bg-background">
                    <th className="border border-border px-4 py-2 text-left">Patient</th>
                    <th className="border border-border px-4 py-2 text-left">Date</th>
                    <th className="border border-border px-4 py-2 text-left">Time</th>
                    <th className="border border-border px-4 py-2 text-left">Service</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-muted cursor-pointer">
                      <td className="border border-border px-4 py-2">{apt.profiles?.full_name}</td>
                      <td className="border border-border px-4 py-2">{format(new Date(apt.appointment_date), 'MMM dd, yyyy')}</td>
                      <td className="border border-border px-4 py-2">{apt.appointment_time}</td>
                      <td className="border border-border px-4 py-2">{apt.services?.name}</td>
                      <td className="border border-border px-4 py-2">
                        <Badge className={getStatusColor(apt.status)}>{apt.status}</Badge>
                      </td>
                      <td className="border border-border px-4 py-2 space-x-2">
                        {apt.status !== 'completed' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}>
                              Confirm
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}>
                              Cancel
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Patients</h2>
              <Button onClick={() => setPatientDialog(true)}><Plus className="mr-2 h-4 w-4" /> Add Patient</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-border">
                <thead>
                  <tr className="bg-background">
                    <th className="border border-border px-4 py-2 text-left">Name</th>
                    <th className="border border-border px-4 py-2 text-left">Phone</th>
                    <th className="border border-border px-4 py-2 text-left">DOB</th>
                    <th className="border border-border px-4 py-2 text-left">Address</th>
                    <th className="border border-border px-4 py-2 text-left">Emergency Contact</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-muted cursor-pointer">
                      <td className="border border-border px-4 py-2">{patient.full_name}</td>
                      <td className="border border-border px-4 py-2">{patient.phone}</td>
                      <td className="border border-border px-4 py-2">{patient.date_of_birth}</td>
                      <td className="border border-border px-4 py-2">{patient.address}</td>
                      <td className="border border-border px-4 py-2">{patient.emergency_contact} ({patient.emergency_phone})</td>
                      <td className="border border-border px-4 py-2 space-x-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedPatient(patient);
                          setPatientDialog(true);
                        }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeletePatient(patient.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Patient Dialog */}
            <Dialog open={patientDialog} onOpenChange={setPatientDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedPatient ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (selectedPatient) {
                    // Update patient logic here (not implemented)
                    setPatientDialog(false);
                  } else {
                    await handleAddPatient();
                  }
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={patientForm.fullName}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={patientForm.phone}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={patientForm.dateOfBirth}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={patientForm.address}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={patientForm.emergencyContact}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                      <Input
                        id="emergencyPhone"
                        value={patientForm.emergencyPhone}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      />
                    </div>
                    {!selectedPatient && (
                      <>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={patientForm.email}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={patientForm.password}
                            onChange={(e) => setPatientForm(prev => ({ ...prev, password: e.target.value }))}
                            required
                          />
                        </div>
                      </>
                    )}
                    <Button type="submit" className="w-full">
                      {selectedPatient ? 'Update Patient' : 'Add Patient'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Prescriptions</h2>
              <Button onClick={() => setPrescriptionDialog(true)}><Plus className="mr-2 h-4 w-4" /> New Prescription</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-border">
                <thead>
                  <tr className="bg-background">
                    <th className="border border-border px-4 py-2 text-left">Patient</th>
                    <th className="border border-border px-4 py-2 text-left">Medications</th>
                    <th className="border border-border px-4 py-2 text-left">Instructions</th>
                    <th className="border border-border px-4 py-2 text-left">Follow-up Date</th>
                    <th className="border border-border px-4 py-2 text-left">Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id} className="hover:bg-muted cursor-pointer">
                      <td className="border border-border px-4 py-2">{prescription.profiles?.full_name}</td>
                      <td className="border border-border px-4 py-2">{prescription.medications}</td>
                      <td className="border border-border px-4 py-2">{prescription.instructions}</td>
                      <td className="border border-border px-4 py-2">{prescription.follow_up_date ? format(new Date(prescription.follow_up_date), 'MMM dd, yyyy') : 'N/A'}</td>
                      <td className="border border-border px-4 py-2">{format(new Date(prescription.created_at), 'MMM dd, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Prescription Dialog */}
            <Dialog open={prescriptionDialog} onOpenChange={setPrescriptionDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Prescription</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handlePrescriptionSubmit();
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="patientId">Patient</Label>
                      <Select
                        onValueChange={(value) => setPrescriptionForm(prev => ({ ...prev, patientId: value }))}
                        value={prescriptionForm.patientId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>{patient.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="medications">Medications</Label>
                      <Textarea
                        id="medications"
                        value={prescriptionForm.medications}
                        onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medications: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={prescriptionForm.instructions}
                        onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="followUpDate">Follow-up Date</Label>
                      <Input
                        id="followUpDate"
                        type="date"
                        value={prescriptionForm.followUpDate}
                        onChange={(e) => setPrescriptionForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="charge">Charge (optional)</Label>
                      <Input
                        id="charge"
                        type="number"
                        min="0"
                        step="0.01"
                        value={prescriptionForm.charge}
                        onChange={(e) => setPrescriptionForm(prev => ({ ...prev, charge: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="chargeDescription">Charge Description</Label>
                      <Input
                        id="chargeDescription"
                        value={prescriptionForm.chargeDescription}
                        onChange={(e) => setPrescriptionForm(prev => ({ ...prev, chargeDescription: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" className="w-full">Create Prescription</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Medical Reports</h2>
              <Button onClick={() => setReportDialog(true)}><Plus className="mr-2 h-4 w-4" /> Upload Report</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-border">
                <thead>
                  <tr className="bg-background">
                    <th className="border border-border px-4 py-2 text-left">Title</th>
                    <th className="border border-border px-4 py-2 text-left">Patient</th>
                    <th className="border border-border px-4 py-2 text-left">Uploaded At</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-muted cursor-pointer">
                      <td className="border border-border px-4 py-2">{report.title}</td>
                      <td className="border border-border px-4 py-2">{report.profiles?.full_name}</td>
                      <td className="border border-border px-4 py-2">{format(new Date(report.uploaded_at), 'MMM dd, yyyy')}</td>
                      <td className="border border-border px-4 py-2 space-x-2">
                        <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-primary hover:underline">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </a>
                        <a href={report.file_url} download={report.file_name} className="inline-flex items-center space-x-1 text-primary hover:underline">
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Report Dialog */}
            <Dialog open={reportDialog} onOpenChange={setReportDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Medical Report</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleReportUpload();
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reportPatientId">Patient</Label>
                      <Select
                        onValueChange={(value) => setReportForm(prev => ({ ...prev, patientId: value }))}
                        value={reportForm.patientId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>{patient.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={reportForm.title}
                        onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="file">File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => setReportForm(prev => ({ ...prev, file: e.target.files ? e.target.files[0] : null }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="charge">Charge (optional)</Label>
                      <Input
                        id="charge"
                        type="number"
                        min="0"
                        step="0.01"
                        value={reportForm.charge}
                        onChange={(e) => setReportForm(prev => ({ ...prev, charge: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="chargeDescription">Charge Description</Label>
                      <Input
                        id="chargeDescription"
                        value={reportForm.chargeDescription}
                        onChange={(e) => setReportForm(prev => ({ ...prev, chargeDescription: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={uploadingReport}>
                      {uploadingReport ? 'Uploading...' : 'Upload Report'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Billing</h2>
              <Button onClick={() => setBillingDialog(true)}><Plus className="mr-2 h-4 w-4" /> Add Billing</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-border">
                <thead>
                  <tr className="bg-background">
                    <th className="border border-border px-4 py-2 text-left">Patient</th>
                    <th className="border border-border px-4 py-2 text-left">Service Type</th>
                    <th className="border border-border px-4 py-2 text-left">Amount</th>
                    <th className="border border-border px-4 py-2 text-left">Description</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.map((bill) => (
                    <tr key={bill.id} className="hover:bg-muted cursor-pointer">
                      <td className="border border-border px-4 py-2">{bill.profiles?.full_name}</td>
                      <td className="border border-border px-4 py-2">{bill.service_type}</td>
                      <td className="border border-border px-4 py-2">${bill.amount.toFixed(2)}</td>
                      <td className="border border-border px-4 py-2">{bill.description}</td>
                      <td className="border border-border px-4 py-2">
                        <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                      </td>
                      <td className="border border-border px-4 py-2">{format(new Date(bill.created_at), 'MMM dd, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Billing Dialog */}
            <Dialog open={billingDialog} onOpenChange={setBillingDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Billing Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddBilling();
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="billingPatientId">Patient</Label>
                      <Select
                        onValueChange={(value) => setBillingForm(prev => ({ ...prev, patientId: value }))}
                        value={billingForm.patientId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>{patient.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="serviceType">Service Type</Label>
                      <Input
                        id="serviceType"
                        value={billingForm.serviceType}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, serviceType: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={billingForm.amount}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, amount: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={billingForm.description}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" className="w-full">Add Billing</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
