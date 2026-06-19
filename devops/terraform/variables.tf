variable "aws_region" {
  default = "eu-central-1"
}

variable "db_name" {
  default = "vectorapi"
}

variable "db_username" {
  default = "vectoruser"
}

variable "db_password" {
  description = "RDS master password (set via TF_VAR_db_password env var)"
  type        = string
  sensitive   = true
}

variable "ec2_security_group_id" {
  description = "Security group ID of the EC2 instance, allowed to reach RDS"
  type        = string
}
