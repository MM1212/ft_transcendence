FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV ROOT_PATH="../"
RUN corepack enable

COPY ${ROOT_PATH}/envs/.env.production /app/envs/.env.production
COPY ${ROOT_PATH}/envs/.tokens.env /app/envs/.tokens.env
COPY ${ROOT_PATH}/src /app/src
COPY ${ROOT_PATH}/Makefile /app/Makefile
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    make git-lfs \
    && rm -rf /var/lib/apt/lists/*

RUN make env mode=production
RUN make client_gen_icon icon=--all

FROM base AS prod-deps

WORKDIR /app/src/server
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN pnpx prisma generate
WORKDIR /app/src/client
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base as build

WORKDIR /app/src/server
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build
WORKDIR /app/src/client
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

FROM base

COPY --from=prod-deps /app/src/server/node_modules /app/src/server/node_modules
COPY --from=prod-deps /app/src/server/prisma /app/src/server/prisma
COPY --from=prod-deps /app/src/client/node_modules /app/src/client/node_modules

COPY --from=build /app/src/server/dist /app/src/server/dist
COPY --from=build /app/src/client/dist /app/src/server/dist/public

EXPOSE 3000
ENTRYPOINT [ "setup.sh" ]