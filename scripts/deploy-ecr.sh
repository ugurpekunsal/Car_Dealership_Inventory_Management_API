#!/bin/bash
set -e  # Exit on error

echo "Setting up AWS account ID..."
export AWS_ACCOUNT_ID=820242903063

echo "Logging into AWS ECR..."
aws ecr get-login-password --region ca-central-1 | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.ca-central-1.amazonaws.com"

echo "Creating ECR repository (if it doesn't exist)..."
aws ecr create-repository --repository-name car-dealership-api --region ca-central-1 || true

echo "Building Docker image..."
docker build -t car-dealership-api .

echo "Tagging image..."
docker tag car-dealership-api:latest "$AWS_ACCOUNT_ID.dkr.ecr.ca-central-1.amazonaws.com/car-dealership-api:latest"

echo "Pushing to ECR..."
docker push "$AWS_ACCOUNT_ID.dkr.ecr.ca-central-1.amazonaws.com/car-dealership-api:latest"

echo "Done! Image pushed successfully." 