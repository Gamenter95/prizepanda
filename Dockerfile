# 1. Base image
FROM node:18

# 2. Create app directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the files
COPY . .

# 6. Build both client + server
RUN npm run build

# 7. Expose server port
EXPOSE 3000

# 8. Start your server
CMD ["npm", "start"]
