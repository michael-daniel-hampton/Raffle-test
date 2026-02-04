
FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --legacy-peer-deps

# Copy only Prisma files first for generate step
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma client before build
RUN npm run prisma:generate

# Copy rest of the files
COPY . .

# Build the app
RUN npm run build

EXPOSE 3001

# Wait for Postgres before starting (using wait-for-it script)
COPY wait-for-it.sh ./wait-for-it.sh
RUN chmod +x ./wait-for-it.sh

CMD ["./wait-for-it.sh", "postgres:5432", "--", "npm", "run", "start"]
