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

# Expose port (Railway will use $PORT)
EXPOSE 8080

# Start the app - use PORT env variable from Railway
CMD ["sh", "-c", "vite preview --host 0.0.0.0 --port ${PORT:-8080}"]
