import { Applicant } from '@/types/applicant';

// Semantic search query mappings
export const semanticSearchMappings: Record<string, { keywords: string[], categories?: string[], skills?: string[] }> = {
  'backend developer': {
    keywords: ['backend', 'developer', 'engineer', 'server', 'api'],
    skills: ['Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'API', 'Backend']
  },
  'startup experience': {
    keywords: ['startup', 'early stage', 'agile'],
    skills: ['Agile', 'Full-stack', 'MVP']
  },
  'solar project engineer': {
    keywords: ['solar', 'project', 'engineer', 'pv'],
    categories: ['Renewable Energy'],
    skills: ['Solar PV Design', 'Project Management', 'Solar']
  },
  'energy analyst': {
    keywords: ['energy', 'analyst', 'analysis', 'data'],
    categories: ['Business Consultant', 'Energy Consultant'],
    skills: ['Energy Analysis', 'Data Analysis', 'Analytics', 'Market Analysis']
  },
  'energy consultant': {
    keywords: ['energy', 'consultant', 'consulting'],
    categories: ['Energy Consultant']
  },
  'renewable energy': {
    keywords: ['renewable', 'green', 'sustainable', 'clean energy'],
    categories: ['Renewable Energy']
  },
  'business consultant': {
    keywords: ['business', 'strategy', 'management'],
    categories: ['Business Consultant']
  },
  'project manager': {
    keywords: ['project', 'manager', 'management', 'lead'],
    skills: ['Project Management', 'Team Leadership', 'Agile', 'Scrum']
  },
  'senior': {
    keywords: ['senior', 'lead', 'principal', 'experienced'],
    skills: ['Leadership', 'Team Management']
  }
};

// Check if a query is semantic (natural language)
export function isSemanticQuery(query: string): boolean {
  const words = query.toLowerCase().trim().split(/\s+/);
  // If query has 2+ words and contains descriptive terms, it's likely semantic
  if (words.length >= 2) {
    const semanticIndicators = ['with', 'who', 'has', 'having', 'experience', 'in', 'for', 'and', 'or', 'developer', 'engineer', 'analyst', 'consultant', 'manager', 'senior', 'junior', 'project'];
    return words.some(word => semanticIndicators.includes(word)) || 
           Object.keys(semanticSearchMappings).some(key => query.toLowerCase().includes(key));
  }
  return false;
}

// Get semantic matches for a query
export function getSemanticMatches(query: string, applicants: Applicant[]): Applicant[] {
  const lowerQuery = query.toLowerCase();
  
  // Find matching rules
  const matchingRules = Object.entries(semanticSearchMappings).filter(([key]) => 
    lowerQuery.includes(key) || key.split(' ').every(word => lowerQuery.includes(word))
  );

  if (matchingRules.length === 0) {
    return [];
  }

  // Combine all matching criteria
  const targetCategories: string[] = [];
  const targetSkills: string[] = [];
  
  matchingRules.forEach(([, rule]) => {
    if (rule.categories) targetCategories.push(...rule.categories);
    if (rule.skills) targetSkills.push(...rule.skills);
  });

  return applicants.filter(applicant => {
    let score = 0;
    
    // Category match
    if (targetCategories.length > 0 && targetCategories.includes(applicant.category)) {
      score += 2;
    }
    
    // Skills match
    if (targetSkills.length > 0) {
      const matchedSkills = applicant.skills.filter(skill => 
        targetSkills.some(target => skill.toLowerCase().includes(target.toLowerCase()))
      );
      score += matchedSkills.length;
    }
    
    return score > 0;
  });
}

// Chat response generators
export function generateChatResponse(
  question: string, 
  allApplicants: Applicant[]
): { message: string; data?: Record<string, unknown> } {
  const lowerQuestion = question.toLowerCase();
  
  // Applications this week
  if (lowerQuestion.includes('this week') || lowerQuestion.includes('applications')) {
    const thisWeek = allApplicants.filter(a => {
      const appliedDate = new Date(a.appliedDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return appliedDate >= weekAgo;
    });
    return {
      message: `There were **${thisWeek.length} applications** received in the past week. The breakdown includes ${thisWeek.filter(a => a.source === 'talent-pool').length} from Talent Pool and ${thisWeek.filter(a => a.source === 'work-with-us').length} from Work With Us applications.`,
      data: { count: thisWeek.length, talentPool: thisWeek.filter(a => a.source === 'talent-pool').length, workWithUs: thisWeek.filter(a => a.source === 'work-with-us').length }
    };
  }
  
  // Experience-based queries
  if (lowerQuestion.includes('experience') || lowerQuestion.includes('years')) {
    const yearsMatch = lowerQuestion.match(/(\d+)\+?\s*years?/);
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      const experienced = allApplicants.filter(a => {
        if (years >= 15) return a.experience === '15+ Years';
        if (years >= 10) return a.experience === '10-15 Years' || a.experience === '15+ Years';
        if (years >= 5) return ['5-10 Years', '10-15 Years', '15+ Years'].includes(a.experience);
        return true;
      });
      return {
        message: `Found **${experienced.length} candidates** with ${years}+ years of experience. Categories: ${[...new Set(experienced.map(a => a.category))].join(', ')}.`,
        data: { count: experienced.length, candidates: experienced.slice(0, 5).map(a => a.name) }
      };
    }
  }
  
  // Category breakdown
  if (lowerQuestion.includes('breakdown') || lowerQuestion.includes('category') || lowerQuestion.includes('categories')) {
    const categories: Record<string, number> = {};
    allApplicants.forEach(a => {
      categories[a.category] = (categories[a.category] || 0) + 1;
    });
    const breakdown = Object.entries(categories).map(([cat, count]) => `• ${cat}: ${count}`).join('\n');
    return {
      message: `**Category Breakdown:**\n${breakdown}\n\nTotal: ${allApplicants.length} applicants across ${Object.keys(categories).length} categories.`,
      data: { categories }
    };
  }
  
  // Shortlisted candidates
  if (lowerQuestion.includes('shortlist')) {
    const shortlisted = allApplicants.filter(a => a.status === 'Shortlisted');
    return {
      message: `There are **${shortlisted.length} shortlisted candidates**. Top candidates include: ${shortlisted.slice(0, 3).map(a => a.name).join(', ')}.`,
      data: { count: shortlisted.length, candidates: shortlisted.map(a => a.name) }
    };
  }
  
  // Status overview
  if (lowerQuestion.includes('status') || lowerQuestion.includes('pipeline') || lowerQuestion.includes('overview')) {
    const statuses: Record<string, number> = {};
    allApplicants.forEach(a => {
      statuses[a.status] = (statuses[a.status] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statuses).map(([status, count]) => `• ${status}: ${count}`).join('\n');
    return {
      message: `**Pipeline Status Overview:**\n${statusBreakdown}`,
      data: { statuses }
    };
  }
  
  // Skills query
  if (lowerQuestion.includes('skill') || lowerQuestion.includes('solar') || lowerQuestion.includes('python') || lowerQuestion.includes('energy')) {
    const skillKeywords = ['solar', 'python', 'energy', 'project management', 'data analysis'].filter(s => lowerQuestion.includes(s));
    if (skillKeywords.length > 0) {
      const matching = allApplicants.filter(a => 
        a.skills.some(skill => skillKeywords.some(kw => skill.toLowerCase().includes(kw)))
      );
      return {
        message: `Found **${matching.length} candidates** with skills matching "${skillKeywords.join(', ')}".`,
        data: { count: matching.length }
      };
    }
  }
  
  // Default response
  return {
    message: `I found **${allApplicants.length} total applicants** in your database. You can ask me about:\n• Application counts and trends\n• Candidate experience levels\n• Category breakdowns\n• Shortlisted candidates\n• Specific skills`
  };
}

// AI Shortlist matching
export interface ShortlistMatch {
  applicant: Applicant;
  score: number;
  reasons: string[];
}

export function getAIShortlistMatches(
  jobDescription: string, 
  applicants: Applicant[]
): ShortlistMatch[] {
  const lowerDesc = jobDescription.toLowerCase();
  
  const matches: ShortlistMatch[] = applicants.map(applicant => {
    let score = 0;
    const reasons: string[] = [];
    
    // Category matching
    if (lowerDesc.includes('solar') || lowerDesc.includes('renewable')) {
      if (applicant.category === 'Renewable Energy') {
        score += 30;
        reasons.push('Renewable Energy background');
      }
    }
    if (lowerDesc.includes('energy consultant') || lowerDesc.includes('consulting')) {
      if (applicant.category === 'Energy Consultant') {
        score += 30;
        reasons.push('Energy Consulting experience');
      }
    }
    if (lowerDesc.includes('business') || lowerDesc.includes('strategy')) {
      if (applicant.category === 'Business Consultant') {
        score += 30;
        reasons.push('Business Consulting expertise');
      }
    }
    
    // Experience matching
    if (lowerDesc.includes('senior') || lowerDesc.includes('lead') || lowerDesc.includes('10+ years')) {
      if (['10-15 Years', '15+ Years'].includes(applicant.experience)) {
        score += 25;
        reasons.push(`${applicant.experience} of experience`);
      }
    } else if (lowerDesc.includes('mid') || lowerDesc.includes('5+ years')) {
      if (['5-10 Years', '10-15 Years', '15+ Years'].includes(applicant.experience)) {
        score += 20;
        reasons.push(`${applicant.experience} of experience`);
      }
    }
    
    // Skills matching
    const skillKeywords = ['solar', 'pv', 'project management', 'data analysis', 'energy', 'python', 'analytics', 'market', 'strategy'];
    const matchedSkills = applicant.skills.filter(skill => 
      skillKeywords.some(kw => lowerDesc.includes(kw) && skill.toLowerCase().includes(kw))
    );
    if (matchedSkills.length > 0) {
      score += matchedSkills.length * 10;
      reasons.push(`Relevant skills: ${matchedSkills.slice(0, 3).join(', ')}`);
    }
    
    // Employment type matching
    if (lowerDesc.includes('full-time') || lowerDesc.includes('permanent')) {
      if (applicant.employmentType === 'Full-time') {
        score += 10;
        reasons.push('Available for full-time');
      }
    }
    if (lowerDesc.includes('freelance') || lowerDesc.includes('contract')) {
      if (applicant.employmentType === 'Freelance') {
        score += 10;
        reasons.push('Available for freelance/contract');
      }
    }
    
    // Boost for already shortlisted
    if (applicant.status === 'Shortlisted') {
      score += 5;
      reasons.push('Previously shortlisted');
    }
    
    return { applicant, score, reasons };
  });
  
  // Filter and sort by score
  return matches
    .filter(m => m.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

// Generate AI candidate summary
export function generateCandidateSummary(applicant: Applicant): {
  summary: string;
  strengths: string[];
  highlights: string[];
} {
  const strengths = applicant.skills.slice(0, 3);
  
  const highlights: string[] = [];
  if (applicant.currentCompany) {
    highlights.push(`Currently at ${applicant.currentCompany}`);
  }
  if (applicant.education) {
    highlights.push(applicant.education);
  }
  highlights.push(`${applicant.experience} experience`);
  highlights.push(`${applicant.employmentType} availability`);
  
  const summary = applicant.summary || 
    `${applicant.experience} ${applicant.category} professional with expertise in ${strengths.slice(0, 2).join(' and ')}. ${applicant.employmentType} candidate based in ${applicant.location}.`;
  
  return {
    summary,
    strengths,
    highlights: highlights.slice(0, 3)
  };
}
