FROM debian:buster

# Update APT repo
RUN apt-get update -qqy
RUN apt-get install -qqy apt-utils

# Set Locale to "en_US.UTF-8" to avoid warnings
RUN apt-get install -qqy locales
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen
RUN locale-gen
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# Install needed packages
RUN apt-get install -qqy wget vim git
RUN apt-get install -qqy devscripts quilt
RUN apt-get install -qqy autoconf automake libtool
RUN apt-get install -qqy build-essential pkg-config

# Install & config SSH server to let root login
RUN apt-get install -qqy openssh-server
RUN mkdir -p /var/run/sshd
RUN echo 'root:12345' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Export SSH port & HTTP port
EXPOSE 22 80
CMD ["/usr/sbin/sshd", "-D"]
