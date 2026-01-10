import { Applicant } from '@/types/applicant';

export function exportApplicantsToCSV(applicants: Applicant[], filename: string) {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Location',
    'Category',
    'Experience',
    'Employment Type',
    'Status',
    'Skills',
    'Applied Date',
    'Education',
    'Current Company',
    'LinkedIn',
    'Portfolio',
    'Expected Salary',
    'Notice Period',
    'Summary',
    'Job ID',
    'Job Description',
  ];

  const rows = applicants.map((applicant) => [
    applicant.name,
    applicant.email,
    applicant.phone || '',
    applicant.location,
    applicant.category,
    applicant.experience,
    applicant.employmentType,
    applicant.status,
    applicant.skills.join('; '),
    applicant.appliedDate,
    applicant.education || '',
    applicant.currentCompany || '',
    applicant.linkedIn || '',
    applicant.portfolio || '',
    applicant.expectedSalary || '',
    applicant.noticePeriod || '',
    applicant.summary || '',
    applicant.jobId || '',
    applicant.jobDescription || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
