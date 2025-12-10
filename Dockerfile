FROM node:20-alpine

WORKDIR /app

# copia package
COPY package.json package-lock.json ./

# instala dependências
RUN npm ci

# copia código fonte
COPY . .

# expõe porta para o servidor de desenvolvimento do Vite
EXPOSE 5173

# inicia o servidor de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
