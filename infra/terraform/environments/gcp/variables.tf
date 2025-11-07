variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud region"
  type        = string
}

variable "environment" {
  description = "Deployment environment identifier (e.g. prod, staging)"
  type        = string
}

variable "database_tier" {
  description = "Cloud SQL machine tier"
  type        = string
  default     = "db-custom-1-3840"
}

variable "workloads_cidr" {
  description = "CIDR range for the primary VPC subnet"
  type        = string
  default     = "10.10.0.0/24"
}

variable "serverless_connector_cidr" {
  description = "CIDR range dedicated to the Serverless VPC Access connector"
  type        = string
  default     = "10.8.0.0/28"
}
