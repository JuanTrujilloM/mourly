FROM node:24-bookworm-slim AS build
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# Runs `prisma migrate deploy` as a one-off container; the runtime image has no Prisma CLI.
FROM build AS migrate
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/dist ./dist
RUN mkdir uploads && chown node:node uploads
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/src/main.js"]
