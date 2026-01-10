import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Applicant, ApplicationResponse, JobCategory, ExperienceLevel, EmploymentType, ApplicantStatus } from '@/types/applicant';
import { Json } from '@/integrations/supabase/types';

const avatarColors = [
  'bg-primary',
  'bg-info',
  'bg-success',
  'bg-warning',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

const getAvatarColor = (index: number) => avatarColors[index % avatarColors.length];

interface DbApplicant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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
  application_responses: Json | null;
  job_id?: string | null;
  job_description?: string | null;
}

const transformDbApplicant = (
  dbApplicant: DbApplicant,
  index: number,
  source: 'talent-pool' | 'work-with-us'
): Applicant => {
  const initials = dbApplicant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Parse application responses from JSON
  const applicationResponses: ApplicationResponse[] = Array.isArray(dbApplicant.application_responses)
    ? (dbApplicant.application_responses as unknown as ApplicationResponse[])
    : [];

  return {
    id: dbApplicant.id,
    name: dbApplicant.name,
    initials,
    email: dbApplicant.email,
    phone: dbApplicant.phone || '',
    location: 'N/A',
    category: dbApplicant.category as JobCategory,
    experience: dbApplicant.experience_level as ExperienceLevel,
    employmentType: dbApplicant.employment_type as EmploymentType,
    status: dbApplicant.status as ApplicantStatus,
    skills: dbApplicant.skills || [],
    appliedDate: new Date(dbApplicant.applied_date).toLocaleDateString(),
    avatarColor: getAvatarColor(index),
    source,
    applicationResponses,
    education: dbApplicant.education || undefined,
    currentCompany: dbApplicant.current_company || undefined,
    linkedIn: dbApplicant.linkedin || undefined,
    portfolio: dbApplicant.portfolio || undefined,
    expectedSalary: dbApplicant.expected_salary || undefined,
    noticePeriod: dbApplicant.notice_period || undefined,
    summary: dbApplicant.summary || undefined,
    jobId: dbApplicant.job_id || undefined,
    jobDescription: dbApplicant.job_description || undefined,
  };
};

export const useTalentPoolApplicants = () => {
  return useQuery({
    queryKey: ['talent-pool-applicants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('talent_pool_applicants')
        .select('*')
        .order('applied_date', { ascending: false });

      if (error) throw error;

      return (data as unknown as DbApplicant[]).map((applicant, index) =>
        transformDbApplicant(applicant, index, 'talent-pool')
      );
    },
  });
};

export const useWorkWithUsApplicants = () => {
  return useQuery({
    queryKey: ['work-with-us-applicants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_with_us_applicants')
        .select('*')
        .order('applied_date', { ascending: false });

      if (error) throw error;

      return (data as unknown as DbApplicant[]).map((applicant, index) =>
        transformDbApplicant(applicant, index, 'work-with-us')
      );
    },
  });
};

export const useUpdateApplicantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      source,
    }: {
      id: string;
      status: string;
      source: 'talent-pool' | 'work-with-us';
    }) => {
      const table =
        source === 'talent-pool'
          ? 'talent_pool_applicants'
          : 'work_with_us_applicants';

      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },

    // Optimistic update: prevents the card snapping back while the DB update + refetch happens.
    onMutate: async ({ id, status, source }) => {
      const key = [
        source === 'talent-pool'
          ? 'talent-pool-applicants'
          : 'work-with-us-applicants',
      ] as const;

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Applicant[]>(key);

      queryClient.setQueryData<Applicant[]>(key, (old) => {
        if (!old) return old;
        return old.map((a) => (a.id === id ? { ...a, status: status as ApplicantStatus } : a));
      });

      return { previous, key };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous && ctx.key) {
        queryClient.setQueryData(ctx.key, ctx.previous);
      }
    },

    onSettled: (_data, _err, vars, ctx) => {
      // Still refetch to ensure we're in sync with the database.
      const key = ctx?.key ?? [vars.source === 'talent-pool' ? 'talent-pool-applicants' : 'work-with-us-applicants'];
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
};
