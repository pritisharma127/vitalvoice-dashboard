-- Add new columns to call_transactions table
ALTER TABLE public.call_transactions
ADD COLUMN donor_selected text DEFAULT 'NA',
ADD COLUMN whatsapp_sent text DEFAULT 'NA',
ADD COLUMN sms_sent text DEFAULT 'NA',
ADD COLUMN email_sent text DEFAULT 'NA';