# Use official Node 18 image
FROM node:18

# Create working directory
WORKDIR /app

# Copy package.json and lockfile
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code (client/, server/, shared/, etc.)
COPY . .

# Build both client & server
RUN npm run build

# Expose port that your server uses
EXPOSE 5000

# Set NODE_ENV to production (optional)
ENV NODE_ENV=production

# Command to run your production server
CMD ["npm", "start"]
