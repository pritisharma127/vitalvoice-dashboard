-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view hospitals" ON public.hospitals;

-- Create a proper PERMISSIVE policy (default behavior)
CREATE POLICY "Anyone can view hospitals"
ON public.hospitals
FOR SELECT
TO public
USING (true);