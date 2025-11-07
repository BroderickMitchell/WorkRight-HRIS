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
