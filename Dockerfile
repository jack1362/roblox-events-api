# 1. Base image
FROM node:18-alpine

# 2. Set working dir
WORKDIR /usr/src/app

# 3. Copy manifest and install PM2 + deps
COPY package*.json ./
RUN npm install -g pm2 \
 && npm install --production

# 4. Copy source
COPY . .

# 5. Document listening port (adjust if your app uses a different one)
EXPOSE 7989

# 6. Start under PM2’s foreground runtime
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]
