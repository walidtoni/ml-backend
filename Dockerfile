# Use Ubuntu as the base image
FROM node:18-slim

# Set non-interactive mode for APT and environment variables
# ENV PYTHON=/usr/bin/python3
ENV BUCKET_URL=https://storage.googleapis.com/mlgcwalidbangkit/model-in-prod/model.json

# Print a debug message to verify Docker is working
RUN echo "Docker is working!"

# Install system dependencies
# RUN apt-get update && apt-get install -y \
#     python3 \
#     python3-pip \
#     python3-dev \
#     build-essential \
#     libglib2.0-0 \
#     libsm6 \
#     libxext6 \
#     libxrender-dev \
#     wget \
#     curl \
#     && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /mlbe

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install nodemon for development
# RUN npm install -g nodemon

# Rebuild TensorFlow.js from source to ensure compatibility
# RUN npm rebuild @tensorflow/tfjs-node --build-from-source

# Copy the entire source code into the container
COPY . .

# Expose the application port
EXPOSE 8080

# Define the default command to use nodemon for development
CMD ["node", "src/app.js"]
