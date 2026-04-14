FROM nginx

WORKDIR /usr/share/nginx/html

ARG ADIF_URL
ENV ADIF_URL=${ADIF_URL}
ARG TITLE
ENV TITLE=${TITLE}
ARG BRAND
ENV BRAND=${BRAND}

COPY . /usr/share/nginx/html

RUN bash scripts/build.sh