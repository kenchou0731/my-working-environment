# syntax=docker/dockerfile:1

FROM docker.io/kenchou0731/workspace:deb11-1

# Update APT repo
RUN apt-get update -qqy \
  && apt-get install -qqy \
  devscripts quilt \
  autoconf automake libtool cmake

# Set Locale to "en_US.UTF-8" to avoid warnings
RUN apt-get install -qqy locales \
  && sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
  && locale-gen
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

# Export HTTP port
EXPOSE 80
