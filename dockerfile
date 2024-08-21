# Use the official Node.js image.
FROM node:18-alpine

# Set the working directory.
WORKDIR /

# Copy the package.json and package-lock.json files.
COPY package*.json ./

# Install the dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Build the Nest.js application.
RUN npm run build

# Expose the port the app runs on.
EXPOSE 8000

# Start the application.
CMD ["npm", "run", "start:dev"]
