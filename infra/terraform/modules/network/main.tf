variable "name" {
  type        = string
  description = "Name prefix for the network stack"
}

variable "cidr_block" {
  type        = string
  description = "CIDR block for the VPC"
}

resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "${var.name}-vpc"
  }
}

output "vpc_id" {
  value = aws_vpc.this.id
}
