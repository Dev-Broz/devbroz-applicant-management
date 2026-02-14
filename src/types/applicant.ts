export type JobCategory = 'Energy Consultant' | 'Renewable Energy' | 'Business Consultant' | 'Energy' | 'Water';

export type ExperienceLevel = '0-5 Years' | '5-10 Years' | '10-15 Years' | '15+ Years';

export type EmploymentType = 'Full-time' | 'Freelance';

export type ApplicantStatus = 'New Applicants' | 'Reviewed' | 'Shortlisted' | 'Archived';

export type DataSource = 'talent-pool' | 'work-with-us';

export interface ApplicationResponse {
  question: string;
  answer: string;
}

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
  jobTitle?: string;
  jobDescription?: string;
  source: DataSource;
  // Application form responses
  applicationResponses: ApplicationResponse[];
  education?: string;
  currentCompany?: string;
  linkedIn?: string;
  portfolio?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  summary?: string;
}

export interface FilterState {
  categories: JobCategory[];
  experienceLevels: ExperienceLevel[];
  employmentTypes: EmploymentType[];
  jobIds: string[];
  searchQuery: string;
}

export interface KanbanProject {
  id: string;
  name: string;
  createdAt: string;
  applicantIds: string[];
}
