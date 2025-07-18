FROM node:20

WORKDIR /flat

# Copy package files first for better caching
COPY flat/package*.json ./
RUN npm install --legacy-peer-deps

# Source code will be mounted as volume in dev environment
# No need to copy source code for dev

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
