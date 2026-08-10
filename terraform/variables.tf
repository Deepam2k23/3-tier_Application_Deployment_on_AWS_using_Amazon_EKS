variable "aws_region"   { default = "us-east-1" }
variable "project_name" { default = "student-mgmt-system" }
variable "vpc_cidr"     { default = "10.0.0.0/16" }
variable "db_username"  { default = "sms_app" }
variable "db_password"  {
  sensitive = true
  description = "Set via TF_VAR_db_password or a secrets manager, never commit in plain text"
}
