FROM node:20-alpine AS builder

WORKDIR /app

COPY . .
RUN npm install
RUN npm install -g @angular/cli
RUN ng build --configuration=production

FROM nginx:1.29.1-alpine AS runner

COPY --from=builder /app/dist/rdl/browser /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

ENTRYPOINT ["nginx", "-g", "daemon off;"]
