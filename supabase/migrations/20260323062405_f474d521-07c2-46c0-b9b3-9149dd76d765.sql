
-- Delete existing anonymous scans (no user to associate them with)
DELETE FROM public.scan_history;

-- Add user_id column
ALTER TABLE public.scan_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can insert scans" ON public.scan_history;
DROP POLICY IF EXISTS "Anyone can view scans" ON public.scan_history;

-- Create user-scoped policies
CREATE POLICY "Users can insert own scans"
  ON public.scan_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own scans"
  ON public.scan_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON public.scan_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
