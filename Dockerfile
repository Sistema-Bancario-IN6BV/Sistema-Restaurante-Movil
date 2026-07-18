# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Este Dockerfile solo tiene una etapa útil: "development". Una app Expo
# en workflow gestionado no se "construye para producción" dentro de un
# contenedor -- eso ocurre en la nube vía "eas build" o en Xcode/Android
# Studio. Este contenedor existe únicamente para correr Metro (el bundler)
# durante el desarrollo, servido a un dispositivo físico o emulador en LAN.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store-movil,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM dependencies AS development

ENV NODE_ENV=development

# Evita que el CLI de Expo se quede esperando respuestas interactivas
# (p. ej. prompts de telemetría) en un contenedor sin TTY garantizado.
ENV CI=1

# Puerto único de Metro en SDKs modernas de Expo: sirve tanto el
# manifiesto de la app como el bundle de JS bajo demanda. Configurable
# (no fijo como en los otros Dockerfiles) porque, a diferencia de un
# reverse-proxy HTTP normal, el propio Metro ESCRIBE su puerto dentro del
# manifiesto/QR que le manda al teléfono -- si el puerto publicado en el
# host y el puerto que Metro cree que tiene fueran distintos, el QR
# apuntaría a una dirección que Docker no está reenviando de verdad.
ENV METRO_PORT=8081
EXPOSE 8081

# "--lan" fuerza a anunciar una IP de red local en vez de intentar un
# túnel. La IP concreta que se anuncia la fija REACT_NATIVE_PACKAGER_HOSTNAME,
# inyectada como variable de entorno desde docker-compose (Fase 6/7) con la
# IP LAN real de tu PC -- dentro del contenedor, la autodetección de Metro
# devolvería la IP interna de Docker, inalcanzable desde tu teléfono.
CMD ["sh", "-c", "npx expo start --lan --port ${METRO_PORT}"]
