import { Applicant, AIFilterCriteria, ExperienceLevel, JobCategory } from '@/types/applicant';

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
): { 
  message: string; 
  data?: Record<string, unknown>;
  matchedApplicants?: Applicant[];
  filterCriteria?: AIFilterCriteria;
} {
  const lowerQuestion = question.toLowerCase();
  
  // Applications this week - Enhanced drill-down with experience levels and week comparison
  if (lowerQuestion.includes('this week') || lowerQuestion.includes('applications')) {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);
    
    const thisWeek = allApplicants.filter(a => {
      const appliedDate = new Date(a.appliedDate);
      return appliedDate >= weekAgo;
    });
    
    const lastWeek = allApplicants.filter(a => {
      const appliedDate = new Date(a.appliedDate);
      return appliedDate >= twoWeeksAgo && appliedDate < weekAgo;
    });
    
    const talentPool = thisWeek.filter(a => a.source === 'talent-pool');
    const workWithUs = thisWeek.filter(a => a.source === 'work-with-us');
    
    // Group by category for each source
    const groupByCategory = (applicants: Applicant[]) => {
      const categories: Record<string, number> = {};
      applicants.forEach(a => {
        categories[a.category] = (categories[a.category] || 0) + 1;
      });
      return Object.entries(categories)
        .sort((a, b) => b[1] - a[1]);
    };
    
    // Group by experience level
    const groupByExperience = (applicants: Applicant[]) => {
      const levels: Record<string, number> = {
        '🌱 Entry': 0,
        '💼 Mid-Level': 0,
        '⭐ Senior': 0
      };
      applicants.forEach(a => {
        if (a.experience === 'Fresher') levels['🌱 Entry']++;
        else if (a.experience === '5-10 Years') levels['💼 Mid-Level']++;
        else levels['⭐ Senior']++;
      });
      return Object.entries(levels)
        .filter(([, count]) => count > 0)
        .map(([level, count]) => `${level}: **${count}**`)
        .join('  ·  ') || '_None_';
    };
    
    const talentPoolCategories = groupByCategory(talentPool);
    const workWithUsCategories = groupByCategory(workWithUs);
    
    const formatCategoryBreakdown = (entries: [string, number][]) => {
      if (entries.length === 0) return '> _No applications_';
      return entries.map(([cat, count]) => `> • ${cat}: **${count}**`).join('\n');
    };
    
    const talentPoolBreakdown = formatCategoryBreakdown(talentPoolCategories);
    const workWithUsBreakdown = formatCategoryBreakdown(workWithUsCategories);
    
    // Week-over-week comparison
    let trendMessage = '';
    if (lastWeek.length > 0) {
      const change = ((thisWeek.length - lastWeek.length) / lastWeek.length) * 100;
      const changeIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      const changeText = change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
      trendMessage = `${changeIcon} **${changeText}** vs last week _(${lastWeek.length} → ${thisWeek.length})_`;
    } else {
      trendMessage = `📊 _No data from last week to compare_`;
    }
    
    const message = `## 📊 Weekly Applications Summary

**${thisWeek.length}** new applications this week

${trendMessage}

---

### 🎯 Talent Pool — ${talentPool.length} applications
${talentPoolBreakdown}

**By Experience:** ${groupByExperience(talentPool)}

---

### 💼 Work With Us — ${workWithUs.length} applications
${workWithUsBreakdown}

**By Experience:** ${groupByExperience(workWithUs)}`;
    
    return {
      message,
      data: { 
        total: thisWeek.length, 
        lastWeekTotal: lastWeek.length,
        talentPool: talentPool.length, 
        workWithUs: workWithUs.length,
        talentPoolByCategory: Object.fromEntries(talentPoolCategories),
        workWithUsByCategory: Object.fromEntries(workWithUsCategories)
      }
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
  
  // Client reports / presentations query
  if (lowerQuestion.includes('report') || lowerQuestion.includes('presentation')) {
    const reportingCandidates = allApplicants.filter(a => 
      a.skills.some(skill => 
        ['report', 'presentation', 'documentation', 'analysis', 'communication', 'client']
          .some(kw => skill.toLowerCase().includes(kw))
      )
    );
    return {
      message: `Found **${reportingCandidates.length} candidates** with experience preparing client reports or presentations for energy projects.`,
      data: { count: reportingCandidates.length },
      matchedApplicants: reportingCandidates,
      filterCriteria: { skills: ['report', 'presentation', 'documentation', 'client'] }
    };
  }

  // Client / stakeholder interaction query
  if (lowerQuestion.includes('client') || lowerQuestion.includes('stakeholder')) {
    const clientFacing = allApplicants.filter(a => 
      a.skills.some(skill => 
        ['client', 'stakeholder', 'communication', 'presentation', 'consulting', 'management']
          .some(kw => skill.toLowerCase().includes(kw))
      )
    );
    return {
      message: `Found **${clientFacing.length} candidates** with client or stakeholder interaction experience.`,
      data: { count: clientFacing.length },
      matchedApplicants: clientFacing,
      filterCriteria: { skills: ['client', 'stakeholder', 'communication', 'consulting'] }
    };
  }

  // Carbon accounting / emissions query
  if (lowerQuestion.includes('carbon') || lowerQuestion.includes('emissions')) {
    const carbonExperts = allApplicants.filter(a => 
      a.skills.some(skill => 
        ['carbon', 'emissions', 'ghg', 'sustainability', 'environmental', 'lifecycle', 'climate']
          .some(kw => skill.toLowerCase().includes(kw))
      )
    );
    return {
      message: `Found **${carbonExperts.length} candidates** with carbon accounting or emissions analysis experience.`,
      data: { count: carbonExperts.length },
      matchedApplicants: carbonExperts,
      filterCriteria: { skills: ['carbon', 'emissions', 'sustainability', 'environmental'] }
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

// Parse natural language query into structured filter criteria
export function parseAIQueryToFilter(
  query: string,
  applicants: Applicant[]
): {
  matches: Applicant[];
  filterCriteria: AIFilterCriteria;
  summary: string;
} {
  const lowerQuery = query.toLowerCase();
  const filterCriteria: AIFilterCriteria = {};
  const reasons: string[] = [];

  // Extract minimum experience years
  const yearsMatch = lowerQuery.match(/(\d+)\+?\s*years?/);
  if (yearsMatch) {
    filterCriteria.minExperienceYears = parseInt(yearsMatch[1]);
    reasons.push(`${filterCriteria.minExperienceYears}+ years experience`);
  }

  // Extract skills from query
  const skillKeywords = [
    'solar', 'solar cell', 'pv', 'photovoltaic', 'python', 'data analysis', 
    'project management', 'energy', 'wind', 'analytics', 'strategy', 
    'market analysis', 'business development', 'consulting', 'leadership',
    'grid', 'storage', 'battery', 'renewable', 'sustainability', 'carbon',
    'epc', 'design', 'engineering', 'installation',
    'client reports', 'presentations', 'reporting', 'stakeholder', 
    'client interaction', 'client-facing', 'carbon accounting', 
    'emissions analysis', 'emissions', 'ghg', 'lifecycle assessment'
  ];
  
  const matchedSkills = skillKeywords.filter(skill => lowerQuery.includes(skill));
  if (matchedSkills.length > 0) {
    filterCriteria.skills = matchedSkills;
    reasons.push(`skills in ${matchedSkills.slice(0, 3).join(', ')}`);
  }

  // Extract category hints
  if (lowerQuery.includes('renewable') || lowerQuery.includes('solar') || lowerQuery.includes('wind') || lowerQuery.includes('pv')) {
    filterCriteria.categories = ['Renewable Energy'];
    reasons.push('Renewable Energy category');
  } else if (lowerQuery.includes('energy consultant') || lowerQuery.includes('energy consulting')) {
    filterCriteria.categories = ['Energy Consultant'];
    reasons.push('Energy Consultant category');
  } else if (lowerQuery.includes('business') || lowerQuery.includes('strategy')) {
    filterCriteria.categories = ['Business Consultant'];
    reasons.push('Business Consultant category');
  }

  // Extract employment type
  if (lowerQuery.includes('full-time') || lowerQuery.includes('full time') || lowerQuery.includes('permanent')) {
    filterCriteria.employmentTypes = ['Full-time'];
    reasons.push('Full-time availability');
  } else if (lowerQuery.includes('freelance') || lowerQuery.includes('contract')) {
    filterCriteria.employmentTypes = ['Freelance'];
    reasons.push('Freelance availability');
  }

  // Filter applicants based on criteria
  let matches = applicants.filter(applicant => {
    let score = 0;

    // Experience filter
    if (filterCriteria.minExperienceYears) {
      const expYears = getExperienceYears(applicant.experience);
      if (expYears >= filterCriteria.minExperienceYears) {
        score += 2;
      } else {
        return false; // Hard filter on experience
      }
    }

    // Category filter
    if (filterCriteria.categories && filterCriteria.categories.length > 0) {
      if (filterCriteria.categories.includes(applicant.category)) {
        score += 3;
      }
    }

    // Skills filter
    if (filterCriteria.skills && filterCriteria.skills.length > 0) {
      const matchedApplicantSkills = applicant.skills.filter(skill =>
        filterCriteria.skills!.some(target => 
          skill.toLowerCase().includes(target.toLowerCase()) ||
          target.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (matchedApplicantSkills.length > 0) {
        score += matchedApplicantSkills.length * 2;
      }
    }

    // Employment type filter
    if (filterCriteria.employmentTypes && filterCriteria.employmentTypes.length > 0) {
      if (filterCriteria.employmentTypes.includes(applicant.employmentType)) {
        score += 1;
      }
    }

    return score > 0;
  });

  // Sort by relevance (experience level as tiebreaker)
  matches = matches.sort((a, b) => {
    const aExp = getExperienceYears(a.experience);
    const bExp = getExperienceYears(b.experience);
    return bExp - aExp;
  });

  // Limit to top 20 results
  matches = matches.slice(0, 20);

  // Generate summary
  const summary = reasons.length > 0
    ? `Found **${matches.length} candidates** matching: ${reasons.join(', ')}.`
    : `Found **${matches.length} candidates** matching your search.`;

  return { matches, filterCriteria, summary };
}

// Helper to convert experience level to approximate years
function getExperienceYears(experience: ExperienceLevel): number {
  switch (experience) {
    case 'Fresher': return 0;
    case '5-10 Years': return 7;
    case '10-15 Years': return 12;
    case '15+ Years': return 17;
    default: return 0;
  }
}

// Convert AIFilterCriteria to experience levels for dashboard filter
export function criteriaToExperienceLevels(minYears?: number): ExperienceLevel[] {
  if (!minYears) return [];
  const levels: ExperienceLevel[] = [];
  if (minYears <= 0) levels.push('Fresher');
  if (minYears <= 10) levels.push('5-10 Years');
  if (minYears <= 15) levels.push('10-15 Years');
  levels.push('15+ Years');
  return levels;
}
