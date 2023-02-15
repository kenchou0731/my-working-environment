# syntax=docker/dockerfile:1

FROM debian:11.6

# Update APT repo
RUN apt-get update -qqy \
  && apt-get install -qqy apt-utils \
  wget vim git bash-completion \
  devscripts quilt \
  autoconf automake libtool cmake \
  build-essential pkg-config

# Set Locale to "en_US.UTF-8" to avoid warnings
RUN apt-get install -qqy locales \
  && sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
  && locale-gen
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# Install needed packages

RUN echo "source /etc/bash_completion" >> /root/.bashrc
COPY gtree /usr/sbin/gtree
COPY vimrc /root/.vimrc
COPY gitconfig /root/.gitconfig

# Export HTTP port
EXPOSE 80
