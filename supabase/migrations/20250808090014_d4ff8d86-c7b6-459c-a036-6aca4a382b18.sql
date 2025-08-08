-- Create medical reports table
CREATE TABLE public.medical_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  appointment_id UUID,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on medical_reports
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for medical reports
CREATE POLICY "Patients can view their own reports" 
ON public.medical_reports 
FOR SELECT 
USING (patient_id IN ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Doctors can manage all reports" 
ON public.medical_reports 
FOR ALL 
USING (true);

-- Create billing table
CREATE TABLE public.billing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  appointment_id UUID,
  prescription_id UUID,
  report_id UUID,
  service_type TEXT NOT NULL, -- 'prescription', 'report', 'consultation'
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on billing
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- RLS policies for billing
CREATE POLICY "Patients can view their own billing" 
ON public.billing 
FOR SELECT 
USING (patient_id IN ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Doctors can manage all billing" 
ON public.billing 
FOR ALL 
USING (true);

-- Create storage bucket for medical reports
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-reports', 'medical-reports', false);

-- Storage policies for medical reports
CREATE POLICY "Authenticated users can view medical reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'medical-reports' AND auth.role() = 'authenticated');

CREATE POLICY "Doctors can upload medical reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'medical-reports' AND auth.role() = 'authenticated');

CREATE POLICY "Doctors can update medical reports" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'medical-reports' AND auth.role() = 'authenticated');

-- Update clinic info name
UPDATE public.clinic_info SET name = 'Dentique The Dental Studio' WHERE id = (SELECT id FROM public.clinic_info LIMIT 1);