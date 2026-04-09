# syntax=docker/dockerfile:1.7
FROM node:22-alpine

# Evita user root em runtime
USER node

# Diretório de trabalho
WORKDIR /app

# Copia apenas os manifests para aproveitar cache de dependências
COPY --chown=node:node package*.json ./

# Instala deps limpas (sem auditoria, mais rápido)
RUN npm ci --no-audit --no-fund

# Monta o resto do código em tempo de execução (bind mount),
# mas preserva node_modules como volume anônimo para não ser sobrescrito
VOLUME ["/app/node_modules"]

# Agora sim, copie o restante (útil para rodar sem bind mount)
COPY --chown=node:node . .

# Vite
EXPOSE 5173

# Importante para Vite em container
ENV HOST=0.0.0.0

CMD ["npm", "run", "dev"]