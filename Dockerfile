# Use official Node.js 18 image
FROM node:20-bullseye-slim
RUN apt-get update && \
    apt-get install -y openssl libssl1.1 bash python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app


# Copy only the package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

# Copy Prisma schema and TypeScript config if used
COPY prisma ./prisma

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript project
RUN npm run build

# Expose the port your app runs on
EXPOSE 6000

# Start the application using PM2
CMD ["pm2-runtime", "dist/app.js"]
