FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci -qy

COPY . .
RUN npm run build

EXPOSE 3000  

CMD ["npm", "start"] 
