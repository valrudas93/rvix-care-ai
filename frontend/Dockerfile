FROM node:18-bullseye

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy source
COPY . .

EXPOSE 8080

# Start Vite dev server and listen on all interfaces for container access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
