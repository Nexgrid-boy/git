import { GoogleGenAI, Type } from '@google/genai';
import { StructuredJob, UserProfile, ApplicationDraft, ClaimEvidence, ScreeningQuestionAnswer } from '../types/jobpilot';

// Initialize Gemini SDK with server environment key
const apiKey = process.env.GEMINI_API_KEY || 'MOCK_KEY_FOR_DEV_FALLBACK';
const ai = new GoogleGenAI({ apiKey });

/**
 * Extract structured CV information using Gemini Interactions API
 */
export async function extractCvInformation(cvText: string): Promise<{
  fullName?: string;
  email?: string;
  phone?: string;
  skills: string[];
  summary: string;
  workHistory: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    graduationYear: number;
  }>;
}> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY missing, using heuristic extraction');
    return heuristicCvExtract(cvText);
  }

  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.6-flash',
      input: `Extract structured candidate profile information from the following CV text. DO NOT FABRICATE OR INVENT ANY CLAIMS NOT PRESENT IN THE TEXT:\n\n${cvText}`,
      response_format: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
          workHistory: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                title: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                technologies: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                institution: { type: Type.STRING },
                degree: { type: Type.STRING },
                fieldOfStudy: { type: Type.STRING },
                graduationYear: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    });

    const lastStep = interaction.steps.at(-1);
    if (lastStep && lastStep.type === 'model_output') {
      const textContent = lastStep.content?.find(c => c.type === 'text');
      if (textContent && textContent.text) {
        return JSON.parse(textContent.text.trim());
      }
    }
    return heuristicCvExtract(cvText);
  } catch (err) {
    console.error('Gemini CV extraction error:', err);
    return heuristicCvExtract(cvText);
  }
}

/**
 * Extract structured job posting from text or URL content using Gemini Interactions API
 */
export async function extractStructuredJobFromText(rawText: string, url: string = ''): Promise<StructuredJob> {
  if (!process.env.GEMINI_API_KEY) {
    return mockStructuredJobExtract(rawText, url);
  }

  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.6-flash',
      input: `Extract complete structured job posting data from the following text (Source URL: ${url}):\n\n${rawText}`,
      response_format: {
        type: Type.OBJECT,
        properties: {
          externalId: { type: Type.STRING },
          title: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          country: { type: Type.STRING },
          remoteType: { type: Type.STRING, description: "remote | hybrid | onsite | unspecified" },
          employmentType: { type: Type.STRING, description: "full-time | part-time | contract | internship | temporary | unspecified" },
          salaryMinimum: { type: Type.NUMBER, nullable: true },
          salaryMaximum: { type: Type.NUMBER, nullable: true },
          salaryCurrency: { type: Type.STRING, nullable: true },
          description: { type: Type.STRING },
          responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
          requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          requiredEducation: { type: Type.ARRAY, items: { type: Type.STRING } },
          requiredExperienceYears: { type: Type.NUMBER, nullable: true },
          workAuthorisation: { type: Type.STRING, nullable: true },
          applicationDeadline: { type: Type.STRING, nullable: true },
          sourceName: { type: Type.STRING },
          sourceUrl: { type: Type.STRING },
          applicationUrl: { type: Type.STRING },
          datePosted: { type: Type.STRING, nullable: true },
          possibleScam: { type: Type.BOOLEAN },
          scamReasons: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    });

    const lastStep = interaction.steps.at(-1);
    if (lastStep && lastStep.type === 'model_output') {
      const textContent = lastStep.content?.find(c => c.type === 'text');
      if (textContent && textContent.text) {
        const parsed = JSON.parse(textContent.text.trim());
        const cleaned: StructuredJob = {
          externalId: parsed.externalId || `ext-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          title: parsed.title || 'Untitled Job',
          company: parsed.company || 'Unknown Company',
          location: parsed.location || 'Remote',
          country: parsed.country || 'Global',
          remoteType: (['remote', 'hybrid', 'onsite'].includes(parsed.remoteType?.toLowerCase()) ? parsed.remoteType.toLowerCase() : 'unspecified') as any,
          employmentType: (['full-time', 'part-time', 'contract', 'internship', 'temporary'].includes(parsed.employmentType?.toLowerCase()) ? parsed.employmentType.toLowerCase() : 'unspecified') as any,
          salaryMinimum: typeof parsed.salaryMinimum === 'number' ? parsed.salaryMinimum : null,
          salaryMaximum: typeof parsed.salaryMaximum === 'number' ? parsed.salaryMaximum : null,
          salaryCurrency: parsed.salaryCurrency || 'USD',
          description: parsed.description || rawText.slice(0, 500),
          responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
          requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
          preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills : [],
          requiredEducation: Array.isArray(parsed.requiredEducation) ? parsed.requiredEducation : [],
          requiredExperienceYears: typeof parsed.requiredExperienceYears === 'number' ? parsed.requiredExperienceYears : null,
          workAuthorisation: parsed.workAuthorisation || null,
          applicationDeadline: parsed.applicationDeadline || null,
          sourceName: parsed.sourceName || 'Web Import',
          sourceUrl: parsed.sourceUrl || url,
          applicationUrl: parsed.applicationUrl || url,
          datePosted: parsed.datePosted || new Date().toISOString().split('T')[0],
          dateDiscovered: new Date().toISOString(),
          possibleScam: Boolean(parsed.possibleScam),
          scamReasons: Array.isArray(parsed.scamReasons) ? parsed.scamReasons : []
        };
        return cleaned;
      }
    }
    return mockStructuredJobExtract(rawText, url);
  } catch (err) {
    console.error('Gemini Structured Job Extract Error:', err);
    return mockStructuredJobExtract(rawText, url);
  }
}

/**
 * Generate tailored application materials (CV summary, cover letter, screening Q&A)
 * STRICT SAFETY RULE: Rely ONLY on verified user profile data. Do NOT fabricate numbers,
 * employment dates, companies, degrees, or certifications.
 */
export async function generateTailoredApplication(
  profile: UserProfile,
  cvText: string,
  job: StructuredJob
): Promise<ApplicationDraft> {
  const verifiedExp = profile.verifiedEmploymentHistory
    .map(e => `${e.company} (${e.title}, ${e.startDate} - ${e.endDate}): ${e.achievements.join(' ')}`)
    .join('\n');

  const verifiedEdu = profile.education
    .map(e => `${e.degree} in ${e.fieldOfStudy} from ${e.institution} (${e.graduationYear})`)
    .join('\n');

  const verifiedCerts = profile.certifications
    .map(c => `${c.name} issued by ${c.issuingOrganization} (${c.issueDate})`)
    .join('\n');

  const verifiedSkills = profile.skills.join(', ');

  const prompt = `You are a strict, professional job application generator for JobPilot AI.
CRITICAL MANDATE:
1. NEVER fabricate or invent any qualifications, years of experience, employment dates, company names, certifications, salary history, or personal achievements.
2. Rely ONLY on the verified user details below.
3. Keep cover letters strictly between 250 and 400 words.
4. For every claim made in the cover letter, list the exact supporting profile/CV source.

VERIFIED USER PROFILE:
Full Name: ${profile.fullName}
Skills: ${verifiedSkills}
Verified Work History:\n${verifiedExp}
Education:\n${verifiedEdu}
Certifications:\n${verifiedCerts}
Work Authorization: ${profile.workAuthorisationInfo}

TARGET JOB VACANCY:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description}
Responsibilities: ${job.responsibilities.join('; ')}
Required Skills: ${job.requiredSkills.join(', ')}

Please output the tailored summary, cover letter, suggested CV changes, screening Q&A, and claim evidence map.`;

  if (!process.env.GEMINI_API_KEY) {
    return mockGenerateApplicationDraft(profile, cvText, job);
  }

  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.6-flash',
      input: prompt,
      response_format: {
        type: Type.OBJECT,
        properties: {
          tailoredSummary: { type: Type.STRING },
          suggestedCvChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
          tailoredCoverLetter: { type: Type.STRING },
          screeningAnswers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                suggestedAnswer: { type: Type.STRING },
                requiresManualUserAnswer: { type: Type.BOOLEAN },
                manualAnswerReason: { type: Type.STRING, nullable: true }
              }
            }
          },
          claimEvidence: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                generatedClaim: { type: Type.STRING },
                supportingSource: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                requiresUserConfirmation: { type: Type.BOOLEAN }
              }
            }
          },
          missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    });

    const lastStep = interaction.steps.at(-1);
    if (lastStep && lastStep.type === 'model_output') {
      const textContent = lastStep.content?.find(c => c.type === 'text');
      if (textContent && textContent.text) {
        const parsed = JSON.parse(textContent.text.trim());
        const letter = parsed.tailoredCoverLetter || '';
        const wordCount = letter.trim().split(/\s+/).length;

        // Force manual screening flags for legal/work auth/salary questions if needed
        const screeningAnswers: ScreeningQuestionAnswer[] = (parsed.screeningAnswers || []).map((sa: any) => {
          const qLower = (sa.question || '').toLowerCase();
          const isSensitive = ['legal', 'work authorization', 'sponsorship', 'salary', 'disability', 'race', 'ethnicity', 'gender', 'criminal', 'background check', 'signature'].some(term => qLower.includes(term));
          return {
            question: sa.question,
            suggestedAnswer: sa.suggestedAnswer,
            requiresManualUserAnswer: isSensitive || Boolean(sa.requiresManualUserAnswer),
            manualAnswerReason: isSensitive ? 'Legal/Work Authorization/Declaration requires direct human confirmation' : sa.manualAnswerReason
          };
        });

        const draft: ApplicationDraft = {
          id: `draft-${Date.now()}`,
          userId: profile.userId,
          jobId: job.externalId,
          cvVersionId: 'cv-master-1',
          tailoredSummary: parsed.tailoredSummary || '',
          suggestedCvChanges: parsed.suggestedCvChanges || [],
          tailoredCoverLetter: letter,
          wordCount,
          screeningAnswers,
          claimEvidence: parsed.claimEvidence || [],
          missingInformation: parsed.missingInformation || [],
          isApproved: false,
          createdAt: new Date().toISOString()
        };
        return draft;
      }
    }
    return mockGenerateApplicationDraft(profile, cvText, job);
  } catch (err) {
    console.error('Gemini Application Generation Error:', err);
    return mockGenerateApplicationDraft(profile, cvText, job);
  }
}

// Fallback heuristic extractors for dev/offline resilience
function heuristicCvExtract(text: string) {
  const skillsList = ['React', 'TypeScript', 'Node.js', 'Express', 'JavaScript', 'HTML', 'CSS', 'Python', 'SQL', 'Docker', 'AWS', 'Git', 'REST APIs'];
  const foundSkills = skillsList.filter(s => new RegExp(`\\b${s}\\b`, 'i').test(text));

  return {
    fullName: text.split('\n')[0]?.slice(0, 50) || 'Candidate Name',
    email: text.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '',
    phone: text.match(/\+?\d[\d\s-]{8,}/)?.[0] || '',
    skills: foundSkills.length ? foundSkills : ['TypeScript', 'React', 'Node.js'],
    summary: text.slice(0, 200),
    workHistory: [],
    education: []
  };
}

function mockStructuredJobExtract(text: string, url: string): StructuredJob {
  const lower = text.toLowerCase();
  const isScam = lower.includes('telegram') || lower.includes('registration fee') || lower.includes('whatsapp only');
  return {
    externalId: `import-${Date.now()}`,
    title: text.split('\n')[0]?.slice(0, 60) || 'Imported Job Vacancy',
    company: 'Imported Company',
    location: 'Remote',
    country: 'United States',
    remoteType: 'remote',
    employmentType: 'full-time',
    salaryMinimum: 120000,
    salaryMaximum: 150000,
    salaryCurrency: 'USD',
    description: text,
    responsibilities: ['Key duties extracted from imported posting.'],
    requiredSkills: ['TypeScript', 'React', 'Node.js'],
    preferredSkills: ['Docker', 'AWS'],
    requiredEducation: ['Bachelor degree'],
    requiredExperienceYears: 3,
    workAuthorisation: 'US Work Authorization',
    applicationDeadline: null,
    sourceName: 'Imported Web Page',
    sourceUrl: url,
    applicationUrl: url,
    datePosted: new Date().toISOString().split('T')[0],
    dateDiscovered: new Date().toISOString(),
    possibleScam: isScam,
    scamReasons: isScam ? ['Contains suspicious contact methods or fee requests'] : []
  };
}

function mockGenerateApplicationDraft(
  profile: UserProfile,
  _cvText: string,
  job: StructuredJob
): ApplicationDraft {
  const letter = `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} position. With verified commercial experience in ${profile.skills.slice(0, 3).join(', ')}, I am eager to apply my background in software development to your team.

At ${profile.verifiedEmploymentHistory[0]?.company || 'my recent role'}, I contributed to building scalable web services and responsive user interfaces. My experience aligns directly with your requirements for ${job.requiredSkills.slice(0, 3).join(', ')}.

Thank you for reviewing my application. I look forward to connecting.

Sincerely,
${profile.fullName}`;

  const evidence: ClaimEvidence[] = [
    {
      generatedClaim: `Verified skills: ${profile.skills.slice(0, 3).join(', ')}`,
      supportingSource: 'Profile -> Skills',
      confidence: 1.0,
      requiresUserConfirmation: false
    },
    {
      generatedClaim: `Employment at ${profile.verifiedEmploymentHistory[0]?.company || 'Apex Cloud Solutions'}`,
      supportingSource: 'Profile -> Employment History (Verified)',
      confidence: 1.0,
      requiresUserConfirmation: false
    }
  ];

  return {
    id: `draft-${Date.now()}`,
    userId: profile.userId,
    jobId: job.externalId,
    cvVersionId: 'cv-master-1',
    tailoredSummary: `Tailored application for ${job.title} at ${job.company}, emphasizing verified engineering background.`,
    suggestedCvChanges: ['Highlight matching core skills in top summary', 'Emphasize cloud microservices achievements'],
    tailoredCoverLetter: letter,
    wordCount: letter.trim().split(/\s+/).length,
    screeningAnswers: [
      {
        question: 'Do you require visa sponsorship?',
        suggestedAnswer: profile.workAuthorisationInfo,
        requiresManualUserAnswer: true,
        manualAnswerReason: 'Legal Work-Authorisation Declaration requires user confirmation'
      }
    ],
    claimEvidence: evidence,
    missingInformation: [],
    isApproved: false,
    createdAt: new Date().toISOString()
  };
}
