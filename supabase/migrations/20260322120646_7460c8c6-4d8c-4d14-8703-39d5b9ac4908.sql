-- Create scan_history table (anonymous usage, no auth)
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  detections JSONB NOT NULL DEFAULT '[]'::jsonb,
  detection_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert and select
CREATE POLICY "Anyone can insert scans"
  ON public.scan_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view scans"
  ON public.scan_history FOR SELECT
  TO anon, authenticated
  USING (true);

-- Index for recent scans
CREATE INDEX idx_scan_history_created_at ON public.scan_history(created_at DESC);
