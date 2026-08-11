# Use the official Node.js image as the base image
FROM node:20 as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Copy the rest of the application code
COPY . .

ARG VITE_API_BASE_URL
ARG VITE_APP_API_IMAGE
ARG VITE_APP_PDF_LICENSE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_API_IMAGE=$VITE_APP_API_IMAGE
ENV VITE_APP_PDF_LICENSE=$VITE_APP_PDF_LICENSE

ENV VITE_API_BASE_URL="https://api.goalchinesedoc.com/api"
ENV VITE_APP_API_IMAGE="https://api.goalchinesedoc.com/"
ENV VITE_APP_PDF_LICENSE="demo:1734577804655:7ea8e4310300000000c8233fd7af5b03b95ca487e4adb98e8228071952"

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm i; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && corepack prepare pnpm@8.6.2 --activate && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Build vue.js based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm run build; \
  else yarn build; \
  fi

# Use Nginx as the production server
FROM nginx:stable-alpine

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Vue.js files to the Nginx web server directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
