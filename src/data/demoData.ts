import { StructuredJob, UserProfile, CVDocument, JobMatchResult, ApplicationRecord, ApplicationDraft } from '../types/jobpilot';

export const DEMO_USER_PROFILE: UserProfile = {
  userId: 'demo-user-alex-morgan',
  fullName: 'Alex Morgan (Demo Profile)',
  email: 'alex.morgan.demo@example.com',
  phone: '+1 (555) 019-2834',
  countryOfResidence: 'United States',
  preferredJobTitles: ['Senior Full-Stack Engineer', 'Lead Frontend Engineer', 'TypeScript Backend Developer', 'Software Architect'],
  preferredCountries: ['United States', 'Canada', 'United Kingdom', 'Remote Worldwide'],
  remotePreference: 'remote',
  minimumAcceptableSalary: 130000,
  salaryCurrency: 'USD',
  preferredIndustries: ['Technology', 'Healthcare IT', 'Fintech', 'SaaS'],
  employmentType: 'full-time',
  skills: [
    'React', 'TypeScript', 'Node.js', 'Express', 'GraphQL', 'REST APIs',
    'PostgreSQL', 'Firestore', 'Docker', 'AWS', 'Tailwind CSS', 'CI/CD',
    'Jest', 'System Design'
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of Washington',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      graduationYear: 2018
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuingOrganization: 'Amazon Web Services',
      issueDate: '2022-04-15',
      credentialId: 'AWS-ASA-99482'
    },
    {
      id: 'cert-2',
      name: 'Professional Scrum Master I',
      issuingOrganization: 'Scrum.org',
      issueDate: '2021-09-10'
    }
  ],
  verifiedEmploymentHistory: [
    {
      id: 'emp-1',
      company: 'Apex Cloud Solutions',
      title: 'Senior Software Engineer',
      startDate: '2022-01-10',
      endDate: 'Present',
      isVerified: true,
      achievements: [
        'Architected high-throughput microservices handling 2M daily requests in TypeScript and Node.js.',
        'Reduced frontend bundle sizes by 42% using dynamic splitting in React & Vite.',
        'Mentored 4 junior engineers and introduced rigorous automated testing.'
      ],
      technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS']
    },
    {
      id: 'emp-2',
      company: 'Innovate Tech Labs',
      title: 'Full-Stack Developer',
      startDate: '2018-06-15',
      endDate: '2021-12-20',
      isVerified: true,
      achievements: [
        'Built real-time analytics dashboard with React, WebSockets, and Node.js backend.',
        'Migrated legacy monolithic application to modern cloud microservices.'
      ],
      technologies: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Express']
    }
  ],
  workAuthorisationInfo: 'Authorized to work in the United States (US Citizen). Does not require visa sponsorship.',
  excludedRolesAndIndustries: ['Gambling', 'Crypto MLM', 'Unpaid Internships', 'Sales Commission Only'],
  updatedAt: new Date().toISOString()
};

export const DEMO_MASTER_CV: CVDocument = {
  id: 'cv-master-1',
  userId: 'demo-user-alex-morgan',
  title: 'Alex Morgan - Master Software Engineering CV 2026 (Demo)',
  fileName: 'Alex_Morgan_Master_CV.pdf',
  fileType: 'pdf',
  isMaster: true,
  extractedSkills: DEMO_USER_PROFILE.skills,
  extractedSummary: 'Accomplished Senior Software Engineer with 6+ years of experience building scalable web applications with React, TypeScript, Node.js, and Cloud Infrastructure.',
  rawText: `ALEX MORGAN
Email: alex.morgan.demo@example.com | Phone: +1 (555) 019-2834 | Location: Seattle, WA (Open to Remote)

PROFESSIONAL SUMMARY
Senior Software Engineer with over 6 years of hands-on experience designing and delivering robust, full-stack enterprise web applications using TypeScript, React, Node.js, and cloud platforms. Proven track record of improving system performance by 40%+ and leading agile teams.

WORK EXPERIENCE
Apex Cloud Solutions | Senior Software Engineer (Jan 2022 – Present)
• Architected microservices handling 2M daily requests using TypeScript, Express, and PostgreSQL on AWS.
• Optimized React component render pipelines resulting in 42% bundle size reduction.
• Spearheaded automated CI/CD pipelines with GitHub Actions and Docker.

Innovate Tech Labs | Full-Stack Developer (Jun 2018 – Dec 2021)
• Built real-time web dashboards for healthcare telemetry with React, WebSocket, and Node.js.
• Collaborated with product designers to implement responsive, accessible UI components.

EDUCATION & CERTIFICATIONS
B.S. Computer Science | University of Washington (2018)
AWS Certified Solutions Architect – Associate (2022)`,
  createdAt: '2026-07-01T10:00:00.000Z'
};

export const DEMO_JOBS: StructuredJob[] = [
  {
    externalId: 'demo-job-1',
    title: 'Senior Full-Stack Engineer (React & TypeScript)',
    company: 'CloudSphere Technologies Inc. [Demo]',
    location: 'Remote (US/Canada)',
    country: 'United States',
    remoteType: 'remote',
    employmentType: 'full-time',
    salaryMinimum: 145000,
    salaryMaximum: 175000,
    salaryCurrency: 'USD',
    description: 'We are seeking a Senior Full-Stack Engineer with strong expertise in React, TypeScript, Node.js, and cloud architecture to lead core product features for our developer platform.',
    responsibilities: [
      'Design, build, and maintain enterprise web applications using React and Node.js.',
      'Collaborate with product and UX teams to define technical roadmaps.',
      'Optimize API endpoints and database queries for low latency.'
    ],
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Docker'],
    preferredSkills: ['GraphQL', 'AWS', 'Firestore', 'Tailwind CSS'],
    requiredEducation: ['Bachelor degree in CS or equivalent experience'],
    requiredExperienceYears: 5,
    workAuthorisation: 'US Citizen or Green Card holder',
    applicationDeadline: '2026-08-30',
    sourceName: 'Greenhouse Public API [Demo]',
    sourceUrl: 'https://boards.greenhouse.io/cloudsphere/jobs/4019283',
    applicationUrl: 'https://boards.greenhouse.io/cloudsphere/jobs/4019283#apply',
    datePosted: '2026-07-20',
    dateDiscovered: new Date().toISOString(),
    possibleScam: false,
    scamReasons: [],
    fingerprint: 'cloudsphere|senior full-stack engineer|remote|greenhouse',
    isDemo: true
  },
  {
    externalId: 'demo-job-2',
    title: 'Staff Frontend Engineer - Design Systems',
    company: 'HealthPulse Digital [Demo]',
    location: 'Seattle, WA (Hybrid)',
    country: 'United States',
    remoteType: 'hybrid',
    employmentType: 'full-time',
    salaryMinimum: 150000,
    salaryMaximum: 180000,
    salaryCurrency: 'USD',
    description: 'HealthPulse Digital is hiring a Lead/Staff Frontend Engineer to build and govern our cross-platform design system used by millions of patients.',
    responsibilities: [
      'Architect accessible component library with React, TypeScript, and Tailwind CSS.',
      'Establish frontend performance benchmarks and testing standards.',
      'Partner with product managers to deliver HIPAA-compliant interfaces.'
    ],
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Design Systems', 'Jest'],
    preferredSkills: ['Storybook', 'WCAG Accessibility', 'WebSockets'],
    requiredEducation: ['Bachelor degree in CS or related'],
    requiredExperienceYears: 6,
    workAuthorisation: 'Authorized to work in US',
    applicationDeadline: '2026-08-15',
    sourceName: 'Lever Postings API [Demo]',
    sourceUrl: 'https://jobs.lever.co/healthpulse/882194',
    applicationUrl: 'https://jobs.lever.co/healthpulse/882194/apply',
    datePosted: '2026-07-22',
    dateDiscovered: new Date().toISOString(),
    possibleScam: false,
    scamReasons: [],
    fingerprint: 'healthpulse|staff frontend engineer|seattle|lever',
    isDemo: true
  },
  {
    externalId: 'demo-job-3',
    title: 'Cloud DevOps & Platform Engineer',
    company: 'FinGlobal Payment Systems [Demo]',
    location: 'New York, NY (On-site)',
    country: 'United States',
    remoteType: 'onsite',
    employmentType: 'full-time',
    salaryMinimum: 135000,
    salaryMaximum: 160000,
    salaryCurrency: 'USD',
    description: 'Join FinGlobal to manage Kubernetes clusters, Terraform infrastructure, and automated security pipelines for financial transactions.',
    responsibilities: [
      'Maintain AWS infrastructure with Terraform and Kubernetes.',
      'Monitor CI/CD deployment pipelines and incident responses.',
      'Ensure SOC2 and PCI-DSS compliance across environments.'
    ],
    requiredSkills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
    preferredSkills: ['Python', 'Golang', 'Prometheus'],
    requiredEducation: ['Bachelor degree'],
    requiredExperienceYears: 4,
    workAuthorisation: 'US Work Clearance Required',
    applicationDeadline: '2026-08-20',
    sourceName: 'Company Career Page [Demo]',
    sourceUrl: 'https://finglobal.com/careers/devops-302',
    applicationUrl: 'https://finglobal.com/careers/devops-302/apply',
    datePosted: '2026-07-18',
    dateDiscovered: new Date().toISOString(),
    possibleScam: false,
    scamReasons: [],
    fingerprint: 'finglobal|cloud devops|new york|company',
    isDemo: true
  },
  {
    externalId: 'demo-job-4',
    title: 'Urgent: Remote Data Entry & Administrative Assistant ($85/hr)',
    company: 'Global Quick Income Enterprise [Demo - Flagged Scam]',
    location: 'Remote Any Location',
    country: 'United States',
    remoteType: 'remote',
    employmentType: 'part-time',
    salaryMinimum: 170000,
    salaryMaximum: 200000,
    salaryCurrency: 'USD',
    description: 'Earn $85 per hour working 10 hours a week! No experience needed. Must pay a $150 registration fee for company laptop setup via wire transfer. Contact HR exclusively on Telegram messenger.',
    responsibilities: [
      'Process forms online.',
      'Communicate via Telegram with supervisor.'
    ],
    requiredSkills: ['Typing', 'Telegram App'],
    preferredSkills: [],
    requiredEducation: [],
    requiredExperienceYears: 0,
    workAuthorisation: 'None needed',
    applicationDeadline: null,
    sourceName: 'Public Job Board [Demo]',
    sourceUrl: 'https://unverified-jobboard.example.com/posting/99201',
    applicationUrl: 'https://unverified-jobboard.example.com/posting/99201/apply',
    datePosted: '2026-07-24',
    dateDiscovered: new Date().toISOString(),
    possibleScam: true,
    scamReasons: [
      'Requires an upfront application or equipment registration fee ($150).',
      'Unrealistic earnings promised ($85/hr for non-technical data entry with 0 experience).',
      'Asks applicant to communicate exclusively via Telegram messaging app.',
      'Suspicious email domain and unverified employer identity.'
    ],
    fingerprint: 'global quick income|data entry|remote|flagged',
    isDemo: true
  },
  {
    externalId: 'demo-job-5',
    title: 'Principal AI Systems Architect (Ph.D. Required)',
    company: 'BioGen AI Therapeutics [Demo]',
    location: 'Boston, MA (Hybrid)',
    country: 'United States',
    remoteType: 'hybrid',
    employmentType: 'full-time',
    salaryMinimum: 210000,
    salaryMaximum: 260000,
    salaryCurrency: 'USD',
    description: 'Lead deep learning model architectures for novel molecular protein folding prediction. Must possess a Ph.D. in Computational Biology or Computer Science with 10+ publications in NeurIPS/ICML.',
    responsibilities: [
      'Train multi-billion parameter protein models on GPU clusters.',
      'Publish research in peer-reviewed scientific journals.',
      'Direct doctoral research fellows.'
    ],
    requiredSkills: ['PyTorch', 'Protein Folding', 'CUDA', 'Deep Learning Theory', 'Ph.D.'],
    preferredSkills: ['C++', 'Distributed Training'],
    requiredEducation: ['Ph.D. in Computational Biology, Computer Science, or Bioengineering'],
    requiredExperienceYears: 8,
    workAuthorisation: 'US Citizen or Permanent Resident',
    applicationDeadline: '2026-09-15',
    sourceName: 'Google Search Grounding [Demo]',
    sourceUrl: 'https://biogen-ai-therapeutics.example.com/jobs/ai-architect',
    applicationUrl: 'https://biogen-ai-therapeutics.example.com/jobs/ai-architect/apply',
    datePosted: '2026-07-15',
    dateDiscovered: new Date().toISOString(),
    possibleScam: false,
    scamReasons: [],
    fingerprint: 'biogen ai|principal ai architect|boston|google',
    isDemo: true
  }
];

export const DEMO_MATCHES: Record<string, JobMatchResult> = {
  'demo-job-1': {
    id: 'match-demo-1',
    userId: DEMO_USER_PROFILE.userId,
    jobId: 'demo-job-1',
    totalScore: 94,
    breakdown: {
      requiredSkillsScore: 35,
      experienceScore: 19,
      educationScore: 15,
      locationRemoteScore: 10,
      salaryScore: 10,
      industryRoleScore: 10,
      disqualificationPenalties: 0
    },
    strongMatches: [
      'Core Required Skills: React, TypeScript, Node.js, REST APIs, Docker',
      'Verified 6+ years experience meets the 5-year requirement',
      'B.S. in Computer Science satisfies education criteria',
      'Remote preference matches 100%',
      'Salary range ($145k-$175k) exceeds user minimum threshold ($130k)',
      'Work authorisation matched (US Citizen)'
    ],
    partialMatches: [
      'AWS cloud experience aligns with preferred skills'
    ],
    missingRequirements: [
      'GraphQL experience preferred (optional)'
    ],
    disqualifyingRequirements: [],
    recommendation: 'Strongly Recommended',
    explanation: 'Exceptional 94% alignment. The vacancy matches your verified TypeScript/React background, remote preference, and salary expectations without any disqualifying factors.',
    calculatedAt: new Date().toISOString()
  },
  'demo-job-2': {
    id: 'match-demo-2',
    userId: DEMO_USER_PROFILE.userId,
    jobId: 'demo-job-2',
    totalScore: 86,
    breakdown: {
      requiredSkillsScore: 33,
      experienceScore: 20,
      educationScore: 15,
      locationRemoteScore: 8,
      salaryScore: 10,
      industryRoleScore: 10,
      disqualificationPenalties: 0
    },
    strongMatches: [
      'Verified React, TypeScript, Tailwind CSS, Jest background',
      '6 years experience aligns directly with Staff/Lead level',
      'Location in Seattle WA aligns with hybrid option'
    ],
    partialMatches: [
      'Design systems experience demonstrated at Apex Cloud Solutions'
    ],
    missingRequirements: [
      'WCAG Accessibility certification preferred'
    ],
    disqualifyingRequirements: [],
    recommendation: 'Strongly Recommended',
    explanation: 'High 86% match. Located in your home city of Seattle with hybrid flexibility and strong compensation.',
    calculatedAt: new Date().toISOString()
  },
  'demo-job-3': {
    id: 'match-demo-3',
    userId: DEMO_USER_PROFILE.userId,
    jobId: 'demo-job-3',
    totalScore: 68,
    breakdown: {
      requiredSkillsScore: 20,
      experienceScore: 18,
      educationScore: 15,
      locationRemoteScore: 5,
      salaryScore: 10,
      industryRoleScore: 0,
      disqualificationPenalties: 0
    },
    strongMatches: [
      'AWS & Docker skills match required criteria',
      'Salary ($135k-$160k) meets minimum requirement'
    ],
    partialMatches: [
      'DevOps experience from microservices deployment'
    ],
    missingRequirements: [
      'Kubernetes & Terraform mastery missing from verified CV',
      'On-site requirement in New York (differs from remote preference)'
    ],
    disqualifyingRequirements: [],
    recommendation: 'Recommended with Caveats',
    explanation: '68% match. While salary and AWS skills match, the role requires on-site work in NYC and deep Terraform/Kubernetes expertise.',
    calculatedAt: new Date().toISOString()
  },
  'demo-job-4': {
    id: 'match-demo-4',
    userId: DEMO_USER_PROFILE.userId,
    jobId: 'demo-job-4',
    totalScore: 15,
    breakdown: {
      requiredSkillsScore: 5,
      experienceScore: 0,
      educationScore: 10,
      locationRemoteScore: 10,
      salaryScore: 10,
      industryRoleScore: 0,
      disqualificationPenalties: -20
    },
    strongMatches: ['Remote work structure'],
    partialMatches: [],
    missingRequirements: ['Irrelevant technical skill set'],
    disqualifyingRequirements: ['Flagged Scam Indicators'],
    recommendation: 'Not Recommended',
    explanation: 'WARNING: Flagged as a potential scam. Asks for $150 registration fee and Telegram communication. Do not apply.',
    calculatedAt: new Date().toISOString()
  },
  'demo-job-5': {
    id: 'match-demo-5',
    userId: DEMO_USER_PROFILE.userId,
    jobId: 'demo-job-5',
    totalScore: 42,
    breakdown: {
      requiredSkillsScore: 10,
      experienceScore: 12,
      educationScore: 0,
      locationRemoteScore: 5,
      salaryScore: 10,
      industryRoleScore: 5,
      disqualificationPenalties: -25
    },
    strongMatches: ['High salary tier ($210k+)'],
    partialMatches: ['General software architecture'],
    missingRequirements: ['PyTorch, CUDA, Protein Folding research'],
    disqualifyingRequirements: ['Missing mandatory Ph.D. degree in Computational Biology'],
    recommendation: 'Not Recommended',
    explanation: '42% score. Disqualified due to missing mandatory Ph.D. in Computational Biology requirement.',
    calculatedAt: new Date().toISOString()
  }
};

export const DEMO_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'app-demo-1',
    userId: DEMO_USER_PROFILE.userId,
    jobId: 'demo-job-1',
    draftId: 'draft-demo-1',
    status: 'awaiting_approval',
    jobTitle: 'Senior Full-Stack Engineer (React & TypeScript)',
    companyName: 'CloudSphere Technologies Inc. [Demo]',
    appliedAt: null,
    followUpDate: '2026-08-05',
    notes: 'Draft cover letter and tailored CV prepared. Reviewing claims before final user approval.',
    officialApplicationUrl: 'https://boards.greenhouse.io/cloudsphere/jobs/4019283#apply',
    safetyChecksPassed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'app-demo-2',
    userId: DEMO_USER_PROFILE.userId,
    jobId: 'demo-job-2',
    draftId: 'draft-demo-2',
    status: 'interview',
    jobTitle: 'Staff Frontend Engineer - Design Systems',
    companyName: 'HealthPulse Digital [Demo]',
    appliedAt: '2026-07-21T14:30:00.000Z',
    followUpDate: '2026-07-28',
    notes: 'First technical interview scheduled for Thursday at 2 PM PST.',
    officialApplicationUrl: 'https://jobs.lever.co/healthpulse/882194/apply',
    safetyChecksPassed: true,
    createdAt: '2026-07-21T10:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

export const DEMO_DRAFT_1: ApplicationDraft = {
  id: 'draft-demo-1',
  userId: DEMO_USER_PROFILE.userId,
  jobId: 'demo-job-1',
  cvVersionId: 'cv-master-1',
  tailoredSummary: 'Senior Full-Stack Engineer with 6+ years of verified experience building high-throughput microservices and responsive web applications with React, TypeScript, Node.js, and Docker.',
  suggestedCvChanges: [
    'Emphasize microservices throughput (2M daily requests) at Apex Cloud Solutions.',
    'Highlight React bundle optimization (42% reduction) for frontend performance.',
    'Include AWS Solutions Architect certification prominently.'
  ],
  tailoredCoverLetter: `Dear Hiring Manager at CloudSphere Technologies,

I am writing to express my enthusiastic interest in the Senior Full-Stack Engineer position. With over six years of verified experience engineering scalable web applications using TypeScript, React, and Node.js, I am confident in my ability to contribute meaningfully to CloudSphere's core developer platform.

In my current role as Senior Software Engineer at Apex Cloud Solutions, I architected high-throughput Node.js and TypeScript microservices serving over two million daily requests, while maintaining strict reliability benchmarks. On the frontend, I redesigned our component render pipelines with React and Tailwind CSS, achieving a 42% reduction in initial bundle sizes.

Your requirement for robust cloud architecture and clean REST APIs aligns directly with my background. Having led automated deployment workflows with Docker and holding the AWS Certified Solutions Architect credential, I thrive in fast-paced teams committed to engineering excellence.

Thank you for your time and consideration. I welcome the opportunity to discuss how my technical experience aligns with your team's goals.

Sincerely,
Alex Morgan`,
  wordCount: 184,
  screeningAnswers: [
    {
      question: 'How many years of commercial experience do you have with TypeScript and Node.js?',
      suggestedAnswer: 'I have 6 years of verified commercial experience building full-stack applications with TypeScript and Node.js at Apex Cloud Solutions and Innovate Tech Labs.',
      requiresManualUserAnswer: false
    },
    {
      question: 'Do you currently reside in the United States and have authorization to work without sponsorship?',
      suggestedAnswer: 'Yes, I am based in the United States (Seattle, WA) and am a US Citizen authorized to work without sponsorship.',
      requiresManualUserAnswer: true,
      manualAnswerReason: 'Mandatory Legal Work-Authorisation Declaration required by user safety guidelines.'
    },
    {
      question: 'What is your minimum desired annual base salary?',
      suggestedAnswer: '$145,000 USD (Matches posted range $145k-$175k).',
      requiresManualUserAnswer: true,
      manualAnswerReason: 'Salary Commitment questions require explicit user approval.'
    }
  ],
  claimEvidence: [
    {
      generatedClaim: 'Architected microservices handling 2M daily requests using TypeScript & Node.js',
      supportingSource: 'Profile -> Employment History -> Apex Cloud Solutions (Verified)',
      confidence: 1.0,
      requiresUserConfirmation: false
    },
    {
      generatedClaim: 'Achieved a 42% bundle size reduction with React performance optimizations',
      supportingSource: 'Profile -> Employment History -> Apex Cloud Solutions (Verified)',
      confidence: 1.0,
      requiresUserConfirmation: false
    },
    {
      generatedClaim: 'AWS Certified Solutions Architect – Associate',
      supportingSource: 'Profile -> Certifications -> AWS-ASA-99482',
      confidence: 1.0,
      requiresUserConfirmation: false
    },
    {
      generatedClaim: 'US Citizen work authorisation',
      supportingSource: 'Profile -> Work Authorisation Info',
      confidence: 1.0,
      requiresUserConfirmation: true
    }
  ],
  missingInformation: [],
  isApproved: false,
  createdAt: new Date().toISOString()
};
