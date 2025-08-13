# Backend build
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy source
COPY . .

# Expose port
EXPOSE 4000

CMD ["npm", "start"]
