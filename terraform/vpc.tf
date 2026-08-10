module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-vpc"
  cidr = var.vpc_cidr

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]   # AZ A public - Frontend tier
  private_subnets = ["10.0.11.0/24", "10.0.12.0/24"] # AZ A/B private - Backend + DB tiers

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = { Project = var.project_name }
}
