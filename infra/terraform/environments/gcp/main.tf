terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud SQL instance
resource "google_sql_database_instance" "workright" {
  name             = "workright-db-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    backup_configuration {
      enabled = true
    }

    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
  }
}

# Cloud Storage bucket
resource "google_storage_bucket" "storage" {
  name          = "workright-hris-storage-${var.environment}"
  location      = var.region
  force_destroy = true

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}

# Redis instance (Memorystore)
resource "google_redis_instance" "cache" {
  name           = "workright-redis-${var.environment}"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.region

  authorized_network = google_compute_network.vpc_network.id
}

# VPC network
resource "google_compute_network" "vpc_network" {
  name                    = "workright-network-${var.environment}"
  auto_create_subnetworks = false
}

# Cloud Run service for API
resource "google_cloud_run_service" "api" {
  name     = "workright-api-${var.environment}"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/workright-hris-api:latest"

        env {
          name  = "NODE_ENV"
          value = "production"
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
      }
    }
  }
}

# Cloud Run service for Web
resource "google_cloud_run_service" "web" {
  name     = "workright-web-${var.environment}"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/workright-hris-web:latest"

        env {
          name  = "NEXT_PUBLIC_API_URL"
          value = google_cloud_run_service.api.status[0].url
        }
      }
    }
  }
}

# Secret Manager secrets
resource "google_secret_manager_secret" "database_url" {
  secret_id = "database-url"
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id = "redis-url"
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret" "api_url" {
  secret_id = "api-url"
  replication {
    automatic = true
  }
}
