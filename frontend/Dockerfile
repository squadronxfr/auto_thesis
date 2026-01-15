FROM node:20-alpine

WORKDIR /app

# Installer les deps (npm)
COPY package.json ./
RUN npm install

# Copier le code
COPY . .

# Vite doit écouter sur 0.0.0.0 dans Docker
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# ========================= ICI C'EST LA VERSION DEV DU FRONTEND =================
# FROM node:20-alpine

# WORKDIR /app

# # --- Install deps ---
# # Si tu as package-lock.json, copie-le aussi (recommandé)
# COPY package.json ./
# # COPY package-lock.json ./

# # Si pas de package-lock, utilise npm install (moins reproductible, mais OK)
# RUN npm install

# # --- App source ---
# COPY . .

# # Variables Vite au build (injectées au build)
# ARG VITE_API_URL
# ENV VITE_API_URL=${VITE_API_URL}

# # --- Build ---
# RUN npm run build

# # --- Serve static build ---
# RUN npm i -g serve

# EXPOSE 3000
# CMD ["serve", "-s", "dist", "-l", "3000"]

# # =========================
# # (Option DEV) si tu veux un jour :
# # CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
# # =========================
