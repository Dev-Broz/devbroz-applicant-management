import { Applicant, JobCategory, ExperienceLevel, EmploymentType } from '@/types/applicant';

/**
 * Map Firebase application document to frontend Applicant type
 * NEW SCHEMA: Handles both direct fields and answer_N format, with jobListing integration
 */
export function mapFirebaseToApplicant(firebaseDoc: any): Applicant {
  // Get job listing data if available
  const jobListing = firebaseDoc.jobListing || {};
  
  // Check for different field formats (direct fields, answer_N, or question_N)
  const getName = () => firebaseDoc.name || firebaseDoc.answer_1 || firebaseDoc.question_1 || 'Unknown';
  const getEmail = () => firebaseDoc.email || firebaseDoc.answer_2 || firebaseDoc.question_2 || '';
  const getPhone = () => firebaseDoc.phone || firebaseDoc.answer_3 || firebaseDoc.question_3 || '';
  const getLocation = () => firebaseDoc.location || firebaseDoc.answer_4 || firebaseDoc.question_4 || '';
  const getLinkedIn = () => firebaseDoc.linkedIn || firebaseDoc.answer_5 || firebaseDoc.question_5 || '';
  const getPortfolio = () => firebaseDoc.portfolio || firebaseDoc.answer_6 || firebaseDoc.question_6 || '';
  const getCurrentCompany = () => firebaseDoc.currentCompany || firebaseDoc.answer_7 || firebaseDoc.question_7 || '';
  const getJobTitle = () => firebaseDoc.jobTitle || firebaseDoc.answer_8 || firebaseDoc.question_8 || '';
  const getExperience = () => firebaseDoc.experience || firebaseDoc.answer_9 || firebaseDoc.question_9 || '';
  const getEducation = () => firebaseDoc.education || firebaseDoc.answer_10 || firebaseDoc.question_10 || '';
  const getSkills = () => firebaseDoc.skills || firebaseDoc.answer_12 || firebaseDoc.question_12 || '';
  const getExpectedSalary = () => firebaseDoc.expectedSalary || firebaseDoc.answer_17 || firebaseDoc.question_17 || '';
  const getNoticePeriod = () => firebaseDoc.noticePeriod || firebaseDoc.answer_18 || firebaseDoc.question_18 || '';
  const getEmploymentType = () => firebaseDoc.employmentType || firebaseDoc.answer_22 || firebaseDoc.question_22 || '';
  
  return {
    id: firebaseDoc.id,
    name: getName(),
    initials: generateInitials(getName()),
    email: getEmail(),
    phone: getPhone(),
    location: getLocation(),
    category: mapJobTitleToCategory(getJobTitle()),
    experience: mapExperience(getExperience()),
    employmentType: mapEmploymentType(getEmploymentType()),
    status: firebaseDoc.status || 'New Applicants',
    skills: parseSkills(getSkills()),
    appliedDate: formatFirebaseDate(firebaseDoc.appliedDate || firebaseDoc.created_at || firebaseDoc.snapshot_date),
    avatarColor: getAvatarColor(getName()),
    
    // Optional fields
    jobId: firebaseDoc.job_id,
    jobDescription: jobListing.job_desc || '',
    source: firebaseDoc.source || 'work-with-us',
    
    // Additional info
    education: getEducation(),
    currentCompany: getCurrentCompany(),
    linkedIn: getLinkedIn(),
    portfolio: getPortfolio(),
    expectedSalary: getExpectedSalary(),
    noticePeriod: getNoticePeriod(),
    
    // Application responses for detail modal (with job listing questions)
    applicationResponses: generateApplicationResponsesWithJobListing(firebaseDoc, jobListing),
  };
}

/**
 * Generate initials from name
 */
function generateInitials(name?: string): string {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Get avatar color based on name
 */
function getAvatarColor(name?: string): string {
  const colors = [
    'bg-primary',
    'bg-info',
    'bg-success',
    'bg-warning',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  
  const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Map job title to category
 */
function mapJobTitleToCategory(jobTitle?: string): JobCategory {
  if (!jobTitle) return 'Energy Consultant';
  
  const lower = jobTitle.toLowerCase();
  
  if (lower.includes('renewable') || lower.includes('solar') || lower.includes('wind') || lower.includes('energy')) {
    return 'Renewable Energy';
  }
  
  if (lower.includes('business') || lower.includes('management')) {
    return 'Business Consultant';
  }
  
  return 'Energy Consultant';
}

/**
 * Map experience string to ExperienceLevel
 */
function mapExperience(experience?: string): ExperienceLevel {
  if (!experience) return 'Fresher';
  
  const lower = experience.toLowerCase();
  
  if (lower.includes('fresher') || lower.includes('0-') || lower.includes('no experience')) {
    return 'Fresher';
  }
  if (lower.includes('5-10') || lower.includes('5 to 10')) {
    return '5-10 Years';
  }
  if (lower.includes('10-15') || lower.includes('10 to 15')) {
    return '10-15 Years';
  }
  if (lower.includes('15+') || lower.includes('15 plus') || lower.includes('more than 15')) {
    return '15+ Years';
  }
  
  return 'Fresher';
}

/**
 * Map employment type string
 */
function mapEmploymentType(employmentType?: string): EmploymentType {
  if (!employmentType) return 'Full-time';
  
  const lower = employmentType.toLowerCase();
  
  if (lower.includes('freelance') || lower.includes('contract')) {
    return 'Freelance';
  }
  
  return 'Full-time';
}

/**
 * Parse skills string to array
 */
function parseSkills(skills?: string): string[] {
  if (!skills) return [];
  
  return skills
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
}

/**
 * Format Firebase timestamp to ISO string
 */
function formatFirebaseDate(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  
  // Firebase Timestamp format
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toISOString();
  }
  
  // Already a date string
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toISOString();
  }
  
  // Date object
  return new Date(timestamp).toISOString();
}

/**
 * Generate application responses with job listing questions
 * NEW: Matches answers with actual job questions from job_listings collection
 */
function generateApplicationResponsesWithJobListing(firebaseDoc: any, jobListing: any = {}) {
  const responses = [];
  
  // Default question labels (fallback if no job listing)
  const defaultQuestionMap: Record<number, string> = {
    1: 'Full Name',
    2: 'Email Address',
    3: 'Phone Number',
    4: 'Location/City',
    5: 'LinkedIn Profile',
    6: 'Portfolio/Website',
    7: 'Current Company',
    8: 'Job Title',
    9: 'Years of Experience',
    10: 'Education Level',
    11: 'Field of Study',
    12: 'Relevant Skills',
    13: 'Why are you interested in this position?',
    14: 'What are your key strengths?',
    15: 'Describe a challenging project',
    16: 'Career Goals',
    17: 'Expected Salary Range',
    18: 'Notice Period',
    19: 'Availability to Start',
    20: 'Preferred Work Location',
    21: 'Willingness to Relocate',
    22: 'Employment Type Preference',
    23: 'How did you hear about us?',
    24: 'Additional Comments',
    25: 'Resume/CV URL',
  };
  
  for (let i = 1; i <= 25; i++) {
    // Check all possible answer field formats
    const answer = firebaseDoc[`answer_${i}`] || firebaseDoc[`question_${i}`];
    
    if (answer) {
      // Get question from job listing or use default
      const question = jobListing[`job_question_${i}`] || defaultQuestionMap[i] || `Question ${i}`;
      
      responses.push({
        question: question,
        answer: answer,
      });
    }
  }
  
  return responses;
}

/**
 * Generate application responses array (legacy support)
 */
function generateApplicationResponses(firebaseDoc: any) {
  return generateApplicationResponsesWithJobListing(firebaseDoc, {});
}

/**
 * Batch map multiple Firebase documents
 */
export function mapFirebaseListToApplicants(firebaseDocs: any[]): Applicant[] {
  return firebaseDocs.map(doc => mapFirebaseToApplicant(doc));
}
