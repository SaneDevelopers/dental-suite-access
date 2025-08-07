import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DoctorDashboard as DoctorDashboardComponent } from "@/components/dashboard/DoctorDashboard";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate('/doctor-login');
        } else {
          setUser(session.user);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/doctor-login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <DoctorDashboardComponent />;
};

export default DoctorDashboard;

export { DoctorDashboard }