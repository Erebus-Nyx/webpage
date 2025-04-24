# syntax=docker/dockerfile:1

FROM nginx:latest

COPY ./assets /usr/share/nginx/html/assets
COPY ./cdn-cgi /usr/share/nginx/html/cdn-cgi
COPY ./pages /usr/share/nginx/html/pages
COPY ./index.html /usr/share/nginx/html/index.html
EXPOSE 80
EXPOSE 443



