-- Add call_id column for tracking outbound call conversation IDs
ALTER TABLE public.call_transactions 
ADD COLUMN call_id text DEFAULT NULL;