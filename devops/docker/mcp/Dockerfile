FROM node:20-alpine

WORKDIR /app

# Install dependencies for pdf-parse and PDF generation
RUN apk add --no-cache python3 make g++ \
    && apk add --no-cache --repository=https://dl-cdn.alpinelinux.org/alpine/edge/testing wkhtmltopdf || \
    (apk add --no-cache chromium && ln -s /usr/bin/chromium-browser /usr/bin/wkhtmltopdf)

# Copy package files
COPY backend/mcp/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY backend/mcp/src/ ./src/

# Create data directory
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "src/index.js"]