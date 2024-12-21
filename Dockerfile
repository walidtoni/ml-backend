# Use an official Node.js runtime as the base image
FROM node:18-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHON=/usr/bin/python3

ENV BUCKET_URL=https://storage.googleapis.com/mlgcwalidbangkit/model-in-prod/model.json
# ENV BUCKET_URL=../submissions-model/model.json

RUN echo "Docker is working!"

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    wget \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./
# Install dependencies, including TensorFlow.js
RUN npm install
RUN npm install @tensorflow/tfjs-node@latest
RUN npm rebuild @tensorflow/tfjs-node --build-from-source

# Copy the entire source code into the container
COPY . .

# Expose the application port
EXPOSE 8080

# Define the default command to start the application
CMD ["node", "src/app.js"]
