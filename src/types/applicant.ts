export type JobCategory = 'Energy Consultant' | 'Renewable Energy' | 'Business Consultant';

export type ExperienceLevel = 'Fresher' | '5-10 Years' | '10-15 Years' | '15+ Years';

export type EmploymentType = 'Full-time' | 'Freelance';

export type ApplicantStatus = 'New Applicants' | 'Reviewed' | 'Shortlisted' | 'Archived';

export interface Applicant {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  location: string;
  category: JobCategory;
  experience: ExperienceLevel;
  employmentType: EmploymentType;
  status: ApplicantStatus;
  skills: string[];
  appliedDate: string;
  avatarColor: string;
}

export interface FilterState {
  categories: JobCategory[];
  experienceLevels: ExperienceLevel[];
  employmentTypes: EmploymentType[];
  searchQuery: string;
}
