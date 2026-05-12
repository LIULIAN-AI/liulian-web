# Simple devcontainer based on Microsoft's node image
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-18

# Install a few helpful packages
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    zsh \
    lsof \
    curl \
    git \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Default user is 'vscode' in the base image
USER vscode
