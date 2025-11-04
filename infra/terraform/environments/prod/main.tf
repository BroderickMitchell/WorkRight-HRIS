terraform {
  required_version = ">= 1.7.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.32"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  services = [
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
    "run.googleapis.com"
  ]
}

resource "google_project_service" "enabled" {
  for_each = toset(local.services)

  project = var.project_id
  service = each.value

  disable_on_destroy = false
}

module "network" {
  source              = "../../modules/network"
  project_id          = var.project_id
  name                = var.project
  region              = var.region
  vpc_cidr            = var.vpc_cidr
  public_subnet_cidr  = var.public_subnet_cidr
  private_subnet_cidr = var.private_subnet_cidr
  depends_on          = [google_project_service.enabled]
}

resource "google_compute_global_address" "private_service_range" {
  name          = "${var.project}-psa"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = module.network.network_self_link
  project       = var.project_id
  depends_on    = [module.network]
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = module.network.network_self_link
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_service_range.name]
  depends_on              = [google_project_service.enabled]
}

resource "google_sql_database_instance" "postgres" {
  name             = "${var.project}-postgres"
  database_version = "POSTGRES_15"
  region           = var.region
  project          = var.project_id

  settings {
    tier = var.db_tier
    availability_type = var.db_availability_type

    ip_configuration {
      ipv4_enabled    = false
      private_network = module.network.network_self_link
    }

    backup_configuration {
      enabled = true
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }
  }

  deletion_protection = true

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "workright" {
  name     = "workright"
  instance = google_sql_database_instance.postgres.name
  project  = var.project_id
}

resource "google_sql_user" "app" {
  name     = var.db_username
  instance = google_sql_database_instance.postgres.name
  project  = var.project_id
  password = var.db_password
}

resource "random_id" "attachments_suffix" {
  byte_length = 4
}

resource "google_storage_bucket" "attachments" {
  name          = "${var.project}-attachments-${random_id.attachments_suffix.hex}"
  location      = var.region
  project       = var.project_id
  force_destroy = false

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

output "database_instance_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

output "attachments_bucket" {
  value = google_storage_bucket.attachments.name
}
