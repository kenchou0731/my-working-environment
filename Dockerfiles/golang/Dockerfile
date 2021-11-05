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

# Install Go v 1.16.7
RUN wget https://golang.org/dl/go1.16.7.linux-amd64.tar.gz
RUN tar -xzf go1.16.7.linux-amd64.tar.gz -C /usr/local/
RUN echo "export PATH=$PATH:/usr/local/go/bin" >> /root/.bashrc
RUN echo "export GOPATH=~/.go" >> /root/.bashrc

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

