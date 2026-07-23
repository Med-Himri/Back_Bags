# Use Node.js v14
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose the port
EXPOSE 5000

CMD [ "node", "index.js" ]