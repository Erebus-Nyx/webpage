


### Using the following docker-compose.yml setups

```console
  nginx_proxy:
    image: docker.io/jc21/nginx-proxy-manager:latest
    container_name: nginx_proxy
    restart: unless-stopped
    pull_policy: always
    tty: true
    ports:
      - 80:80    ## listen
      - 81:81    ## admin ui
      - 443:443  ## listen
    volumes:
      - nginx_proxy_data:/data
      - nginx_proxy_encrypt:/etc/letsencrypt
    environment:
        DB_MYSQL_HOST: "mysql-db"
        DB_MYSQL_PORT: 3306
        DB_MYSQL_USER: "${USERNAME}"
        DB_MYSQL_PASSWORD: "${PASSWORD}"
        DB_MYSQL_NAME: "${MYSQL_DB}"
        INITIAL_ADMIN_EMAIL: "${EMAIL}"
        # Uncomment this if IPv6 is not enabled on your host
        # DISABLE_IPV6: 'true'
    depends_on:
      - mysql-db
```

```console
  cloudflare-ddns:
    image: timothyjmiller/cloudflare-ddns:latest
    container_name: cloudflare-ddns
    hostname: cloudflare-ddns
    restart: unless-stopped
    pull_policy: always
    tty: true
    security_opt:
      - no-new-privileges:true
    network_mode: host
    environment:
      - PUID=1000
      - PGID=1000
    volumes:
      - ./ddns-config.json:/config.json
```

```console
  phpmyadmin:
    image: phpmyadmin
    container_name: phpmyadmin
    hostname: phpmyadmin
    restart: unless-stopped    
    pull_policy: always
    tty: true
    ports: 
      - 8979:8979
    volumes:
      - phpmyadmin:/app:/rw
    environment:
      - PMA_ARBITRARY=0
      - PMA_PORT=8990
      - PMA_CONTROLUSER=${USERNAME}
      - PMA_CONTROLPASS=${PASSWORD}
    depends_on:
      - mysql-db
```

```console
  mysql-db:
    image: mysql
    container_name: mysql-db
    hostname: mysql-db
    restart: unless-stopped    
    pull_policy: always
    tty: true
    volumes:
      - mysql:/var/lib/mysql:/rw
    ulimits:
      memlock: -1
    mem_limit: 50gb
    ports:
      - 3306:3306
    expose: 
      - 3306
    environment:
      - MYSQL_ROOT_PASSWORD=${PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DB}
      - MYSQL_USER=${USERNAME}
      - MYSQL_PASSWORD=${PASSWORD}
```

```console
  cf-webpage:
    image: cloudflare/cloudflared:latest
    container_name: cf-webpage
    restart: unless-stopped    
    pull_policy: always
    tty: true
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10" 
    command: tunnel run --no-tls-verify    
    environment:
      TUNNEL_TOKEN: ${CF_WEBPAGE_TOKEN}
```

```console
  rvc:
    image: erebusnyx/rvc-webui:latest
    container_name: rvc
    hostname: rvc
    pull_policy: always
    tty: true
    restart: unless-stopped
    volumes:
      - rvc:/app:/rw
      - rvc-dataset:/app/dataset:/rw
    ports:
      - 7865:7865
    depends_on:
      - ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

```console
  koboldcpp:
    image: koboldai/koboldcpp:latest  
    container_name: koboldcpp
    restart: unless-stopped 
    pull_policy: always   
    tty: true     
    volumes:
      - koboldcpp:/workspace/:rw
    ports:
      - 7860:7680
    environment:
      - KCPP_MODEL=https://huggingface.co/DavidAU/Llama-3.2-8X4B-MOE-V2-Dark-Champion-Instruct-uncensored-abliterated-21B-GGUF/resolve/a09adaf5cafd148ea8084dc095b35e5d07a79ac4/L3.2-8X4B-MOE-V2-Dark-Champion-Inst-21B-uncen-ablit-D_AU-q5_k_m.gguf?download=true # Remove this line if you wish to supply your own model offline
      - KCPP_DONT_REMOVE_MODELS=true
      - KCPP_DONT_UPDATE=false
      - KCPP_DONT_TUNNEL=true
      - KCPP_ARGS=--model model.gguf --skiplauncher --flashattention --usecublas --gpulayers 99 --multiuser 5 --quiet --websearch --threads 8 --contextsize 8192
      - CUDA_DOCKER_ARCH=true
      - LLAMA_PORTABLE=true    
    ulimits:
      memlock: -1
    mem_limit: 50gb
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [ gpu ] 
```

```console
  tika:
    image: apache/tika:latest  
    container_name: tika
    restart: unless-stopped
    pull_policy: always
    tty: true
    ports:
      - 9998:9998
    volumes:
      - tika:/opt/tika:/rw
      - tika-inputs:/opt/tika/inputs:/rw
      - tika-outputs:/opt/tika/outputs:/rw
    depends_on:
      - ollama
```

```console
  sillytavern:
    image: ghcr.io/sillytavern/sillytavern:latest  
    container_name: sillytavern
    restart: unless-stopped
    pull_policy: always
    tty: true
    environment:
       - NODE_ENV=production
       - FORCE_COLOR=1
    ports:
       - 8950:8950
    volumes:
      - sillytavern-config:/home/node/app/config:/rw
      - sillytavern-data:/home/node/app/data:/rw
      - sillytavern-plugins:/home/node/app/plugins:/rw
      - sillytavern-3rdparty:/home/node/app/public/scripts/extensions/third-party:/rw
    depends_on:
      - ollama
```

```console
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped   
    pull_policy: always
    tty: true    
    volumes:
      - ollama:/root/.ollama:/rw
    ports: 
      - 11434:11434
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [ gpu ]  
```

```console
  open-webui:
    image: ghcr.io/open-webui/open-webui:ollama
    container_name: open-webui
    restart: unless-stopped    
    pull_policy: always
    tty: true
    volumes:
      - open-webui:/app/backend/data:/rw
    ulimits:
      memlock: -1
    mem_limit: 50gb
    ports:
      - 8080:8080
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
      - WEBUI_SECRET_KEY=${WEBUI_KEY}
    depends_on:
      - ollama
```

```console
  kokoro-cpu: 
    image: ghcr.io/remsky/kokoro-fastapi-cpu:latest
    container_name: kokoro-cpu
    restart: unless-stopped
    pull_policy: always
    tty: true    
    volumes:
      - kokoro:/app:/rw
      - kokoro-api:/app/api:/rw
      - kokoro-models:/api/src/models/v1_0:/rw
      - kokoro-voices:/api/src/voices/v1_0:/rw
    ports:
      - 5433:5433
    environment:
      - PYTHONPATH=/app:/app/api
      - ONNX_NUM_THREADS=8  
      - ONNX_INTER_OP_THREADS=4  
      - ONNX_EXECUTION_MODE=parallel
      - ONNX_OPTIMIZATION_LEVEL=all
      - ONNX_MEMORY_PATTERN=true
      - ONNX_ARENA_EXTEND_STRATEGY=kNextPowerOfTwo'
    depends_on:
      - ollama
```

```console
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: unless-stopped
    pull_policy: always
    tty: true    
    volumes:
      - portainer-sock:/var/run/docker.sock
      - portainer-data:/data portainer/portainer-ce:lts
    ports:
      -  9001:9001
      -  9443:9443
```

```console
  pipeline:
    image: ghcr.io/open-webui/pipelines:main
    container_name: pipeline
    restart: unless-stopped
    pull_policy: always
    tty: true      
    volumes:
      - pipelines:/app:/rw
    ports:
      - 9099:9099
```

```console
networks:
  default:
    external: true
    name: cloudflare

volumes:
  open-webui: {}        
  ollama: {}                 
  sillytavern-config: {} 
  sillytavern-data: {}
  sillytavern-plugins: {}
  sillytavern-3rdparty: {}
  tika: {}              
  tika-inputs: {}
  tika-outputs: {}
  pipelines: {}         
  kokoro: {}            
  kokoro-api: {}
  kokoro-models: {}
  kokoro-voices: {} 
  portainer-sock: {}     
  portainer-data: {}
  rvc: {}               
  rvc-dataset: {}
  mysql: {}             
  phpmyadmin: {}
  koboldcpp: {}
  nginx_proxy_data: {}
  nginx_proxy_encrypt: {}
  webpage: {}
```

### Not currently in use

```console
  swag_proxy:
    image: lscr.io/linuxserver/swag:latest
    container_name: swag_proxy
    restart: unless-stopped
    pull_policy: always
    tty: true
    cap_add:
      - NET_ADMIN
    ports:
      - '80:80'    ## listen
      - '81:81'    ## admin ui
      - '443:443'  ## listen
    volumes:
      - swag:/config
    environment:
      PUID=1000 
      PGID=1000 
      TZ=America/Chicago
      URL=${DOMAIN}
      VALIDATION=dns
      DNSPLUGIN=cloudflare
      EMAIL= ${EMAIL} 
      ONLY_SUBDOMAINS=false 
      EXTRA_DOMAINS= ${XTRADOMAINS} 
      STAGING=false 
      DOCKER_MODS=linuxserver/mods:universal-package-install
```

```console
  postgres-db:
    restart: always
    hostname: postgres
    image: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data:/rw
    pull_policy: always
    tty: true
    ulimits:
      memlock: -1
    mem_limit: 50gb
    environment:
      - POSTGRES_DB=${MYSQL_DB}
      - POSTGRES_USER=${USERNAME}
      - POSTGRES_PASSWORD=${PASSWORD}
    ports:
      - 5432:5432
    expose: 
      - 5432
    extra_hosts:
     - host.docker.internal:host-gateway
```

```console
  CloudBeaver:
    image: dbeaver/cloudbeaver
    container_name: CloudBeaver
    hostname: CloudBeaver
    pull_policy: always
    tty: true
    volumes:
      - cloudbeaver:/opt/cloudbeaver/workspace:/rw
      - cloudbeaver_certs:/opt/cloudbeaver/conf/certificates:/rw
      - trusted_cacerts:/opt/cloudbeaver/workspace/.data/custom:/rw
    ulimits:
      memlock: -1
    mem_limit: 50gb
    ports:
      - 8978:8978
    deploy:
      replicas: 1
    environment:
      - CLOUDBEAVER_DB_DRIVER=postgres-jdbc
      - CLOUDBEAVER_DB_URL=jdbc:postgresql://postgres:5432/cloudbeaver
      - CLOUDBEAVER_DB_USER=${USERNAME}
      - CLOUDBEAVER_DB_PASSWORD=${PASSWORD}
      - CLOUDBEAVER_DB_SCHEMA=cb
      - CLOUDBEAVER_QM_DB_DRIVER=postgres-jdbc
      - CLOUDBEAVER_QM_DB_URL=jdbc:postgresql://postgres:5432/cloudbeaver
      - CLOUDBEAVER_QM_DB_USER=${USERNAME}
      - CLOUDBEAVER_QM_DB_PASSWORD=${PASSWORD}
      - CLOUDBEAVER_QM_DB_SCHEMA=qm
    extra_hosts:
      - host.docker.internal:host-gateway
    restart: unless-stopped
    depends_on:
      - postgres-db
 
```


### .ENV
```console
CF_WEBPAGE_TOKEN=
CF_API=
WEBUI_KEY=
USERNAME=
PASSWORD=
MYSQL_DB=
EMAIL=
CF_DDNS_API_TOKEN=
CF_DDNS_ZONE_ID=
DOMAIN=
SUBDOMAINS=
```







