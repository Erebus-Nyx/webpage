ARG UBUNTU_VERSION=24.10
# This needs to generally match the container host's environment.
ARG CUDA_VERSION=12.8
# Target the CUDA build image
#ARG ONEAPI_VERSION=2025.0.0-0-devel-ubuntu22.04
#ARG ONEAPI_LOC=opt/intel/oneapi/compiler/2025.0/bin

# ARG ONEMKL_LOC=home/nyx/workspace/oneMKL
# ARG ONEDNN_LOC=home/nyx/workspace/oneDNN
ARG BASE_CUDA_DEV_CONTAINER=nvidia/cuda:${CUDA_VERSION}-devel-ubuntu${UBUNTU_VERSION}
ARG BASE_CUDA_RUN_CONTAINER=nvidia/cuda:${CUDA_VERSION}-runtime-ubuntu${UBUNTU_VERSION}

FROM ghcr.io/ggml-org/llama.cpp:server-cuda AS build
#FROM {BASE_CUDA_DEV_CONTAINER} AS build

# CUDA architecture to build for (defaults to all supported archs)
ARG CUDA_DOCKER_ARCH=default

ENV CUDA_MAIN_VERSION=12.8
ENV LD_LIBRARY_PATH /usr/local/cuda-${CUDA_MAIN_VERSION}/compat:$LD_LIBRARY_PATH
# ENV LD_LIBRARY_PATH=/{ONEMKL_LOC}/buildWithCublas/lib:$LD_LIBRARY_PATH
# ENV LIBRARY_PATH=/{ONEMKL_LOC}/buildWithCublas/lib:$LIBRARY_PATH
# ENV LD_LIBRARY_PATH=/{ONEAPI_LOC}:$LD_LIBRARY_PATH
# ENV LIBRARY_PATH=/{ONEAPI_LOC}:$LIBRARY_PATH
# ENV CPLUS_INCLUDE_DIR=/{ONEMKL_LOC}/buildWithCublas/include:$CPLUS_INCLUDE_DIR
# ENV CPLUS_INCLUDE_DIR=/{ONEMKL_LOC}/include:$CPLUS_INCLUDE_DIR


RUN apt-get update && \
    apt-get install -y build-essential cmake python3 python3-pip git libcurl4-openssl-dev libgomp1 

#CMD ["/bin/bash", "-c", "source /opt/intel/oneapi/setvars.sh"]

WORKDIR /app

COPY . .

RUN if [ "${CUDA_DOCKER_ARCH}" != "default" ]; then \
    export CMAKE_ARGS="-DCMAKE_CUDA_ARCHITECTURES=${CUDA_DOCKER_ARCH}"; \
    fi && \
    cmake -B build -DGGML_BACKEND_DL=ON -DGGML_CUDA=ON -DGGML_CUDA_ENABLE_UNIFIED_MEMORY=ON \
    -DGGML_BLAS=ON -DGGML_BLAS_VENDOR=OpenBLAS -CMAKE_CUDA_ARCHITECTURES=native \
    -DLLAMA_CURL=ON ${CMAKE_ARGS} -DGGML_NATIVE=OFF -DGGML_CCACHE=OFF  \
    -DCMAKE_EXE_LINKER_FLAGS=-Wl,--allow-shlib-undefined . && \
    cmake --build build --config Release -j$(nproc)

RUN mkdir -p /app/lib && \
    find build -name "*.so" -exec cp {} /app/lib \;

RUN mkdir -p /app/full \
    && cp build/bin/* /app/full \
    && cp *.py /app/full \
    && cp -r gguf-py /app/full \
    && cp -r requirements /app/full \
    && cp requirements.txt /app/full \
    && cp .devops/tools.sh /app/full/tools.sh

## Base image
FROM ghcr.io/ggml-org/llama.cpp:server-cuda AS base
#FROM ${BASE_CUDA_RUN_CONTAINER} AS base

ENV CUDA_MAIN_VERSION=12.8
ENV LD_LIBRARY_PATH /usr/local/cuda-${CUDA_MAIN_VERSION}/compat:$LD_LIBRARY_PATH

RUN apt-get update \
    && apt-get install -y libgomp1 curl\
    && apt autoremove -y \
    && apt clean -y \
    && rm -rf /tmp/* /var/tmp/* \
    && find /var/cache/apt/archives /var/lib/apt/lists -not -name lock -type f -delete \
    && find /var/cache -type f -delete

COPY --from=build /app/lib/ /app

### Full
FROM base AS full

COPY --from=build /app/lib/ /app
COPY --from=build /app/full /app

WORKDIR /app

RUN apt-get update \
    && apt-get install -y \
    git \
    python3 \
    python3-pip \
    && pip install --upgrade pip setuptools wheel \
    && pip install -r requirements.txt \
    && apt autoremove -y \
    && apt clean -y \
    && rm -rf /tmp/* /var/tmp/* \
    && find /var/cache/apt/archives /var/lib/apt/lists -not -name lock -type f -delete \
    && find /var/cache -type f -delete


ENTRYPOINT ["/app/tools.sh"]

### Light, CLI only
FROM base AS light

COPY --from=build /app/lib/ /app
COPY --from=build /app/full/llama-cli /app

WORKDIR /app

ENTRYPOINT [ "/app/llama-cli" ]

### Server, Server only
FROM base AS server

ENV LLAMA_ARG_HOST=0.0.0.0

COPY --from=build /app/lib/ /app
COPY --from=build /app/full/llama-server /app

WORKDIR /app

HEALTHCHECK CMD [ "curl", "-f", "http://localhost:8080/health" ]

ENTRYPOINT [ "/app/llama-server" ]
