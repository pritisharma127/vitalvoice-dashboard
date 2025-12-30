-- Create enum for blood types
CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Create enum for urgency levels
CREATE TYPE public.urgency_level AS ENUM ('immediate', 'within_3_hours', 'within_6_hours', 'within_24_hours', 'within_48_hours');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'in_progress', 'fulfilled', 'cancelled');

-- Create enum for gender
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

-- Create donors table
CREATE TABLE public.donors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    blood_type blood_type NOT NULL,
    zipcode TEXT NOT NULL,
    address TEXT NOT NULL,
    area TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    age INTEGER,
    last_donation_date DATE,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blood_requests table
CREATE TABLE public.blood_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id TEXT NOT NULL UNIQUE,
    patient_name TEXT NOT NULL,
    patient_age INTEGER NOT NULL,
    patient_gender gender_type NOT NULL,
    blood_type blood_type NOT NULL,
    quantity_units INTEGER NOT NULL DEFAULT 1,
    urgency urgency_level NOT NULL,
    caretaker_name TEXT,
    caretaker_phone TEXT NOT NULL,
    caretaker_email TEXT NOT NULL,
    hospital_name TEXT NOT NULL,
    hospital_city TEXT NOT NULL,
    hospital_zipcode TEXT NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    admin_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hospitals table for network hospitals
CREATE TABLE public.hospitals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    zipcode TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for admin users
CREATE TABLE public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    hospital_id UUID REFERENCES public.hospitals(id),
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donors (authenticated users can view all donors)
CREATE POLICY "Authenticated users can view donors"
ON public.donors FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for blood_requests
CREATE POLICY "Authenticated users can view blood requests"
ON public.blood_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert blood requests"
ON public.blood_requests FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update blood requests"
ON public.blood_requests FOR UPDATE
TO authenticated
USING (true);

-- RLS Policies for hospitals
CREATE POLICY "Anyone can view hospitals"
ON public.hospitals FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_donors_updated_at
    BEFORE UPDATE ON public.donors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at
    BEFORE UPDATE ON public.blood_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default hospitals (Bangalore and Pune)
INSERT INTO public.hospitals (name, city, zipcode, address, phone) VALUES
('Apollo Hospital Bangalore', 'Bangalore', '560001', 'Bannerghatta Road', '+91-80-26304050'),
('Fortis Hospital Bangalore', 'Bangalore', '560076', 'Cunningham Road', '+91-80-66214444'),
('Manipal Hospital Bangalore', 'Bangalore', '560017', 'HAL Airport Road', '+91-80-25023456'),
('Ruby Hall Clinic Pune', 'Pune', '411001', 'Sasoon Road', '+91-20-26163391'),
('Jehangir Hospital Pune', 'Pune', '411001', 'Sasoon Road', '+91-20-66817000');

-- Insert 50 donors with Bangalore area zipcodes
INSERT INTO public.donors (name, phone_number, email, blood_type, zipcode, address, area, city, state, age, last_donation_date, is_available) VALUES
('Rajesh Kumar', '+91-9876543210', 'rajesh.kumar@email.com', 'A+', '560001', '123, MG Road', 'MG Road', 'Bangalore', 'Karnataka', 32, '2024-10-15', true),
('Priya Sharma', '+91-9876543211', 'priya.sharma@email.com', 'B+', '560002', '45, Brigade Road', 'Brigade Road', 'Bangalore', 'Karnataka', 28, '2024-09-20', true),
('Arun Patel', '+91-9876543212', 'arun.patel@email.com', 'O+', '560003', '78, Residency Road', 'Residency Road', 'Bangalore', 'Karnataka', 35, '2024-11-01', true),
('Deepa Reddy', '+91-9876543213', 'deepa.reddy@email.com', 'AB+', '560004', '22, Lavelle Road', 'Lavelle Road', 'Bangalore', 'Karnataka', 30, '2024-08-25', true),
('Suresh Naidu', '+91-9876543214', 'suresh.naidu@email.com', 'A-', '560005', '56, Richmond Road', 'Richmond Road', 'Bangalore', 'Karnataka', 40, '2024-07-10', true),
('Kavitha Rao', '+91-9876543215', 'kavitha.rao@email.com', 'B-', '560008', '89, Koramangala', 'Koramangala', 'Bangalore', 'Karnataka', 27, '2024-10-05', true),
('Mahesh Gowda', '+91-9876543216', 'mahesh.gowda@email.com', 'O-', '560011', '34, Jayanagar 4th Block', 'Jayanagar', 'Bangalore', 'Karnataka', 33, '2024-09-15', true),
('Lakshmi Iyer', '+91-9876543217', 'lakshmi.iyer@email.com', 'AB-', '560017', '67, HAL Layout', 'HAL Layout', 'Bangalore', 'Karnataka', 29, '2024-11-10', true),
('Venkatesh Murthy', '+91-9876543218', 'venkatesh.m@email.com', 'A+', '560034', '12, BTM Layout', 'BTM Layout', 'Bangalore', 'Karnataka', 38, '2024-08-20', true),
('Anitha Krishnan', '+91-9876543219', 'anitha.k@email.com', 'B+', '560038', '45, HSR Layout', 'HSR Layout', 'Bangalore', 'Karnataka', 31, '2024-10-25', true),
('Ramesh Hegde', '+91-9876543220', 'ramesh.hegde@email.com', 'O+', '560041', '78, Whitefield', 'Whitefield', 'Bangalore', 'Karnataka', 36, '2024-09-05', true),
('Sunitha Bhat', '+91-9876543221', 'sunitha.bhat@email.com', 'A+', '560043', '23, Marathahalli', 'Marathahalli', 'Bangalore', 'Karnataka', 26, '2024-11-15', true),
('Girish Shetty', '+91-9876543222', 'girish.shetty@email.com', 'B-', '560048', '56, Sarjapur Road', 'Sarjapur', 'Bangalore', 'Karnataka', 34, '2024-08-30', true),
('Meena Devi', '+91-9876543223', 'meena.devi@email.com', 'AB+', '560050', '89, Bellandur', 'Bellandur', 'Bangalore', 'Karnataka', 29, '2024-10-10', true),
('Prakash Shenoy', '+91-9876543224', 'prakash.s@email.com', 'O-', '560052', '34, Electronic City', 'Electronic City', 'Bangalore', 'Karnataka', 37, '2024-09-25', true),
('Vidya Rani', '+91-9876543225', 'vidya.rani@email.com', 'A-', '560055', '67, Banashankari', 'Banashankari', 'Bangalore', 'Karnataka', 28, '2024-11-05', true),
('Kiran Kumar', '+91-9876543226', 'kiran.kumar@email.com', 'B+', '560056', '12, JP Nagar', 'JP Nagar', 'Bangalore', 'Karnataka', 32, '2024-08-15', true),
('Rashmi Kamath', '+91-9876543227', 'rashmi.k@email.com', 'O+', '560060', '45, Basavangudi', 'Basavangudi', 'Bangalore', 'Karnataka', 30, '2024-10-20', true),
('Nagesh Rao', '+91-9876543228', 'nagesh.rao@email.com', 'AB-', '560064', '78, Malleswaram', 'Malleswaram', 'Bangalore', 'Karnataka', 39, '2024-09-10', true),
('Shruthi Prasad', '+91-9876543229', 'shruthi.p@email.com', 'A+', '560066', '23, Rajajinagar', 'Rajajinagar', 'Bangalore', 'Karnataka', 25, '2024-11-20', true),
('Harish Menon', '+91-9876543230', 'harish.menon@email.com', 'B+', '560068', '56, Vijayanagar', 'Vijayanagar', 'Bangalore', 'Karnataka', 33, '2024-08-25', true),
('Padma Lakshmi', '+91-9876543231', 'padma.l@email.com', 'O+', '560070', '89, Yeshwanthpur', 'Yeshwanthpur', 'Bangalore', 'Karnataka', 31, '2024-10-15', true),
('Santosh Pai', '+91-9876543232', 'santosh.pai@email.com', 'A-', '560072', '34, Hebbal', 'Hebbal', 'Bangalore', 'Karnataka', 35, '2024-09-20', true),
('Revathi Nair', '+91-9876543233', 'revathi.nair@email.com', 'AB+', '560076', '67, Cunningham Road', 'Cunningham Road', 'Bangalore', 'Karnataka', 27, '2024-11-10', true),
('Ganesh Kulkarni', '+91-9876543234', 'ganesh.k@email.com', 'B-', '560078', '12, Indiranagar', 'Indiranagar', 'Bangalore', 'Karnataka', 36, '2024-08-10', true),
('Yamuna Das', '+91-9876543235', 'yamuna.das@email.com', 'O-', '560080', '45, Ulsoor', 'Ulsoor', 'Bangalore', 'Karnataka', 29, '2024-10-05', true),
('Mohan Raj', '+91-9876543236', 'mohan.raj@email.com', 'A+', '560001', '78, Shivaji Nagar', 'Shivaji Nagar', 'Bangalore', 'Karnataka', 38, '2024-09-15', true),
('Saritha Menon', '+91-9876543237', 'saritha.m@email.com', 'B+', '560002', '23, Commercial Street', 'Commercial Street', 'Bangalore', 'Karnataka', 26, '2024-11-25', true),
('Vijay Shankar', '+91-9876543238', 'vijay.shankar@email.com', 'O+', '560008', '56, Koramangala 5th Block', 'Koramangala', 'Bangalore', 'Karnataka', 34, '2024-08-20', true),
('Uma Maheswari', '+91-9876543239', 'uma.m@email.com', 'AB+', '560011', '89, Jayanagar 9th Block', 'Jayanagar', 'Bangalore', 'Karnataka', 30, '2024-10-25', true),
('Nagaraj Patil', '+91-9876543240', 'nagaraj.p@email.com', 'A-', '560017', '34, Domlur', 'Domlur', 'Bangalore', 'Karnataka', 37, '2024-09-05', true),
('Bhavani Devi', '+91-9876543241', 'bhavani.d@email.com', 'B-', '560034', '67, BTM 2nd Stage', 'BTM Layout', 'Bangalore', 'Karnataka', 28, '2024-11-15', true),
('Srinivas Rao', '+91-9876543242', 'srinivas.rao@email.com', 'O-', '560038', '12, HSR Sector 2', 'HSR Layout', 'Bangalore', 'Karnataka', 33, '2024-08-30', true),
('Pushpa Kumari', '+91-9876543243', 'pushpa.k@email.com', 'AB-', '560041', '45, ITPL Road', 'Whitefield', 'Bangalore', 'Karnataka', 31, '2024-10-10', true),
('Ashok Kumar', '+91-9876543244', 'ashok.kumar@email.com', 'A+', '560043', '78, Kundalahalli', 'Marathahalli', 'Bangalore', 'Karnataka', 35, '2024-09-25', true),
('Jyothi Prasad', '+91-9876543245', 'jyothi.p@email.com', 'B+', '560048', '23, Kasavanahalli', 'Sarjapur', 'Bangalore', 'Karnataka', 27, '2024-11-05', true),
('Raghavendra Swamy', '+91-9876543246', 'raghavendra.s@email.com', 'O+', '560050', '56, Green Glen Layout', 'Bellandur', 'Bangalore', 'Karnataka', 39, '2024-08-15', true),
('Shobha Rani', '+91-9876543247', 'shobha.rani@email.com', 'A-', '560052', '89, Neeladri Nagar', 'Electronic City', 'Bangalore', 'Karnataka', 26, '2024-10-20', true),
('Chandrashekar', '+91-9876543248', 'chandra.s@email.com', 'AB+', '560055', '34, Kathriguppe', 'Banashankari', 'Bangalore', 'Karnataka', 34, '2024-09-10', true),
('Manjula Devi', '+91-9876543249', 'manjula.d@email.com', 'B-', '560056', '67, Sarakki', 'JP Nagar', 'Bangalore', 'Karnataka', 30, '2024-11-20', true),
('Prabhakar Rao', '+91-9876543250', 'prabhakar.r@email.com', 'O-', '560060', '12, DVG Road', 'Basavangudi', 'Bangalore', 'Karnataka', 36, '2024-08-25', true),
('Suma Hegde', '+91-9876543251', 'suma.hegde@email.com', 'A+', '560064', '45, 15th Cross', 'Malleswaram', 'Bangalore', 'Karnataka', 29, '2024-10-15', true),
('Ravi Varma', '+91-9876543252', 'ravi.varma@email.com', 'B+', '560066', '78, West of Chord Road', 'Rajajinagar', 'Bangalore', 'Karnataka', 32, '2024-09-20', true),
('Geetha Bai', '+91-9876543253', 'geetha.b@email.com', 'O+', '560068', '23, Chord Road', 'Vijayanagar', 'Bangalore', 'Karnataka', 28, '2024-11-10', true),
('Murali Krishna', '+91-9876543254', 'murali.k@email.com', 'AB-', '560070', '56, Tumkur Road', 'Yeshwanthpur', 'Bangalore', 'Karnataka', 35, '2024-08-10', true),
('Indira Devi', '+91-9876543255', 'indira.d@email.com', 'A-', '560072', '89, Outer Ring Road', 'Hebbal', 'Bangalore', 'Karnataka', 31, '2024-10-05', true),
('Balaji Murthy', '+91-9876543256', 'balaji.m@email.com', 'B-', '560076', '34, Palace Road', 'Cunningham Road', 'Bangalore', 'Karnataka', 37, '2024-09-15', true),
('Vanitha Rao', '+91-9876543257', 'vanitha.rao@email.com', 'O-', '560078', '67, 100 Feet Road', 'Indiranagar', 'Bangalore', 'Karnataka', 27, '2024-11-25', true),
('Sathish Kumar', '+91-9876543258', 'sathish.k@email.com', 'AB+', '560080', '12, MG Road Extension', 'Ulsoor', 'Bangalore', 'Karnataka', 33, '2024-08-20', true),
('Renuka Prasad', '+91-9876543259', 'renuka.p@email.com', 'A+', '560001', '45, Cubbon Park Area', 'MG Road', 'Bangalore', 'Karnataka', 30, '2024-10-25', true);

-- Enable realtime for blood_requests table
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests;