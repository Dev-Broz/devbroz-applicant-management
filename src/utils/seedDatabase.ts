import { supabase } from '@/integrations/supabase/client';
import { talentPoolApplicants, workWithUsApplicants } from '@/data/applicants';
import { Json } from '@/integrations/supabase/types';

interface ApplicantInsert {
  name: string;
  email: string;
  phone: string;
  category: string;
  experience_level: string;
  employment_type: string;
  skills: string[];
  status: string;
  applied_date: string;
  education: string | null;
  current_company: string | null;
  linkedin: string | null;
  portfolio: string | null;
  expected_salary: string | null;
  notice_period: string | null;
  summary: string | null;
  application_responses: Json;
  job_id?: string;
  job_description?: string;
}

const parseDate = (dateStr: string): string => {
  // Parse MM/DD/YYYY format
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const seedTalentPoolApplicants = async () => {
  const { data: existing } = await supabase
    .from('talent_pool_applicants')
    .select('id')
    .limit(1);

  if (existing && existing.length > 0) {
    console.log('Talent pool already has data, skipping seed');
    return;
  }

  const inserts: ApplicantInsert[] = talentPoolApplicants.map((applicant) => ({
    name: applicant.name,
    email: applicant.email,
    phone: applicant.phone || '',
    category: applicant.category,
    experience_level: applicant.experience,
    employment_type: applicant.employmentType,
    skills: applicant.skills,
    status: applicant.status,
    applied_date: parseDate(applicant.appliedDate),
    education: applicant.education || null,
    current_company: applicant.currentCompany || null,
    linkedin: applicant.linkedIn || null,
    portfolio: applicant.portfolio || null,
    expected_salary: applicant.expectedSalary || null,
    notice_period: applicant.noticePeriod || null,
    summary: applicant.summary || null,
    application_responses: applicant.applicationResponses as unknown as Json,
  }));

  const { error } = await supabase.from('talent_pool_applicants').insert(inserts);

  if (error) {
    console.error('Error seeding talent pool:', error);
    throw error;
  }

  console.log('Talent pool seeded successfully');
};

export const seedWorkWithUsApplicants = async () => {
  const { data: existing } = await supabase
    .from('work_with_us_applicants')
    .select('id')
    .limit(1);

  if (existing && existing.length > 0) {
    console.log('Work With Us already has data, skipping seed');
    return;
  }

  const inserts: ApplicantInsert[] = workWithUsApplicants.map((applicant) => ({
    name: applicant.name,
    email: applicant.email,
    phone: applicant.phone || '',
    category: applicant.category,
    experience_level: applicant.experience,
    employment_type: applicant.employmentType,
    skills: applicant.skills,
    status: applicant.status,
    applied_date: parseDate(applicant.appliedDate),
    education: applicant.education || null,
    current_company: applicant.currentCompany || null,
    linkedin: applicant.linkedIn || null,
    portfolio: applicant.portfolio || null,
    expected_salary: applicant.expectedSalary || null,
    notice_period: applicant.noticePeriod || null,
    summary: applicant.summary || null,
    application_responses: applicant.applicationResponses as unknown as Json,
    job_id: applicant.jobId,
    job_description: applicant.jobDescription,
  }));

  const { error } = await supabase.from('work_with_us_applicants').insert(inserts);

  if (error) {
    console.error('Error seeding work with us:', error);
    throw error;
  }

  console.log('Work With Us seeded successfully');
};

export const seedDatabase = async () => {
  await Promise.all([seedTalentPoolApplicants(), seedWorkWithUsApplicants()]);
};
