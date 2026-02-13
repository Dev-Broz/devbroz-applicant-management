# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
