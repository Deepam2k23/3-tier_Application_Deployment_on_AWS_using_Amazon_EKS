pipeline {
    agent any

    environment {
        AWS_REGION        = "us-east-1"
        AWS_ACCOUNT_ID    = "285849851869"

        ECR_REPO_BACKEND  = "285849851869.dkr.ecr.us-east-1.amazonaws.com/sms-backend"
        ECR_REPO_FRONTEND = "285849851869.dkr.ecr.us-east-1.amazonaws.com/sms-frontend"

        IMAGE_TAG         = "${BUILD_NUMBER}"
        EKS_CLUSTER       = "student-mgmt-system-eks"
        K8S_NAMESPACE     = "student-mgmt-system"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build - Backend') {
            steps {
                dir('backend') {
                    sh 'mvn -B clean package -DskipTests'
                }
            }
        }

        stage('Unit Test') {
            steps {
                dir('backend') {
                    sh 'mvn -B test'
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                sh '''
                    set -e

                    echo "Logging in to Amazon ECR..."

                    aws ecr get-login-password \
                      --region "$AWS_REGION" \
                      | docker login \
                      --username AWS \
                      --password-stdin "$ECR_REPO_BACKEND"

                    echo "Building backend image..."

                    docker build \
                      -t "$ECR_REPO_BACKEND:$IMAGE_TAG" \
                      backend/

                    echo "Pushing backend image..."

                    docker push "$ECR_REPO_BACKEND:$IMAGE_TAG"

                    echo "Building frontend image..."

                    docker build \
                      -t "$ECR_REPO_FRONTEND:$IMAGE_TAG" \
                      frontend/

                    echo "Pushing frontend image..."

                    docker push "$ECR_REPO_FRONTEND:$IMAGE_TAG"
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                    set -e

                    echo "Updating kubeconfig..."

                    aws eks update-kubeconfig \
                      --name "$EKS_CLUSTER" \
                      --region "$AWS_REGION"

                    echo "Updating backend deployment..."

                    kubectl set image deployment/backend-deployment \
                      backend="$ECR_REPO_BACKEND:$IMAGE_TAG" \
                      -n "$K8S_NAMESPACE"

                    echo "Updating frontend deployment..."

                    kubectl set image deployment/frontend-deployment \
                      frontend="$ECR_REPO_FRONTEND:$IMAGE_TAG" \
                      -n "$K8S_NAMESPACE"

                    echo "Waiting for backend rollout..."

                    kubectl rollout status \
                      deployment/backend-deployment \
                      -n "$K8S_NAMESPACE" \
                      --timeout=5m

                    echo "Waiting for frontend rollout..."

                    kubectl rollout status \
                      deployment/frontend-deployment \
                      -n "$K8S_NAMESPACE" \
                      --timeout=5m

                    echo "Deployment completed successfully."

                    kubectl get pods \
                      -n "$K8S_NAMESPACE" \
                      -o wide
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully and application was deployed to EKS.'
        }

        failure {
            echo 'Pipeline failed. Check the stage logs above.'
        }
    }
}
