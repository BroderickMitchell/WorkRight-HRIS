#!/usr/bin/env bash
set -euo pipefail

# Set environment variables (override by exporting before running)
export PROJECT_ID="${PROJECT_ID:-your-project-id}"
export REGION="${REGION:-us-central1}"
export ENVIRONMENT="${ENVIRONMENT:-demo}"

# Optional overrides for secret population
export DATABASE_URL_VALUE="${DATABASE_URL_VALUE:-}"
export REDIS_URL_VALUE="${REDIS_URL_VALUE:-}"
export API_URL_VALUE="${API_URL_VALUE:-}"
export AUTH_SECRET_VALUE="${AUTH_SECRET_VALUE:-}"

# Initialize Google Cloud project context
gcloud config set project "$PROJECT_ID" >/dev/null

generate_secret() {
  local seed="$1"
  local length="${2:-64}"

  if [[ -n "$seed" ]]; then
    printf '%s' "$seed"
  else
    openssl rand -base64 "$length" | tr -d '\n'
  fi
}

add_secret_version() {
  local name="$1"
  local value="$2"

  if ! gcloud secrets describe "$name" --project "$PROJECT_ID" >/dev/null 2>&1; then
    gcloud secrets create "$name" --project "$PROJECT_ID" >/dev/null
  fi

  printf '%s' "$value" | gcloud secrets versions add "$name" --project "$PROJECT_ID" --data-file=- >/dev/null
}

# Provision infrastructure with Terraform
pushd infra/terraform/environments/gcp >/dev/null
terraform init
terraform apply \
  -var="project_id=$PROJECT_ID" \
  -var="region=$REGION" \
  -var="environment=$ENVIRONMENT"

CLOUD_SQL_PRIVATE_IP=$(terraform output -raw cloud_sql_private_ip)
CLOUD_SQL_DB_NAME=$(terraform output -raw cloud_sql_database_name)
CLOUD_SQL_DB_USER=$(terraform output -raw cloud_sql_database_user)
CLOUD_SQL_PASSWORD=$(terraform output -raw cloud_sql_database_password)
CLOUD_SQL_CONNECTION_NAME=$(terraform output -raw cloud_sql_instance_connection_name)
REDIS_HOST=$(terraform output -raw redis_host)
REDIS_PORT=$(terraform output -raw redis_port)
DEFAULT_API_URL=$(terraform output -raw cloud_run_api_url)
STORAGE_BUCKET=$(terraform output -raw storage_bucket_name)
SERVICE_ACCOUNT_EMAIL=$(terraform output -raw service_account_email)
VPC_CONNECTOR=$(terraform output -raw vpc_connector)
popd >/dev/null

# Compose connection URLs (URL-encode secrets to avoid invalid URIs)
encoded_password=$(python3 - <<PY
import sys, urllib.parse
print(urllib.parse.quote_plus(sys.argv[1]))
PY
"$CLOUD_SQL_PASSWORD")

default_database_url="postgresql://${CLOUD_SQL_DB_USER}:${encoded_password}@${CLOUD_SQL_PRIVATE_IP}:5432/${CLOUD_SQL_DB_NAME}"
default_redis_url="redis://${REDIS_HOST}:${REDIS_PORT}"

database_url="$DATABASE_URL_VALUE"
if [[ -z "$database_url" ]]; then
  database_url="$default_database_url"
fi

redis_url="$REDIS_URL_VALUE"
if [[ -z "$redis_url" ]]; then
  redis_url="$default_redis_url"
fi

api_url="$API_URL_VALUE"
if [[ -z "$api_url" ]]; then
  api_url="$DEFAULT_API_URL"
fi

auth_secret=$(generate_secret "$AUTH_SECRET_VALUE" 48)

# Persist connection material in Secret Manager
echo "Updating Secret Manager payloads..."
add_secret_version "database-url" "$database_url"
add_secret_version "redis-url" "$redis_url"
add_secret_version "api-url" "$api_url"
add_secret_version "auth-secret" "$auth_secret"

cat <<SUMMARY

Terraform outputs:
  Cloud SQL connection name: $CLOUD_SQL_CONNECTION_NAME
  Cloud SQL private IP:      $CLOUD_SQL_PRIVATE_IP
  Storage bucket:            $STORAGE_BUCKET
  Redis endpoint:            $REDIS_HOST:$REDIS_PORT
  Cloud Run API URL:         $DEFAULT_API_URL
  Service account:           $SERVICE_ACCOUNT_EMAIL
  VPC connector:             $VPC_CONNECTOR

Secrets provisioned:
  database-url
  redis-url
  api-url
  auth-secret

SUMMARY

# Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml --substitutions _ENVIRONMENT="$ENVIRONMENT",_REGION="$REGION"
