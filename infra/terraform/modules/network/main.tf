variable "project_id" {
  type        = string
  description = "GCP project ID where the network will be created"
}

variable "name" {
  type        = string
  description = "Name prefix for the network stack"
}

variable "region" {
  type        = string
  description = "Primary region for the subnets"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block that represents the overall VPC address space"
}

variable "public_subnet_cidr" {
  type        = string
  description = "CIDR block for the public subnet"
}

variable "private_subnet_cidr" {
  type        = string
  description = "CIDR block for the private subnet"
}

resource "google_compute_network" "this" {
  project                 = var.project_id
  name                    = "${var.name}-vpc"
  auto_create_subnetworks = false
  routing_mode            = "GLOBAL"
}

resource "google_compute_subnetwork" "public" {
  project                  = var.project_id
  name                     = "${var.name}-public"
  ip_cidr_range            = var.public_subnet_cidr
  region                   = var.region
  network                  = google_compute_network.this.id
  private_ip_google_access = true
}

resource "google_compute_subnetwork" "private" {
  project                  = var.project_id
  name                     = "${var.name}-private"
  ip_cidr_range            = var.private_subnet_cidr
  region                   = var.region
  network                  = google_compute_network.this.id
  private_ip_google_access = true
}

resource "google_compute_firewall" "internal_allow" {
  project = var.project_id
  name    = "${var.name}-allow-internal"
  network = google_compute_network.this.name

  allow {
    protocol = "all"
  }

  source_ranges = [var.vpc_cidr]
}

output "network_id" {
  value = google_compute_network.this.id
}

output "network_self_link" {
  value = google_compute_network.this.self_link
}

output "public_subnet_id" {
  value = google_compute_subnetwork.public.id
}

output "private_subnet_id" {
  value = google_compute_subnetwork.private.id
}
