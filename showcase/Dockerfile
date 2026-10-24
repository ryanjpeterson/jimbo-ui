# The showcase as a web app: build it with Node, serve the static files with nginx.
# Build from the repo root (it assembles reference/, foundation/ and starter/):
#   docker compose up --build        (see compose.yaml)
FROM node:22-alpine AS build
WORKDIR /repo
COPY showcase/package.json showcase/package-lock.json* showcase/
RUN npm --prefix showcase install --no-audit --no-fund
COPY . .
RUN npm --prefix showcase run build

FROM nginx:1.27-alpine
COPY --from=build /repo/showcase/dist /usr/share/nginx/html
EXPOSE 80
