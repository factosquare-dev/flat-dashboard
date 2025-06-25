FROM node:20 AS builder

WORKDIR /flat

COPY flat/package*.json ./
RUN npm install

COPY flat/ .
RUN npm run build

FROM nginx:alpine

COPY dashboard/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /flat/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]