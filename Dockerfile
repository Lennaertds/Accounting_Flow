# Dockerfile
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Fix voor corepack netwerkfouten: we activeren pnpm direct
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# 👇 1.1 - libc6-compat voor native modules (argon2/swc)
RUN apk add --no-cache libc6-compat libpq 

FROM base AS dev-deps
WORKDIR /app
COPY package.json pnpm*.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm*.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

EXPOSE 3000
CMD ["node", "dist/src/main"]