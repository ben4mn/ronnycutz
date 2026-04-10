FROM node:20-alpine

# better-sqlite3 needs build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# keep dev deps out of prod image
RUN npm prune --production

ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "server.js"]
