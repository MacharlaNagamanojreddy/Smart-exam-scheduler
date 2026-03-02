FROM node:20-alpine

WORKDIR /app/backend

# Python is required by the scheduling algorithm process.
RUN apk add --no-cache python3

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/. .
COPY algorithm /app/algorithm

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
