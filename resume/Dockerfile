FROM mcr.microsoft.com/playwright:bionic

ARG USER_ID=${USER_ID:-1000}
ARG GROUP_ID=${GROUP_ID:-1000}
ARG PROJECT_DIR='/app'

ENV PROJECT_DIR=${PROJECT_DIR}

# RUN set -xe; \
    # groupmod -g ${GROUP_ID} node; \
    # usermod -u ${USER_ID} -g ${GROUP_ID} node; \
    # rm /etc/localtime && ln -s /usr/share/zoneinfo/America/Los_Angeles /etc/localtime && "date"; \
    # mkdir ${PROJECT_DIR} && chown node:node ${PROJECT_DIR}; \
    # apt-get update && apt-get install -y --no-install-recommends xfonts-base xfonts-75dpi phantomjs; \
    # wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_amd64.deb; \
    # dpkg -i wkhtmltox_0.12.6-1.buster_amd64.deb; \
    # cleanup
    # apt-get clean; \
    # rm wkhtmltox_0.12.6-1.buster_amd64.deb; \
    # rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* || true

VOLUME ${PROJECT_DIR}
WORKDIR ${PROJECT_DIR}