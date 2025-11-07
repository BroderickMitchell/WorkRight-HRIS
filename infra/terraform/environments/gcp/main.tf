terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "random" {}

locals {
  environment         = var.environment
  api_service_name    = "workright-api-${local.environment}"
  web_service_name    = "workright-web-${local.environment}"
  storage_bucket_name = "workright-hris-storage-${local.environment}"
  redis_name          = "workright-redis-${local.environment}"
  sql_instance_name   = "workright-db-${local.environment}"
  network_name        = "workright-network-${local.environment}"
  workloads_subnet    = "workright-workloads-${local.environment}"
  connector_subnet    = "workright-connector-${local.environment}"
  connector_name      = "workright-connector-${local.environment}"
  service_account_id  = "workright-run-${local.environment}"
}

# Ensure core services are enabled for the project.
resource "google_project_service" "required" {
  for_each = toset([
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "compute.googleapis.com",
    "containerregistry.googleapis.com",
    "iam.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
    "storage.googleapis.com",
    "vpcaccess.googleapis.com",
    "redis.googleapis.com",
  ])

  project             = var.project_id
  service             = each.key
  disable_on_destroy  = false
}

# Networking for private workloads and serverless access.
resource "google_compute_network" "vpc_network" {
  name                    = local.network_name
  auto_create_subnetworks = false
  project                 = var.project_id

  depends_on = [google_project_service.required]
}

resource "google_compute_subnetwork" "workloads" {
  name          = local.workloads_subnet
  ip_cidr_range = var.workloads_cidr
  region        = var.region
  network       = google_compute_network.vpc_network.id
}

resource "google_compute_subnetwork" "serverless" {
  name          = local.connector_subnet
  ip_cidr_range = var.serverless_connector_cidr
  purpose       = "PRIVATE"
  role          = "ACTIVE"
  region        = var.region
  network       = google_compute_network.vpc_network.id
}

resource "google_vpc_access_connector" "serverless" {
  name          = local.connector_name
  region        = var.region
  network       = google_compute_network.vpc_network.id
  project       = var.project_id
  machine_type  = "e2-micro"
  min_instances = 2
  max_instances = 3

  subnet {
    name = google_compute_subnetwork.serverless.name
  }

  depends_on = [google_project_service.required]
}

# Private Service Connect plumbing for Cloud SQL private IP.
resource "google_compute_global_address" "private_service_connect" {
  name          = "workright-psc-${local.environment}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  project       = var.project_id
  network       = google_compute_network.vpc_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_service_connect.name]
  depends_on              = [google_project_service.required]
}

# Cloud SQL instance with private IP only.
resource "google_sql_database_instance" "workright" {
  name             = local.sql_instance_name
  database_version = "POSTGRES_15"
  region           = var.region
  project          = var.project_id
  deletion_protection = false

  depends_on = [
    google_project_service.required,
    google_service_networking_connection.private_vpc_connection,
  ]

  settings {
    tier              = var.database_tier
    availability_type = "ZONAL"

    backup_configuration {
      enabled = true
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc_network.self_link
      require_ssl     = true
    }
  }
}

resource "google_sql_database" "app" {
  name     = "workright"
  instance = google_sql_database_instance.workright.name
  project  = var.project_id
}

resource "random_password" "postgres" {
  length  = 32
  special = true
}

resource "google_sql_user" "postgres" {
  name     = "workright"
  instance = google_sql_database_instance.workright.name
  project  = var.project_id
  password = random_password.postgres.result
}

# Memorystore for Redis (private access).
resource "google_redis_instance" "cache" {
  name           = local.redis_name
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.region
  project        = var.project_id

  authorized_network = google_compute_network.vpc_network.id

  depends_on = [google_project_service.required]
}

# Cloud Storage bucket for application assets.
resource "google_storage_bucket" "storage" {
  name                        = local.storage_bucket_name
  location                    = var.region
  project                     = var.project_id
  force_destroy               = true
  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}

# Service account for Cloud Run services.
resource "google_service_account" "cloud_run" {
  account_id   = local.service_account_id
  display_name = "WorkRight Cloud Run (${local.environment})"
  project      = var.project_id
}

# Allow the service account to access secrets and Cloud SQL/Redis.
resource "google_project_iam_member" "run_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_project_iam_member" "run_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_project_iam_member" "run_redis_client" {
  project = var.project_id
  role    = "roles/redis.viewer"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Secret Manager secrets (values populated outside Terraform).
resource "google_secret_manager_secret" "database_url" {
  secret_id  = "database-url"
  project    = var.project_id
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id  = "redis-url"
  project    = var.project_id
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret" "api_url" {
  secret_id  = "api-url"
  project    = var.project_id
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret" "auth_secret" {
  secret_id  = "auth-secret"
  project    = var.project_id
  replication {
    automatic = true
  }
}

# Cloud Run service for API.
resource "google_cloud_run_service" "api" {
  name     = local.api_service_name
  location = var.region
  project  = var.project_id

  metadata {
    annotations = {
      "run.googleapis.com/ingress" = "all"
    }
  }

  template {
    spec {
      service_account_name = google_service_account.cloud_run.email

      containers {
        image = "gcr.io/${var.project_id}/workright-hris-api:latest"

        env {
          name  = "NODE_ENV"
          value = "production"
        }

        env {
          name  = "PORT"
          value = "8080"
        }

        env {
          name  = "DEMO_MODE"
          value = "false"
        }

        env {
          name  = "DEFAULT_LOCALE"
          value = "en-AU"
        }

        env {
          name  = "AUTH_AUDIENCE"
          value = "workright-hris-production"
        }

        env {
          name  = "AUTH_ISSUER"
          value = "https://api.workright-hris.run.app/"
        }

        env {
          name  = "STORAGE_BUCKET"
          value = google_storage_bucket.storage.name
        }

        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.database_url.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "REDIS_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.redis_url.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "AUTH_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.auth_secret.secret_id
              key  = "latest"
            }
          }
        }
      }

      vpc_access {
        connector = google_vpc_access_connector.serverless.id
        egress    = "ALL_TRAFFIC"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_project_service.required,
    google_service_account.cloud_run,
  ]
}

# Allow unauthenticated access to the API service.
resource "google_cloud_run_service_iam_member" "api_invoker" {
  location = google_cloud_run_service.api.location
  project  = var.project_id
  service  = google_cloud_run_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Cloud Run service for Web.
resource "google_cloud_run_service" "web" {
  name     = local.web_service_name
  location = var.region
  project  = var.project_id

  metadata {
    annotations = {
      "run.googleapis.com/ingress" = "all"
    }
  }

  template {
    spec {
      service_account_name = google_service_account.cloud_run.email

      containers {
        image = "gcr.io/${var.project_id}/workright-hris-web:latest"

        env {
          name = "NEXT_PUBLIC_API_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.api_url.secret_id
              key  = "latest"
            }
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_project_service.required,
    google_service_account.cloud_run,
    google_cloud_run_service.api,
  ]
}

# Allow unauthenticated access to the web service.
resource "google_cloud_run_service_iam_member" "web_invoker" {
  location = google_cloud_run_service.web.location
  project  = var.project_id
  service  = google_cloud_run_service.web.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
