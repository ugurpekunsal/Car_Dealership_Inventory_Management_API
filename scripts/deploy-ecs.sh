#!/bin/bash
set -e

echo "Creating ECS task execution role..."
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file://scripts/ecs-role-policy.json || true

echo "Attaching policies to role..."
aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy || true

echo "Registering task definition..."
aws ecs register-task-definition --cli-input-json file://task-definition.json

echo "Creating ECS cluster (if it doesn't exist)..."
aws ecs create-cluster --cluster-name car-dealership-cluster

echo "Creating log group (if it doesn't exist)..."
aws logs create-log-group --log-group-name /ecs/car-dealership-api || true

echo "Creating security group (if it doesn't exist)..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)
SG_ID=$(aws ec2 create-security-group --group-name car-dealership-api-sg --description "Security group for car dealership API" --vpc-id $VPC_ID --query "GroupId" --output text || aws ec2 describe-security-groups --filters "Name=group-name,Values=car-dealership-api-sg" --query "SecurityGroups[0].GroupId" --output text)

echo "Configuring security group..."
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3000 --cidr 0.0.0.0/0 || true

echo "Getting subnet IDs..."
# Get subnet IDs and format them properly for the AWS CLI
SUBNET_IDS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'Subnets[*].SubnetId' \
    --output text | tr '\t' ',' | sed 's/,$//')

echo "Creating ECS service..."
aws ecs create-service \
    --cluster car-dealership-cluster \
    --service-name car-dealership-service \
    --task-definition car-dealership-api \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
    --platform-version LATEST

echo "Deployment completed successfully!" 