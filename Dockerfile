FROM nginx
MAINTAINER jeecgos@163.com
#VOLUME /tmp
ENV LANG en_US.UTF-8
RUN echo "server {  \
                  listen       80; \
                  server_name  localhost;\
                  \
                  gzip on;\
                  gzip_types application/javascript text/plain application/json application/x-javascript text/css application/xml;\
                  gzip_vary on;\
                  gzip_comp_level 5;\
                  gzip_min_length 1k;\
                  \
                  #解决Router(mode: 'history')模式下，刷新路由地址不能找到页面的问题 \
                  location / { \
                     root   /var/www/html/; \
                      index  index.html index.htm; \
                      if (!-e \$request_filename) { \
                          rewrite ^(.*)\$ /index.html?s=\$1 last; \
                          break; \
                      } \
                  } \
                  \
                  error_page   500 502 503 504  /50x.html;\
                  location = /50x.html {\
                      root   /var/www/html;\
                  }\
                  \
                  access_log  /var/log/nginx/access.log ; \
              } " > etc/nginx/conf.d/default.conf \
    &&  mkdir  -p  /var/www \
    &&  mkdir -p /var/www/html

ADD dist/ /var/www/html/
EXPOSE 80
EXPOSE 443