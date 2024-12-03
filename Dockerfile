# Usa una imagen base de Node.js LTS
FROM node:18-slim

# Instala las dependencias necesarias para Puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto
COPY package*.json ./
COPY . .

# Instala las dependencias
RUN npm install

# Expone el puerto que usa tu aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]