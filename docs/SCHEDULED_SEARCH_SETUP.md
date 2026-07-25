# Scheduled Job-Search System Setup Guide

This document details the architecture, GCP deployment configuration, IAM security model, and troubleshooting steps for the **JobPilot AI** scheduled job-search system.

---

## 1. System Architecture & Component Flow

```text
  ┌──────────────────────┐
  │ Google Cloud        │
  │ Scheduler            │
  └──────────┬───────────┘
             │ OIDC HTTP POST every 6 hours
             ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ Cloud Run Service: POST /api/internal/scheduled-search      │
  │ (Orchestrator Endpoint)                                     │
  │ 1. Validates OIDC token & request schema                    │
  │ 2. Obtains search run lock on searchRuns/{runId}           │
  │ 3. Queries active user automationSettings                   │
  │ 4. Creates task records in searchRuns/{runId}/tasks/        │
  │ 5. Dispatches task payloads to Cloud Tasks queue           │
  └──────────┬──────────────────────────────────────────────────┘
             │ Enqueues worker tasks
             ▼
  ┌──────────────────────┐
  │ Google Cloud Tasks   │ (job-search-queue)
  │ (Rate & Retry Ctrl)  │ - 2 dispatches/sec max
  └──────────┬───────────┘ - 5 concurrent max
             │ OIDC HTTP POST
             ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ Cloud Run Service: POST /api/internal/job-search-worker     │
  │ (Worker Endpoint)                                           │
  │ 1. Validates OIDC token & task deduplication check          │
  │ 2. Fetches vacancies from permitted job connector           │
  │ 3. Extracts & validates with Gemini                         │
  │ 4. Deduplicates against existing saved jobs                 │
  │ 5. Scores matches against user verified profile             │
  │ 6. Saves qualified jobs & prepares optional app drafts       │
  │ 7. Updates task record & calls updateSearchRunCompletion()  │
  └──────────┬──────────────────────────────────────────────────┘
             │ Final task completion check
             ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ Run Completion Aggregator                                   │
  │ 1. Verifies all tasks for runId are finished                │
  │ 2. Sets run completedAt & final run status                  │
  │ 3. Updates user's lastRunAt and calculates nextRunAt         │
  │ 4. Generates in-app notification for user dashboard         │
  └─────────────────────────────────────────────────────────────┘
```

---

## 2. Required Environment Variables

Configure these variables in your Cloud Run service configuration or local `.env`:

```env
# Gemini AI Key
GEMINI_API_KEY="your-gemini-api-key"

# Cloud Run Public Service URL
APP_URL="https://jobpilot-ai-service-xyz.a.run.app"
CLOUD_RUN_SERVICE_URL="https://jobpilot-ai-service-xyz.a.run.app"

# Google Cloud Platform Identifiers
GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
GOOGLE_CLOUD_REGION="europe-west1"

# Google Cloud Tasks Queue Setup
CLOUD_TASKS_LOCATION="europe-west1"
CLOUD_TASKS_QUEUE="job-search-queue"

# Service Accounts for Cloud Scheduler & Cloud Tasks OIDC Invocations
SCHEDULER_SERVICE_ACCOUNT_EMAIL="jobpilot-scheduler-sa@your-gcp-project-id.iam.gserviceaccount.com"
TASKS_SERVICE_ACCOUNT_EMAIL="jobpilot-tasks-sa@your-gcp-project-id.iam.gserviceaccount.com"
```

---

## 3. Step-by-Step GCP Infrastructure Setup

### Step 3.1: Enable Required Google Cloud APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com \
  iam.googleapis.com \
  firestore.googleapis.com \
  --project="YOUR_PROJECT_ID"
```

### Step 3.2: Create Dedicated IAM Service Accounts

```bash
# 1. Service account for Cloud Scheduler trigger
gcloud iam service-accounts create jobpilot-scheduler-sa \
  --description="Service Account for triggering scheduled job searches" \
  --display-name="JobPilot Scheduler SA" \
  --project="YOUR_PROJECT_ID"

# 2. Service account for Cloud Tasks worker trigger
gcloud iam service-accounts create jobpilot-tasks-sa \
  --description="Service Account for executing job-search Cloud Tasks workers" \
  --display-name="JobPilot Tasks SA" \
  --project="YOUR_PROJECT_ID"
```

### Step 3.3: Grant Cloud Run Invoker IAM Roles

```bash
# Grant Cloud Run Invoker role to Scheduler SA
gcloud run services add-iam-policy-binding jobpilot-ai-service \
  --member="serviceAccount:jobpilot-scheduler-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --region="europe-west1" \
  --project="YOUR_PROJECT_ID"

# Grant Cloud Run Invoker role to Tasks SA
gcloud run services add-iam-policy-binding jobpilot-ai-service \
  --member="serviceAccount:jobpilot-tasks-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --region="europe-west1" \
  --project="YOUR_PROJECT_ID"
```

### Step 3.4: Create Rate-Limited Cloud Tasks Queue

Execute the following `gcloud` command to create the worker queue with strict rate limiting and backoff controls:

```bash
gcloud tasks queues create job-search-queue \
  --location="europe-west1" \
  --max-dispatches-per-second=2 \
  --max-concurrent-dispatches=5 \
  --max-attempts=5 \
  --min-backoff=30s \
  --max-backoff=30m \
  --project="YOUR_PROJECT_ID"
```

### Step 3.5: Create Google Cloud Scheduler Cron Job

Configure Cloud Scheduler to execute every 6 hours targeting the private internal orchestrator endpoint:

```bash
gcloud scheduler jobs create http jobpilot-scheduled-search \
  --schedule="0 */6 * * *" \
  --time-zone="UTC" \
  --uri="https://YOUR_CLOUD_RUN_SERVICE_URL/api/internal/scheduled-search" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --message-body='{"trigger":"cloud-scheduler","mode":"scheduled","scheduledTime":"2026-07-24T12:00:00Z"}' \
  --oidc-service-account-email="jobpilot-scheduler-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --oidc-token-audience="https://YOUR_CLOUD_RUN_SERVICE_URL" \
  --location="europe-west1" \
  --project="YOUR_PROJECT_ID"
```

---

## 4. Verification & Testing Instructions

### 4.1 System Readiness Check
Verify application health and Firestore configuration:

```bash
curl -i https://YOUR_CLOUD_RUN_SERVICE_URL/ready
```
Expected output:
```json
{
  "status": "ready",
  "firestore": true,
  "geminiConfigured": true,
  "project": "YOUR_PROJECT_ID"
}
```

### 4.2 Manual Test Trigger via Cloud Scheduler
Force an immediate execution of the scheduler job:

```bash
gcloud scheduler jobs run jobpilot-scheduled-search \
  --location="europe-west1" \
  --project="YOUR_PROJECT_ID"
```

### 4.3 Monitoring & Audit Inspection
1. Open the **Search History** page in the JobPilot AI web dashboard.
2. Verify that a new `scheduled` run record appears in `SearchRun Audit History`.
3. Check the worker task breakdown for individual sources (`googleSearch`, `greenhouse`, `lever`, `companyCareerPages`).
4. Inspect Firestore collections in GCP Console:
   - `automationSettings/{userId}`
   - `searchRuns/{runId}`
   - `searchRuns/{runId}/tasks/{taskId}`
   - `notifications/{id}`

---

## 5. Security & Safety Principles

1. **Zero Unauthorised Submissions**: Automatic submission of job applications is strictly disabled. Draft cover letters remain in the "Awaiting Approval" state until reviewed and approved by the user.
2. **OIDC Authentication**: Internal API routes (`/api/internal/*`) enforce Cloud Run IAM authentication using OIDC bearer tokens issued to authorized service accounts.
3. **No Unauthenticated Client Access**: Firestore security rules reject direct client writes to `searchRuns` and `tasks` subcollections.
