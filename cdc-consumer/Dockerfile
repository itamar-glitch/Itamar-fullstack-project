FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src/ ./src/

# Set environment variables
ENV NODE_ENV=production

# Start the consumer
CMD ["npm", "start"]

