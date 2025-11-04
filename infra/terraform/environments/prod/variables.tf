variable "project" {
  type        = string
  description = "Human friendly project name used as a resource prefix"
}

variable "project_id" {
  type        = string
  description = "GCP project ID that hosts the infrastructure"
}

variable "region" {
  type        = string
  description = "GCP region for regional resources"
  default     = "australia-southeast1"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR range for the VPC"
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidr" {
  type        = string
  description = "CIDR for the public tier subnet"
  default     = "10.20.10.0/24"
}

variable "private_subnet_cidr" {
  type        = string
  description = "CIDR for the private tier subnet"
  default     = "10.20.20.0/24"
}

variable "db_tier" {
  type        = string
  description = "Machine tier for the Cloud SQL instance"
  default     = "db-custom-2-7680"
}

variable "db_availability_type" {
  type        = string
  description = "Availability configuration for the Cloud SQL instance (ZONAL or REGIONAL)"
  default     = "REGIONAL"
}

variable "db_username" {
  type        = string
  description = "Database admin username"
}

variable "db_password" {
  type        = string
  description = "Database admin password"
  sensitive   = true
}
