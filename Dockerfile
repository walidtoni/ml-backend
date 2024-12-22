# Use Ubuntu as the base image
FROM ubuntu:latest

# Set non-interactive mode for APT and environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHON=/usr/bin/python3
ENV BUCKET_URL=https://storage.googleapis.com/mlgcwalidbangkit/model-in-prod/model.json

# Print a debug message to verify Docker is working
RUN echo "Docker is working!"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
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

# Install Node.js dependencies
RUN npm install

# Rebuild TensorFlow.js from source to ensure compatibility
RUN npm rebuild @tensorflow/tfjs-node --build-from-source

# Copy the entire source code into the container
COPY . .

# Expose the application port
EXPOSE 8080

# Define the default command to start the application
CMD ["node", "src/app.js"]
