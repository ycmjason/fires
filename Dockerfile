FROM node:8

COPY . /firecracker
 
WORKDIR /firecracker

RUN npm install
 
CMD npm test
