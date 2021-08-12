FROM composer:2 AS composer

FROM php:8-cli-buster

# See https://jtreminio.com/blog/running-docker-containers-as-current-host-user/ for user permissions issues
ARG USER_ID=${USER_ID:-1000}
ARG GROUP_ID=${GROUP_ID:-1000}
ARG PROJECT_DIR='/app'
ARG PHP_EXTENSIONS='bcmath zip intl mbstring'

ENV PROJECT_DIR=${PROJECT_DIR}

COPY --from=composer /usr/bin/composer /usr/bin/composer

############ Set up base environment ############
RUN set -xe; \
    deluser www-data; \
    addgroup --gid ${GROUP_ID} --system www-data; \
    adduser --uid ${USER_ID} --disabled-password --system --ingroup www-data www-data; \
    rm /etc/localtime && ln -s /usr/share/zoneinfo/America/Los_Angeles /etc/localtime && "date"; \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -; \
    apt-get update && apt-get install -y --no-install-recommends build-essential python2.7 jq zip unzip sudo gnupg wget libzip-dev git libicu-dev libonig-dev nodejs; \
    docker-php-ext-install ${PHP_EXTENSIONS}; \
    mkdir ${PROJECT_DIR} && chown -R www-data:www-data ${PROJECT_DIR}/; \
    # cleanup
    apt-get clean; \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* || true

USER www-data

COPY --chown=www-data ./ ${PROJECT_DIR}/
WORKDIR ${PROJECT_DIR}