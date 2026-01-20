-- Create custom_filters table for saving AI-generated filters
CREATE TABLE public.custom_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filter_criteria JSONB NOT NULL,
  original_query TEXT,
  matched_applicant_ids TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_filters ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on custom_filters"
ON public.custom_filters
FOR SELECT
USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert on custom_filters"
ON public.custom_filters
FOR INSERT
WITH CHECK (true);

-- Allow public update
CREATE POLICY "Allow public update on custom_filters"
ON public.custom_filters
FOR UPDATE
USING (true);

-- Allow public delete
CREATE POLICY "Allow public delete on custom_filters"
ON public.custom_filters
FOR DELETE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_filters_updated_at
BEFORE UPDATE ON public.custom_filters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();