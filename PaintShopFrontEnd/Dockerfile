FROM node:26.13.0-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 4200
CMD ["npm", "run", "ng", "--", "serve", "--host", "0.0.0.0", "--configuration", "docker", "--proxy-config", "proxy.docker.conf.json", "--poll", "1000"]
