FROM node:18-slim
ENV BUCKET_URL=https://storage.googleapis.com/mlgcwalidbangkit/model-in-prod/model.json
RUN echo "Docker is working!"
WORKDIR /mlbe
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "src/app.js"]
