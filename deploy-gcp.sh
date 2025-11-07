#!/usr/bin/env bash
set -euo pipefail

# Set environment variables
export PROJECT_ID="${PROJECT_ID:-your-project-id}"
export REGION="${REGION:-us-central1}"
export ENVIRONMENT="${ENVIRONMENT:-demo}"

# Initialize Google Cloud project
gcloud config set project "$PROJECT_ID"

create_or_update_secret() {
  local name="$1"
  local value="$2"

  if gcloud secrets describe "$name" >/dev/null 2>&1; then
    printf '%s' "$value" | gcloud secrets versions add "$name" --data-file=- >/dev/null
  else
    printf '%s' "$value" | gcloud secrets create "$name" --data-file=- >/dev/null
  fi
}

# Create required secrets
echo "Creating secrets..."
create_or_update_secret "database-url" "postgresql://user:pass@localhost:5432/workright"
create_or_update_secret "redis-url" "redis://localhost:6379"
create_or_update_secret "api-url" "https://api.workright-hris.run.app"

# Initialize Terraform
pushd infra/terraform/environments/gcp >/dev/null
terraform init

# Apply Terraform configuration
terraform apply \
  -var="project_id=$PROJECT_ID" \
  -var="region=$REGION" \
  -var="environment=$ENVIRONMENT"
popd >/dev/null

# Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml
