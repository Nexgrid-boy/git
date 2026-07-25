import { StructuredJob, UserProfile, JobMatchResult, ScoreBreakdown, RecommendationLevel } from '../types/jobpilot';

export function calculateJobMatch(job: StructuredJob, profile: UserProfile): JobMatchResult {
  let requiredSkillsScore = 0;
  let experienceScore = 0;
  let educationScore = 0;
  let locationRemoteScore = 0;
  let salaryScore = 0;
  let industryRoleScore = 0;
  let disqualificationPenalties = 0;

  const strongMatches: string[] = [];
  const partialMatches: string[] = [];
  const missingRequirements: string[] = [];
  const disqualifyingRequirements: string[] = [];

  const userSkillsLower = new Set(profile.skills.map(s => s.toLowerCase()));

  // 1. Required Skills Match (Max 35 points)
  if (job.requiredSkills.length === 0) {
    requiredSkillsScore = 35;
  } else {
    let matchedCount = 0;
    job.requiredSkills.forEach(reqSkill => {
      const lower = reqSkill.toLowerCase();
      if (Array.from(userSkillsLower).some(us => us.includes(lower) || lower.includes(us))) {
        matchedCount++;
        strongMatches.push(`Required skill matched: ${reqSkill}`);
      } else {
        missingRequirements.push(`Missing required skill: ${reqSkill}`);
      }
    });
    requiredSkillsScore = Math.round((matchedCount / job.requiredSkills.length) * 35);
  }

  // 2. Experience Match (Max 20 points)
  // Calculate user total years of verified experience
  let totalUserYears = 6; // Default from verified history
  if (profile.verifiedEmploymentHistory && profile.verifiedEmploymentHistory.length > 0) {
    totalUserYears = profile.verifiedEmploymentHistory.reduce((acc, item) => {
      const start = new Date(item.startDate).getFullYear() || 2020;
      const end = item.endDate.toLowerCase() === 'present' ? new Date().getFullYear() : (new Date(item.endDate).getFullYear() || 2022);
      return acc + Math.max(1, end - start);
    }, 0);
  }

  const reqYears = job.requiredExperienceYears || 0;
  if (reqYears === 0 || totalUserYears >= reqYears) {
    experienceScore = 20;
    strongMatches.push(`Verified experience (${totalUserYears} yrs) meets requirement (${reqYears} yrs)`);
  } else if (totalUserYears >= reqYears - 2) {
    experienceScore = 12;
    partialMatches.push(`Experience (${totalUserYears} yrs) is slightly below preferred (${reqYears} yrs)`);
  } else {
    experienceScore = 5;
    missingRequirements.push(`Requires ${reqYears} years experience (User has ${totalUserYears} yrs)`);
  }

  // 3. Education Match (Max 15 points)
  const userDegrees = profile.education.map(e => e.degree.toLowerCase() + ' ' + e.fieldOfStudy.toLowerCase());
  if (job.requiredEducation.length === 0) {
    educationScore = 15;
  } else {
    const reqEduText = job.requiredEducation.join(' ').toLowerCase();
    const isPhdReq = reqEduText.includes('ph.d') || reqEduText.includes('phd') || reqEduText.includes('doctorate');
    const isMasterReq = reqEduText.includes('master') || reqEduText.includes('m.s');
    const userHasPhd = userDegrees.some(d => d.includes('phd') || d.includes('ph.d') || d.includes('doctorate'));
    const userHasMaster = userDegrees.some(d => d.includes('master') || d.includes('m.s')) || userHasPhd;

    if (isPhdReq && !userHasPhd) {
      educationScore = 0;
      disqualificationPenalties -= 25;
      disqualifyingRequirements.push('Missing mandatory Ph.D. degree requirement');
    } else if (isMasterReq && !userHasMaster) {
      educationScore = 5;
      disqualificationPenalties -= 10;
      missingRequirements.push('Master\'s degree preferred');
    } else {
      educationScore = 15;
      strongMatches.push('Education requirement satisfied');
    }
  }

  // 4. Location & Remote Eligibility (Max 10 points)
  const jobRemote = job.remoteType?.toLowerCase();
  const userRemotePref = profile.remotePreference?.toLowerCase();

  if (jobRemote === userRemotePref || (userRemotePref === 'remote' && jobRemote === 'remote')) {
    locationRemoteScore = 10;
    strongMatches.push(`Remote preference (${userRemotePref}) matches vacancy type (${jobRemote})`);
  } else if (jobRemote === 'hybrid' || userRemotePref === 'hybrid') {
    locationRemoteScore = 7;
    partialMatches.push(`Hybrid work setup (${job.location})`);
  } else if (jobRemote === 'onsite' && userRemotePref === 'remote') {
    locationRemoteScore = 3;
    missingRequirements.push(`Vacancy is on-site (${job.location}), but user prefers remote work`);
  } else {
    locationRemoteScore = 8;
  }

  // 5. Salary Match (Max 10 points)
  const userMinSalary = profile.minimumAcceptableSalary || 100000;
  const jobMaxSalary = job.salaryMaximum || job.salaryMinimum;

  if (jobMaxSalary && jobMaxSalary >= userMinSalary) {
    salaryScore = 10;
    strongMatches.push(`Compensation ($${job.salaryMinimum ? Math.round(job.salaryMinimum/1000) : 0}k-$${Math.round(jobMaxSalary/1000)}k) meets or exceeds minimum ($${Math.round(userMinSalary/1000)}k)`);
  } else if (jobMaxSalary && jobMaxSalary >= userMinSalary * 0.85) {
    salaryScore = 6;
    partialMatches.push(`Salary ($${Math.round(jobMaxSalary/1000)}k) is slightly below user minimum ($${Math.round(userMinSalary/1000)}k)`);
  } else if (jobMaxSalary) {
    salaryScore = 2;
    missingRequirements.push(`Salary ($${Math.round(jobMaxSalary/1000)}k) is below minimum expected ($${Math.round(userMinSalary/1000)}k)`);
  } else {
    salaryScore = 7; // Unspecified salary
  }

  // 6. Industry & Role Preference (Max 10 points)
  const titleLower = job.title.toLowerCase();
  const prefTitlesMatch = profile.preferredJobTitles.some(t => titleLower.includes(t.toLowerCase()) || t.toLowerCase().includes(titleLower));
  
  // Check exclusions
  const isExcluded = profile.excludedRolesAndIndustries.some(ex => {
    const exLower = ex.toLowerCase();
    return titleLower.includes(exLower) || job.description.toLowerCase().includes(exLower) || job.company.toLowerCase().includes(exLower);
  });

  if (isExcluded) {
    disqualificationPenalties -= 30;
    disqualifyingRequirements.push('Role or industry matches user exclusion list');
  } else if (prefTitlesMatch) {
    industryRoleScore = 10;
    strongMatches.push(`Job title (${job.title}) matches preferred target titles`);
  } else {
    industryRoleScore = 5;
    partialMatches.push(`Job title (${job.title}) is adjacent to preferred roles`);
  }

  // Scam Penalty
  if (job.possibleScam) {
    disqualificationPenalties -= 25;
    disqualifyingRequirements.push('Flagged as possible scam (Fee/Telegram/Unrealistic claims)');
  }

  // Calculate raw total
  const rawTotal = requiredSkillsScore + experienceScore + educationScore + locationRemoteScore + salaryScore + industryRoleScore + disqualificationPenalties;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

  const breakdown: ScoreBreakdown = {
    requiredSkillsScore,
    experienceScore,
    educationScore,
    locationRemoteScore,
    salaryScore,
    industryRoleScore,
    disqualificationPenalties
  };

  let recommendation: RecommendationLevel = 'Not Recommended';
  if (totalScore >= 80 && disqualifyingRequirements.length === 0) {
    recommendation = 'Strongly Recommended';
  } else if (totalScore >= 60 && disqualifyingRequirements.length === 0) {
    recommendation = 'Recommended with Caveats';
  } else {
    recommendation = 'Not Recommended';
  }

  let explanation = '';
  if (disqualifyingRequirements.length > 0) {
    explanation = `Disqualified due to: ${disqualifyingRequirements.join('; ')}.`;
  } else if (recommendation === 'Strongly Recommended') {
    explanation = `Outstanding ${totalScore}% match score. Highly aligned with your verified background, remote preferences, and salary expectations.`;
  } else if (recommendation === 'Recommended with Caveats') {
    explanation = `Good ${totalScore}% match score with minor gaps: ${missingRequirements.join(', ') || 'Partial skill overlaps'}.`;
  } else {
    explanation = `Low ${totalScore}% match score. Significant skill or preference gaps identified.`;
  }

  return {
    id: `match-${job.externalId}`,
    userId: profile.userId,
    jobId: job.externalId,
    totalScore,
    breakdown,
    strongMatches,
    partialMatches,
    missingRequirements,
    disqualifyingRequirements,
    recommendation,
    explanation,
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Fingerprint generator for duplicate detection
 */
export function generateJobFingerprint(company: string, title: string, location: string, appUrl: string): string {
  const normCompany = (company || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normTitle = (title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normLoc = (location || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normUrl = (appUrl || '').toLowerCase().trim().split('?')[0]; // strip query string

  return `${normCompany}|${normTitle}|${normLoc}|${normUrl}`;
}
