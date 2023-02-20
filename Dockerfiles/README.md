## Run a container

```
podman run \
	-d -i -t \
	 --privileged \
	--name "<CONTAINER_NAME>" \
	-p 3000:80 \
	-v /dev/pts:/dev/pts \
	-v /shared:/shared \
	<IMAGE_ID>
```


## Parameters

* -d, --detach
	* Run container in background and print container ID
* -i, --interactive
	* Keep STDIN open even if not attached
* -t, --tty
	* Allocate a pseudo-TTY
* --privileged
	* Give extended privileges to this container
* -p
	* Publish a container’s port(s) to the host
* -v, --volume
	* Bind mount a volume