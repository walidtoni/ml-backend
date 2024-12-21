# Use an official Node.js runtime as the base image
FROM ubuntu:20.04

ENV BUCKET_URL=https://storage.googleapis.com/mlgcwalidbangkit/model-in-prod/model.json

RUN echo "Docker is working!"

# Set the working directory inside the container
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    wget \
    curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install TensorFlow
RUN pip3 install --no-cache-dir tensorflow

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./

# Install dependencies, including TensorFlow.js
RUN npm install

# Copy the entire source code into the container
COPY . .

# Expose the application port
EXPOSE 8080

# Define the default command to start the application
CMD ["node", "src/app.js"]
