# Usa uma imagem do Node.js
FROM node:20-slim

# Instala o FFmpeg, Python e o yt-dlp
# O yt-dlp precisa do Python, e o FFmpeg é essencial para converter áudio e vídeo
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY package*.json ./
RUN npm install

# Copia o resto do código
COPY . .

# Comando para iniciar o bot
CMD ["node", "index.js"]
