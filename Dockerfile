FROM node:18-alpine

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production
ENV COOKIE_DOMAIN=nas.microdev.cn:8023

# 暴露端口（假设您的应用运行在3000端口）
EXPOSE 3000

# 启动应用
CMD ["npm", "start"] 