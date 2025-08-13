# ---------- FRONTEND BUILD STAGE ----------
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ---------- NGINX SERVE STAGE ----------
FROM nginx:alpine

# Remove default Nginx config and add our own resilient config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
