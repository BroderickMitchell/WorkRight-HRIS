output "cloud_run_api_url" {
  description = "Deployed Cloud Run API URL"
  value       = google_cloud_run_service.api.status[0].url
}

output "cloud_run_web_url" {
  description = "Deployed Cloud Run Web URL"
  value       = google_cloud_run_service.web.status[0].url
}

output "storage_bucket_name" {
  description = "Cloud Storage bucket for application assets"
  value       = google_storage_bucket.storage.name
}

output "cloud_sql_private_ip" {
  description = "Private IP address for the Cloud SQL instance"
  value       = google_sql_database_instance.workright.private_ip_address
}

output "cloud_sql_instance_connection_name" {
  description = "Connection name for Cloud SQL"
  value       = google_sql_database_instance.workright.connection_name
}

output "cloud_sql_database_name" {
  description = "Primary application database name"
  value       = google_sql_database.app.name
}

output "cloud_sql_database_user" {
  description = "Database user provisioned for the application"
  value       = google_sql_user.postgres.name
}

output "cloud_sql_database_password" {
  description = "Generated password for the application database user"
  value       = random_password.postgres.result
  sensitive   = true
}

output "redis_host" {
  description = "Hostname for the Memorystore Redis instance"
  value       = google_redis_instance.cache.host
}

output "redis_port" {
  description = "Port for the Memorystore Redis instance"
  value       = google_redis_instance.cache.port
}

output "vpc_connector" {
  description = "Serverless VPC connector for Cloud Run egress"
  value       = google_vpc_access_connector.serverless.id
}

output "service_account_email" {
  description = "Service account email used by Cloud Run services"
  value       = google_service_account.cloud_run.email
}
