FROM node:20-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-slim

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend/src/ ./backend/src/

# Copy built frontend from build stage
COPY --from=frontend-build /app/frontend/dist/ ./frontend/dist/

# Create data directory for SQLite
RUN mkdir -p /app/backend/data

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

WORKDIR /app/backend
CMD ["node", "src/server.js"]
