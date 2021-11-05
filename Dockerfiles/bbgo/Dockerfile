FROM debian:bullseye

# Install needed packages
RUN apt-get update -qqy
RUN apt-get install -qqy apt-utils
RUN apt-get install -qqy wget vim git

# Set Locale to "en_US.UTF-8" to avoid warnings
RUN apt-get install -qqy locales
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen
RUN locale-gen
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# Install bbgo v1.15.4
RUN wget https://github.com/c9s/bbgo/releases/download/v1.15.4/bbgo-v1.15.4-linux-amd64.tar.gz
RUN tar xzf bbgo-v1.15.4-linux-amd64.tar.gz
RUN mv bbgo-linux-amd64 bbgo

# Install & config SSH server to let root login
RUN apt-get install -qqy openssh-server
RUN mkdir -p /var/run/sshd
RUN echo 'root:12345' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Copy config files
COPY dot_vimrc /root/.vimrc
COPY gitconfig /root/.gitconfig

# Export SSH port & HTTP port
EXPOSE 22 80
CMD ["/usr/sbin/sshd", "-D"]
