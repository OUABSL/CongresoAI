FROM node:20

WORKDIR /app

RUN  rm -rf node_modules

RUN npm cache clean --force

COPY package*.json ./
RUN npm ci -qy

COPY . .
RUN npm run build

EXPOSE 3000  

CMD ["npm", "start"] 