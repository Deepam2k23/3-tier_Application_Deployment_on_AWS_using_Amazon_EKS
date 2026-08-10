pipeline {
    agent any

    environment {
        ECR_REPO_BACKEND  = "<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/sms-backend"
        ECR_REPO_FRONTEND = "<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/sms-frontend"
        IMAGE_TAG         = "${env.BUILD_NUMBER}"
        AWS_REGION        = "us-east-1"
        EKS_CLUSTER       = "student-mgmt-system-eks"
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Build - Backend (Maven)') {
            steps {
                dir('backend') { sh 'mvn -B clean package -DskipTests' }
            }
        }

        stage('Unit Test') {
            steps {
                dir('backend') { sh 'mvn -B test' }
            }
        }

        stage('Docker Build & Push') {
            steps {
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_BACKEND
                    docker build -t $ECR_REPO_BACKEND:$IMAGE_TAG backend/
                    docker push $ECR_REPO_BACKEND:$IMAGE_TAG

                    docker build -t $ECR_REPO_FRONTEND:$IMAGE_TAG frontend/
                    docker push $ECR_REPO_FRONTEND:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy to EKS (Helm/kubectl)') {
            steps {
                sh '''
                    aws eks update-kubeconfig --name $EKS_CLUSTER --region $AWS_REGION
                    kubectl set image deployment/backend-deployment backend=$ECR_REPO_BACKEND:$IMAGE_TAG -n student-mgmt-system
                    kubectl set image deployment/frontend-deployment frontend=$ECR_REPO_FRONTEND:$IMAGE_TAG -n student-mgmt-system
                    kubectl rollout status deployment/backend-deployment -n student-mgmt-system
                    kubectl rollout status deployment/frontend-deployment -n student-mgmt-system
                '''
            }
        }
    }

    post {
        failure { echo 'Pipeline failed - check logs above.' }
        success { echo 'Deployed to EKS successfully.' }
    }
}
