# Use an official Python runtime as a parent image.
FROM python:3.9-slim

# Set the environment variable to use CUDA.
ENV CUDA_HOME=/usr/local

# Add the CUDA toolkit to the Docker container.
RUN mkdir -p /usr/local
RUN pacman -S cuda

# Copy the RVC-Python code into the Docker container.
COPY rvc-python /usr/local/rvc-python

# Make the RVC-Python code executable.
CMD ["usr/local/bin/python", "-m", "rvc-python"]
