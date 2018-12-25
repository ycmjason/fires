FROM ubuntu:trusty

RUN apt update
RUN apt install -y curl build-essential git
RUN curl -L https://git.io/n-install | bash -s -- -y
ENV PATH "/root/n/bin:$PATH"
RUN n 8

COPY . /firecracker
 
WORKDIR /firecracker

RUN rm -rf node_modules

RUN npm install
 
CMD npm test
