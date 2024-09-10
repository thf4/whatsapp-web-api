# Usando uma imagem base com Node.js
FROM node:20-alpine

# Setando o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copiando os arquivos de configuração e dependências
COPY ../package*.json ./

# Instalando as dependências
RUN npm install

RUN npm install -g pm2
# Copiando o restante da aplicação
COPY . .

# Compilando o código TypeScript
RUN npm run build

# Expondo a porta que a aplicação vai rodar
EXPOSE 3000

# Definindo o comando de execução da aplicação
CMD ["pm2-runtime", "ecosystem.config.js"]
