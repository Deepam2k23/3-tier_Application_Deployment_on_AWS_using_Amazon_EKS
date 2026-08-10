output "eks_cluster_endpoint" { value = module.eks.cluster_endpoint }
output "rds_endpoint"         { value = aws_db_instance.mysql.address }
output "vpc_id"               { value = module.vpc.vpc_id }
