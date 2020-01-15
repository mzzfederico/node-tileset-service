FROM ubuntu:18.04
ENV CI=1

# Installing the JS dependencies
COPY package.json /opt/service/
WORKDIR /opt/service/
# Installing Node v8 for mapnik, carto
RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y build-essential
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash
RUN apt-get install -y nodejs
RUN apt-get install -y git

# Installing style and dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
    ca-certificates curl gnupg postgresql-client python fonts-hanazono \
    fonts-noto-cjk fonts-noto-hinted fonts-noto-unhinted mapnik-utils \
    ttf-unifont unzip && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/gravitystorm/openstreetmap-carto.git ./data/carto
RUN carto ./data/carto/project.mml >./data/carto/mapnik.xml
RUN python ./data/carto/scripts/get-shapefiles.py -n

# Installing project
RUN npm install -g carto
RUN npm install

COPY . /opt/service/
# Running the tests
RUN npm run test

EXPOSE 3000
CMD [ "npm", "start" ]