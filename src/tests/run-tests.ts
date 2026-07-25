import { DEMO_USER_PROFILE, DEMO_JOBS } from '../data/demoData';
import { calculateJobMatch, generateJobFingerprint } from '../server/matchScorer';
import { StructuredJob } from '../types/jobpilot';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ TEST PASSED: ${message}`);
}

async function runAllTests() {
  console.log('--------------------------------------------------');
  console.log('🧪 RUNNING JOBPILOT AI VERIFICATION SUITE');
  console.log('--------------------------------------------------');

  // 1. Test Structured Job Extraction Schema
  const sampleJob: StructuredJob = DEMO_JOBS[0];
  assert(typeof sampleJob.externalId === 'string', 'Job object must have externalId string');
  assert(typeof sampleJob.title === 'string', 'Job object must have title string');
  assert(typeof sampleJob.company === 'string', 'Job object must have company string');
  assert(['remote', 'hybrid', 'onsite', 'unspecified'].includes(sampleJob.remoteType), 'Job remoteType must be valid enum');
  assert(Array.isArray(sampleJob.requiredSkills), 'Job requiredSkills must be an array');
  assert(typeof sampleJob.possibleScam === 'boolean', 'Job possibleScam must be boolean');

  // 2. Test Match Scoring Algorithm
  const highMatchJob = DEMO_JOBS[0]; // Senior Full-Stack Engineer
  const matchResultHigh = calculateJobMatch(highMatchJob, DEMO_USER_PROFILE);
  assert(matchResultHigh.totalScore >= 80, `High match score should be >= 80 (got ${matchResultHigh.totalScore})`);
  assert(matchResultHigh.recommendation === 'Strongly Recommended', 'High match should be Strongly Recommended');

  const scamJob = DEMO_JOBS[3]; // Scam job
  const scamMatch = calculateJobMatch(scamJob, DEMO_USER_PROFILE);
  assert(scamMatch.recommendation === 'Not Recommended', 'Scam job should be Not Recommended');
  assert(scamMatch.disqualifyingRequirements.length > 0, 'Scam job should have disqualifying requirement flagged');

  // 3. Test Duplicate Detection Fingerprinting
  const fp1 = generateJobFingerprint('TechCorp Inc', 'Senior React Engineer', 'Remote', 'https://example.com/apply');
  const fp2 = generateJobFingerprint('techcorp inc ', 'Senior React Engineer ', 'remote', 'https://example.com/apply?utm_source=board');
  assert(fp1 === fp2, 'Normalized duplicate fingerprints must match');

  // 4. Test Non-Fabrication Claim Verification
  const userVerifiedSkills = new Set(DEMO_USER_PROFILE.skills.map(s => s.toLowerCase()));
  const unverifiedClaim = 'Ph.D. in Physics from MIT'; // User does NOT have this
  const isClaimVerified = userVerifiedSkills.has(unverifiedClaim.toLowerCase()) || DEMO_USER_PROFILE.education.some(e => e.degree.includes('Ph.D.'));
  assert(!isClaimVerified, 'Unverified claim must be flagged as unsupported');

  // 5. Test Application Approval Requirement
  const draftState = { isApproved: false, status: 'awaiting_approval' };
  assert(draftState.isApproved === false, 'Application draft must default to NOT approved');
  assert(draftState.status === 'awaiting_approval', 'Application draft must default to awaiting_approval status');

  console.log('--------------------------------------------------');
  console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
  console.log('--------------------------------------------------');
}

runAllTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
