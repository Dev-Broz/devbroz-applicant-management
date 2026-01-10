-- Create talent_pool_applicants table
CREATE TABLE public.talent_pool_applicants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  applied_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  education TEXT,
  current_company TEXT,
  linkedin TEXT,
  portfolio TEXT,
  expected_salary TEXT,
  notice_period TEXT,
  summary TEXT,
  application_responses JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_with_us_applicants table
CREATE TABLE public.work_with_us_applicants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  applied_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  education TEXT,
  current_company TEXT,
  linkedin TEXT,
  portfolio TEXT,
  expected_salary TEXT,
  notice_period TEXT,
  summary TEXT,
  application_responses JSONB DEFAULT '[]',
  job_id TEXT,
  job_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read for now, can be restricted later with auth)
ALTER TABLE public.talent_pool_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_with_us_applicants ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on talent_pool_applicants" 
ON public.talent_pool_applicants 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access on work_with_us_applicants" 
ON public.work_with_us_applicants 
FOR SELECT 
USING (true);

-- Create policies for public insert (for now)
CREATE POLICY "Allow public insert on talent_pool_applicants" 
ON public.talent_pool_applicants 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public insert on work_with_us_applicants" 
ON public.work_with_us_applicants 
FOR INSERT 
WITH CHECK (true);

-- Create policies for public update
CREATE POLICY "Allow public update on talent_pool_applicants" 
ON public.talent_pool_applicants 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public update on work_with_us_applicants" 
ON public.work_with_us_applicants 
FOR UPDATE 
USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_talent_pool_applicants_updated_at
BEFORE UPDATE ON public.talent_pool_applicants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_with_us_applicants_updated_at
BEFORE UPDATE ON public.work_with_us_applicants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();