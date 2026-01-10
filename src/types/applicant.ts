export type JobCategory = 'Energy Consultant' | 'Renewable Energy' | 'Business Consultant';

export type ExperienceLevel = 'Fresher' | '5-10 Years' | '10-15 Years' | '15+ Years';

export type EmploymentType = 'Full-time' | 'Freelance';

export type ApplicantStatus = 'New Applicants' | 'Reviewed' | 'Shortlisted' | 'Archived';

export type DataSource = 'talent-pool' | 'work-with-us';

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
  // Work With Us specific fields
  jobId?: string;
  jobDescription?: string;
  source: DataSource;
}

export interface FilterState {
  categories: JobCategory[];
  experienceLevels: ExperienceLevel[];
  employmentTypes: EmploymentType[];
  searchQuery: string;
}

export interface KanbanProject {
  id: string;
  name: string;
  createdAt: string;
  applicantIds: string[];
}
