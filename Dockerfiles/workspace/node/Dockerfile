# syntax=docker/dockerfile:1

FROM docker.io/library/node:19.7.0-bullseye

# Update APT repo
RUN apt-get update -qqy \
  && apt-get install -qqy apt-utils \
  wget vim git bash-completion

# Settings
RUN echo "source /etc/bash_completion" >> /root/.bashrc
COPY gtree /usr/sbin/gtree
COPY vimrc /root/.vimrc
COPY gitconfig /root/.gitconfig

# Export HTTP port
EXPOSE 80
