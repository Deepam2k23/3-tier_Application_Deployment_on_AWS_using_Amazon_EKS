# Student Management System — 3-Tier Application on AWS EKS

A 3-tier CRUD app (React → Spring Boot → MySQL) built to match the reference
architecture: Route 53 → CloudFront (+WAF) → EKS-hosted Frontend/Backend tiers
→ RDS MySQL, with Prometheus/CloudWatch/Grafana observability and a
Jenkins → ECR → EKS (Helm/kubectl) CI/CD pipeline, provisioned with Terraform.

## Structure

```
student-management-system/
├── backend/          Spring Boot REST API (Student CRUD), Dockerfile
├── frontend/         React SPA + Nginx reverse proxy, Dockerfile
├── k8s/              Kubernetes manifests (namespace, deployments, services,
│                      HPA, ALB Ingress, MySQL StatefulSet for local dev)
├── terraform/        VPC, EKS cluster, RDS MySQL, security groups
└── Jenkinsfile       CI/CD pipeline: checkout → build → test → docker push → deploy
```

## Run locally (no Kubernetes)

```bash
# 1. Start MySQL
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=studentdb -p 3306:3306 mysql:8.0

# 2. Backend
cd backend && mvn spring-boot:run
# API on http://localhost:8080/api/students

# 3. Frontend
cd frontend && npm install
REACT_APP_API_URL=http://localhost:8080/api/students npm start
# UI on http://localhost:3000
```

## Deploy to AWS EKS

1. **Provision infra** — `cd terraform && terraform init && terraform apply`
   (creates VPC with public/private subnets across 2 AZs, EKS cluster, RDS MySQL,
   security groups restricting DB access to EKS nodes only).
2. **Build & push images to ECR** — handled by the `Jenkinsfile`, or manually:
   ```bash
   docker build -t <ecr-repo>/sms-backend:latest backend/
   docker build -t <ecr-repo>/sms-frontend:latest frontend/
   ```
3. **Point the backend at RDS** — set `DB_HOST` in `k8s/04-backend-configmap.yaml`
   to the Terraform `rds_endpoint` output (skip the `mysql-statefulset.yaml` —
   that's for local/dev only).
4. **Apply manifests**:
   ```bash
   kubectl apply -f k8s/00-namespace.yaml
   kubectl apply -f k8s/01-mysql-secret.yaml
   kubectl apply -f k8s/04-backend-configmap.yaml
   kubectl apply -f k8s/05-backend-deployment.yaml
   kubectl apply -f k8s/06-frontend-deployment.yaml
   kubectl apply -f k8s/07-ingress.yaml
   ```
5. **Front the ALB with CloudFront + Route 53 + WAF** (per the reference
   diagram) and wire up Amazon Managed Prometheus + Grafana dashboards against
   the `/actuator/prometheus` endpoint the backend already exposes.

## API endpoints

| Method | Path                          | Description            |
|--------|-------------------------------|-------------------------|
| GET    | /api/students                 | List all students       |
| GET    | /api/students/{id}             | Get one student         |
| POST   | /api/students                 | Create a student        |
| PUT    | /api/students/{id}             | Update a student        |
| DELETE | /api/students/{id}             | Delete a student        |
| GET    | /api/students/course/{course}  | Filter by course        |
| GET    | /api/students/search?keyword=  | Search by name          |

## Notes

- Replace placeholder values (`<ECR_REPO_URI>`, `<ACCOUNT_ID>`, `<ACM_CERT_ARN>`,
  `<WAF_WEB_ACL_ARN>`) before deploying.
- Secrets in `01-mysql-secret.yaml` are placeholders — use AWS Secrets Manager +
  External Secrets Operator in production instead of committing real credentials.
- `spring.jpa.hibernate.ddl-auto=update` is convenient for demos; use versioned
  migrations (Flyway/Liquibase) for a real production rollout.
