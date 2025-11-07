# Google Cloud deployment

This repository now includes first-class Terraform support for deploying the WorkRight HRIS platform to Google Cloud using the [three-tier web app reference architecture](https://cloud.google.com/architecture/application-development/three-tier-web-app).

The stack provisions:

- **Networking:** a dedicated VPC with separate public and private subnets, suitable for placing a public web tier, a middle-tier API, and privately addressed services.
- **Platform services:** Cloud SQL for PostgreSQL with private service networking, automated backups, and Query Insights enabled, plus a regional Cloud Storage bucket for binary attachments (names are randomized so they are globally unique).
- **Foundational services:** required Google APIs (Compute, Cloud SQL Admin, Service Networking, and Cloud Run) are enabled automatically so that application workloads can attach to the shared infrastructure.

## Prerequisites

1. Install the Terraform CLI (v1.7 or later).
2. Authenticate with Google Cloud and set the project you plan to deploy into:

   ```bash
   gcloud auth login
   gcloud auth application-default login
   gcloud config set project <PROJECT_ID>
   ```

3. Ensure the target project has billing enabled.

## Configuration

1. Duplicate `infra/terraform/environments/prod/prod.auto.tfvars.example` and rename it to `prod.auto.tfvars`.
2. Update the variables to reflect your environment:
   - `project` — a human-friendly prefix for resource names.
   - `project_id` — the Google Cloud project that hosts the infrastructure.
   - `region` — the primary region for regional resources (defaults to `australia-southeast1`).
   - `vpc_cidr`, `public_subnet_cidr`, `private_subnet_cidr` — network ranges that must not overlap with your existing networks.
   - `db_tier` — the Cloud SQL machine tier sized for your workload (for example `db-custom-2-7680`).
   - `db_availability_type` — choose `ZONAL` for single-zone or `REGIONAL` for high availability instances.
   - `db_username` and `db_password` — credentials for the application service account.

## Deployment

From the repository root:

```bash
cd infra/terraform/environments/prod
terraform init
terraform plan -out tfplan
terraform apply tfplan
```

Once the apply succeeds, Terraform will output the Cloud SQL connection name and the attachments bucket ID. Use these values to configure the application services (for example by wiring them into `apps/api` via environment variables).

## Cloud Build automation

The top-level [`cloudbuild.yaml`](../cloudbuild.yaml) pipeline bakes and pushes the production API image before deploying it to Cloud Run. It expects the following runtime inputs, which default to the shared sandbox project but can be overridden per build:

- `_REGION` – Cloud Run region (for example `australia-southeast1`).
- `_SERVICE_ACCOUNT` – Service account with `roles/run.admin`, `roles/iam.serviceAccountUser`, `roles/cloudsql.client`, and `roles/secretmanager.secretAccessor`.
- `_INSTANCE_CONNECTION_NAME` – Cloud SQL instance connection string.
- `_DB_NAME`, `_DB_USER`, `_DB_HOST`, `_DB_PORT` – Database connection settings (set `_DB_HOST` when using private IP).

To trigger a build manually, authenticate with Cloud Build and run:

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _REGION=australia-southeast1,_SERVICE_ACCOUNT=workright-runner@<PROJECT_ID>.iam.gserviceaccount.com \
  .
```

When `_DB_HOST` is unset the pipeline automatically wires the Cloud SQL Unix socket and adds the specified instance to the service. Secrets are read from Secret Manager (the `DB_PASSWORD` secret must exist).

## Post-deployment

- Provision Cloud Run or GKE services for the web and API tiers. Attach them to the provisioned VPC subnets with Serverless VPC Access connectors or private GKE nodes.
- Configure the application runtime to use the private Cloud SQL connection (Unix socket or private IP) and to store binary assets in the Cloud Storage bucket.
- Set up Identity-Aware Proxy or an external HTTPS load balancer to expose the public tier securely.

Refer to the Google Cloud three-tier reference guide for deeper recommendations on load balancing, scaling, and security hardening.
