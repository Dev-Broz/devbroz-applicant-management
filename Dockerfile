# Use Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
