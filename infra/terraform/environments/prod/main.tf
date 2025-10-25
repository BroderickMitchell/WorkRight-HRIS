terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

provider "aws" {
  region = var.region
}

module "network" {
  source     = "../../modules/network"
  name       = var.project
  cidr_block = var.vpc_cidr
}

resource "aws_rds_cluster" "postgres" {
  engine         = "aurora-postgresql"
  engine_version = "15.3"
  cluster_identifier = "${var.project}-aurora"
  master_username    = var.db_username
  master_password    = var.db_password
  database_name      = "workright"
  skip_final_snapshot = true
}

resource "aws_s3_bucket" "attachments" {
  bucket = "${var.project}-attachments"
  force_destroy = true
}

output "database_endpoint" {
  value = aws_rds_cluster.postgres.endpoint
}
