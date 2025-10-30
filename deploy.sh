#!/bin/bash

# CONFIG
IMAGE_NAME="portfolio"
CONTAINER_NAME="portfolio-container"
PORT=6000
ENV_FILE=".env"

echo "🚀 Starting Deployment Process..."

# Step 1: Stop and remove the old container
echo "🛑 Stopping and removing old container (if exists)..."
docker stop $CONTAINER_NAME 2>/dev/null
docker rm $CONTAINER_NAME 2>/dev/null

# Step 2: Build the Docker image
echo "🐳 Building Docker image: $IMAGE_NAME ..."
docker build -t $IMAGE_NAME .

# Step 3: Run the container
echo "📦 Running container: $CONTAINER_NAME ..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:$PORT \
  --env-file $ENV_FILE \
-e TZ=Asia/Kolkata \
  $IMAGE_NAME

# Step 4: Show container logs
echo "📄 Showing PM2 logs..."
sleep 5
docker exec -it $CONTAINER_NAME pm2 logs
