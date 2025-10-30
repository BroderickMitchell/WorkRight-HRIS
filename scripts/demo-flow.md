# WorkRight HRIS end-to-end demo

This script provisions a fresh tenant, seeds core configuration, uploads employees, aligns goals, runs a review cycle, and exercises leave plus reporting flows. It is safe to paste into a terminal or adapt for Postman collections. Replace tokens, URLs, and optional payloads as required for your environment.

> **Prerequisites**
>
> - Ensure the API is running and reachable at `BASE_URL`.
> - Use a bearer token with organisation admin or system permissions – the workflow provisions tenant-wide resources and impersonation tokens.
> - Install [`jq`](https://stedolan.github.io/jq/) if you want the script to capture IDs from responses.

```bash
# 0) Prereqs (env + auth)
export BASE_URL="https://api.workright.example"   # change to your API base
export TOKEN="REPLACE_WITH_BEARER_TOKEN"          # org admin or system token
export AUTH="Authorization: Bearer $TOKEN"
export CT="Content-Type: application/json"
```

## 1. Create tenant and configure core settings

```bash
# 1.1 Create tenant
curl -s -X POST "$BASE_URL/v1/identity/tenants" \
  -H "$AUTH" -H "$CT" \
  -d '{
    "name": "Acme Mining Pty Ltd",
    "slug": "acme",
    "defaultLocale": "en-AU",
    "timezone": "Australia/Perth",
    "adminEmail": "it-admin@acme.example"
  }' | tee /tmp/tenant.json

export TENANT_ID=$(jq -r '.id' /tmp/tenant.json)
echo "TENANT_ID=$TENANT_ID"

# 1.2 Branding (logo, colours, wording)
curl -s -X PUT "$BASE_URL/v1/settings/branding" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"primaryColor\": \"#1463FF\",
    \"secondaryColor\": \"#0F2B46\",
    \"logoUrl\": \"https://assets.example/acme-logo.png\",
    \"loginCopy\": \"Welcome to Acme HRIS\"
  }"

# 1.3 Leave settings (policies + calendar)
curl -s -X PUT "$BASE_URL/v1/leave/settings" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"weekStartsOn\": \"MONDAY\",
    \"publicHolidayRegion\": \"AU-WA\",
    \"approvalFlow\": \"MANAGER_THEN_HR\",
    \"workingDays\": [\"MON\",\"TUE\",\"WED\",\"THU\",\"FRI\"]
  }"

# Example policies
curl -s -X POST "$BASE_URL/v1/leave/policies" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"code\": \"AL\",
    \"name\": \"Annual Leave\",
    \"accrual\": {\"type\": \"STANDARD\", \"hoursPerYear\": 152, \"carryoverHours\": 76},
    \"requiresApproval\": true
  }"

curl -s -X POST "$BASE_URL/v1/leave/policies" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"code\": \"SL\",
    \"name\": \"Personal/Carer's Leave\",
    \"accrual\": {\"type\": \"STANDARD\", \"hoursPerYear\": 76},
    \"requiresApproval\": false
  }"
```

## 2. Import employees

**Option A: CSV importer (recommended for demo)**

```bash
cat <<'CSV' > employees.csv
employeeNumber,firstName,lastName,email,managerEmail,jobTitle,department,employmentType,startDate,location,leavePolicyCodes
A1001,Sam,Nguyen,sam.nguyen@acme.example,alex.lee@acme.example,People Lead,HR,Full-time,2023-02-13,Perth,AL|SL
A1002,Alex,Lee,alex.lee@acme.example,,Head of HR,HR,Full-time,2021-07-05,Perth,AL|SL
A1003,Jess,Tan,jess.tan@acme.example,alex.lee@acme.example,Engineer,Operations,Full-time,2024-03-18,Pilbara,AL|SL
CSV

curl -s -X POST "$BASE_URL/v1/directory/employees/import" \
  -H "$AUTH" \
  -F "tenantId=$TENANT_ID" \
  -F "file=@employees.csv"
```

**Option B: JSON import (single call)**

```bash
curl -s -X POST "$BASE_URL/v1/directory/employees/import" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"employees\": [
      {\"employeeNumber\":\"A1001\",\"firstName\":\"Sam\",\"lastName\":\"Nguyen\",\"email\":\"sam.nguyen@acme.example\",\"managerEmail\":\"alex.lee@acme.example\",\"jobTitle\":\"People Lead\",\"department\":\"HR\",\"employmentType\":\"Full-time\",\"startDate\":\"2023-02-13\",\"location\":\"Perth\",\"leavePolicyCodes\":[\"AL\",\"SL\"]},
      {\"employeeNumber\":\"A1002\",\"firstName\":\"Alex\",\"lastName\":\"Lee\",\"email\":\"alex.lee@acme.example\",\"jobTitle\":\"Head of HR\",\"department\":\"HR\",\"employmentType\":\"Full-time\",\"startDate\":\"2021-07-05\",\"location\":\"Perth\",\"leavePolicyCodes\":[\"AL\",\"SL\"]},
      {\"employeeNumber\":\"A1003\",\"firstName\":\"Jess\",\"lastName\":\"Tan\",\"email\":\"jess.tan@acme.example\",\"managerEmail\":\"alex.lee@acme.example\",\"jobTitle\":\"Engineer\",\"department\":\"Operations\",\"employmentType\":\"Full-time\",\"startDate\":\"2024-03-18\",\"location\":\"Pilbara\",\"leavePolicyCodes\":[\"AL\",\"SL\"]}
    ]
  }"
```

```bash
# Grab IDs to reuse
curl -s "$BASE_URL/v1/directory/employees?tenantId=$TENANT_ID&email=sam.nguyen@acme.example" -H "$AUTH" | tee /tmp/sam.json
curl -s "$BASE_URL/v1/directory/employees?tenantId=$TENANT_ID&email=alex.lee@acme.example" -H "$AUTH" | tee /tmp/alex.json
export EMP_SAM_ID=$(jq -r '.[0].id' /tmp/sam.json)
export EMP_ALEX_ID=$(jq -r '.[0].id' /tmp/alex.json)
```

## 3. Goals, review cycles, and 360 feedback

```bash
# 3.1 Create a top-level company goal
curl -s -X POST "$BASE_URL/v1/goals" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"title\": \"Reduce incident rate by 20% in FY25\",
    \"ownerType\": \"DEPARTMENT\",
    \"ownerId\": \"Operations\",
    \"visibility\": \"COMPANY\",
    \"keyResults\": [
      {\"title\":\"Implement daily pre-start audits at 100% sites\",\"target\":100,\"unit\":\"PCT\"},
      {\"title\":\"Rollout new safety LMS to all staff\",\"target\":1,\"unit\":\"BOOL\"}
    ],
    \"dueDate\": \"2026-06-30\"
  }" | tee /tmp/company_goal.json

export GOAL_TOP_ID=$(jq -r '.id' /tmp/company_goal.json)

# 3.2 Cascade goal to team + individual
curl -s -X POST "$BASE_URL/v1/goals/$GOAL_TOP_ID/cascade" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\":\"$TENANT_ID\",
    \"children\": [
      {\"ownerType\":\"EMPLOYEE\",\"ownerId\":\"$EMP_SAM_ID\",\"title\":\"Complete safety LMS and train team\",\"weight\":0.5},
      {\"ownerType\":\"EMPLOYEE\",\"ownerId\":\"$EMP_ALEX_ID\",\"title\":\"Achieve 95% audit completion\",\"weight\":0.5}
    ]
  }"

# 3.3 Launch a review cycle
curl -s -X POST "$BASE_URL/v1/reviews/cycles" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\":\"$TENANT_ID\",
    \"name\":\"FY25 H1 Performance Review\",
    \"periodStart\":\"2025-01-01\",
    \"periodEnd\":\"2025-06-30\",
    \"participants\": {\"type\":\"DEPARTMENT\",\"value\":\"Operations\"},
    \"forms\": {
      \"selfReviewTemplateId\":\"default-self\",
      \"managerReviewTemplateId\":\"default-manager\"
    },
    \"goalAlignment\": {\"include\": true, \"lockAtLaunch\": true},
    \"peerFeedbackWindow\": {\"start\":\"2025-05-01\",\"end\":\"2025-05-31\"}
  }" | tee /tmp/rev_cycle.json

export REVIEW_CYCLE_ID=$(jq -r '.id' /tmp/rev_cycle.json)

# 3.4 Kick off 360 feedback requests
curl -s -X POST "$BASE_URL/v1/feedback/360/requests" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\":\"$TENANT_ID\",
    \"cycleId\":\"$REVIEW_CYCLE_ID\",
    \"subjects\":[{\"employeeId\":\"$EMP_SAM_ID\"}],
    \"reviewers\":[{\"email\":\"alex.lee@acme.example\"}],
    \"questionSetId\":\"default-360\"
  }"
```

## 4. Leave request lifecycle and calendar sync

```bash
# 4.1 Submit leave (employee Sam)
curl -s -X POST "$BASE_URL/v1/leave/requests" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\":\"$TENANT_ID\",
    \"employeeId\":\"$EMP_SAM_ID\",
    \"policyCode\":\"AL\",
    \"startDate\":\"2025-11-10\",
    \"endDate\":\"2025-11-14\",
    \"hoursPerDay\":7.6,
    \"reason\":\"Family trip\"
  }" | tee /tmp/leave.json

export LEAVE_ID=$(jq -r '.id' /tmp/leave.json)

# 4.2 Approve as manager (Alex)
curl -s -X POST "$BASE_URL/v1/leave/requests/$LEAVE_ID/approve" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\":\"$TENANT_ID\",
    \"approverId\":\"$EMP_ALEX_ID\",
    \"note\":\"Approved—have a great break\"
  }"

# 4.3 Verify ICS feed (subscribe/view)
# Employee ICS (shareable URL example):
# $BASE_URL/v1/calendar/ics?tenantId=$TENANT_ID&employeeId=$EMP_SAM_ID&token=SECURE_SIGNED_TOKEN
# Tenant/team ICS:
# $BASE_URL/v1/calendar/ics?tenantId=$TENANT_ID&scope=tenant&token=SECURE_SIGNED_TOKEN
# Subscribe the URLs in Google/Outlook/Apple Calendar to confirm the approved leave spans 2025-11-10 → 2025-11-14.
```

## 5. Reporting and webhook subscription

```bash
# 5.1 Generate a headcount report (point-in-time)
curl -s "$BASE_URL/v1/reports/headcount?tenantId=$TENANT_ID&asOf=2025-10-30" \
  -H "$AUTH" | tee /tmp/headcount.json

# 5.2 Create a webhook subscription (deliver report or events)
curl -s -X POST "$BASE_URL/v1/webhooks/subscriptions" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"tenantId\":\"$TENANT_ID\",
    \"targetUrl\":\"https://receiver.example/webhook\",
    \"secret\":\"use-a-long-random-secret\",
    \"events\":[\"employee.created\",\"leave.approved\",\"report.headcount.daily\"],
    \"retries\": {\"max\":5, \"backoff\":\"EXPONENTIAL\"}
  }" | tee /tmp/webhook.json

export WEBHOOK_ID=$(jq -r '.id' /tmp/webhook.json)

# Optional: trigger a test delivery
curl -s -X POST "$BASE_URL/v1/webhooks/subscriptions/$WEBHOOK_ID/test" \
  -H "$AUTH" -H "$CT" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"example\":\"headcount\"}"
```

## 6. Nice-to-haves for a live demo

```bash
# Impersonation tokens to act as Sam/Alex (if supported)
curl -s -X POST "$BASE_URL/v1/identity/impersonate" -H "$AUTH" -H "$CT" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"employeeId\":\"$EMP_SAM_ID\"}"

# Goal progress update to show realtime metrics
curl -s -X POST "$BASE_URL/v1/goals/$GOAL_TOP_ID/progress" \
  -H "$AUTH" -H "$CT" -d "{\"value\": 60, \"note\":\"Audits at 60%\"}"

# Download headcount to CSV
curl -s "$BASE_URL/v1/reports/headcount.csv?tenantId=$TENANT_ID&asOf=2025-10-30" \
  -H "$AUTH" -o headcount_2025-10-30.csv
```

## 7. Cleanup (if needed)

```bash
curl -s -X DELETE "$BASE_URL/v1/webhooks/subscriptions/$WEBHOOK_ID?tenantId=$TENANT_ID" -H "$AUTH"
curl -s -X DELETE "$BASE_URL/v1/identity/tenants/$TENANT_ID" -H "$AUTH"
```

> **Notes**
>
> - Adjust endpoint paths if your deployment prefixes the API (for example, `/api/v1`).
> - ICS feeds require signed tokens and may need tenant-level calendar sharing toggled on.
> - Replace default template IDs (such as `default-self`) with seeded template identifiers available in your environment.
