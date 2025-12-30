-- Add reason column to blood_requests table
ALTER TABLE public.blood_requests 
ADD COLUMN reason text DEFAULT NULL;

-- Create call_transactions table for voice agent call tracking
CREATE TABLE public.call_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id text NOT NULL,
  donor_id uuid NOT NULL REFERENCES public.donors(id),
  phone_number text NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  zip text NOT NULL,
  gender text DEFAULT 'NA',
  blood_type text NOT NULL,
  urgency text NOT NULL,
  reason text DEFAULT 'NA',
  hospital_location text NOT NULL,
  availability text DEFAULT 'NA',
  alternate_phone text DEFAULT 'NA',
  current_location text DEFAULT 'NA',
  pincode text DEFAULT 'NA',
  eligibility text DEFAULT 'NA',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.call_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for external APIs)
CREATE POLICY "Anyone can view call transactions" 
ON public.call_transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert call transactions" 
ON public.call_transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update call transactions" 
ON public.call_transactions 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_call_transactions_updated_at
BEFORE UPDATE ON public.call_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index on campaign_id for faster lookups
CREATE INDEX idx_call_transactions_campaign_id ON public.call_transactions(campaign_id);
CREATE INDEX idx_call_transactions_donor_id ON public.call_transactions(donor_id);