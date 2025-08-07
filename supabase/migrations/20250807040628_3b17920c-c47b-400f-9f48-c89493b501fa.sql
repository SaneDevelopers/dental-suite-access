-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  qualification TEXT,
  experience_years INTEGER,
  image_url TEXT,
  available_days TEXT[], -- Array of days like ['Monday', 'Tuesday']
  available_hours TEXT, -- Like '9:00 AM - 5:00 PM'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  duration_minutes INTEGER, -- Duration in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  medications TEXT NOT NULL,
  instructions TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinic_info table
CREATE TABLE public.clinic_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Dental Care Clinic',
  address TEXT,
  phone TEXT,
  email TEXT,
  opening_hours TEXT,
  about_us TEXT,
  mission TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_info ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for doctors (public read)
CREATE POLICY "Anyone can view doctors" 
ON public.doctors 
FOR SELECT 
USING (true);

-- Create policies for services (public read)
CREATE POLICY "Anyone can view services" 
ON public.services 
FOR SELECT 
USING (true);

-- Create policies for appointments
CREATE POLICY "Users can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create policies for prescriptions
CREATE POLICY "Users can view their own prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create policies for events (public read)
CREATE POLICY "Anyone can view public events" 
ON public.events 
FOR SELECT 
USING (is_public = true);

-- Create policies for clinic_info (public read)
CREATE POLICY "Anyone can view clinic info" 
ON public.clinic_info 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.doctors (name, specialization, qualification, experience_years, available_days, available_hours) VALUES
('Dr. Sarah Johnson', 'General Dentistry', 'DDS, University of Dental Medicine', 8, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '9:00 AM - 5:00 PM'),
('Dr. Michael Chen', 'Orthodontics', 'DDS, MS in Orthodontics', 12, ARRAY['Monday', 'Wednesday', 'Friday', 'Saturday'], '10:00 AM - 6:00 PM'),
('Dr. Emily Rodriguez', 'Pediatric Dentistry', 'DDS, Pediatric Dentistry Residency', 6, ARRAY['Tuesday', 'Thursday', 'Friday', 'Saturday'], '8:00 AM - 4:00 PM');

INSERT INTO public.services (name, description, price, duration_minutes) VALUES
('General Consultation', 'Comprehensive dental examination and consultation', 150.00, 30),
('Teeth Cleaning', 'Professional dental cleaning and polishing', 120.00, 45),
('Teeth Whitening', 'Professional teeth whitening treatment', 300.00, 60),
('Root Canal Treatment', 'Endodontic treatment for infected teeth', 800.00, 90),
('Dental Filling', 'Composite or amalgam dental fillings', 200.00, 45),
('Orthodontic Consultation', 'Initial consultation for braces or aligners', 100.00, 30);

INSERT INTO public.events (title, description, event_date, event_time) VALUES
('Free Dental Check-up Camp', 'Free dental screenings for children and adults', '2024-02-15', '10:00:00'),
('Oral Health Awareness Seminar', 'Learn about maintaining good oral hygiene', '2024-02-28', '14:00:00'),
('Senior Citizens Dental Care', 'Special dental care session for seniors', '2024-03-10', '09:00:00');

INSERT INTO public.clinic_info (name, address, phone, email, opening_hours, about_us, mission) VALUES
('Bright Smile Dental Clinic', '123 Health Street, Medical District, City 12345', '+1 (555) 123-4567', 'info@brightsmile.com', 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 3:00 PM', 'At Bright Smile Dental Clinic, we provide comprehensive dental care with state-of-the-art technology and compassionate service. Our team of experienced dentists is committed to helping you achieve optimal oral health.', 'To provide exceptional dental care that enhances the health, function, and beauty of our patients'' smiles while creating a comfortable and welcoming environment.');