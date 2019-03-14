#include <stdio.h>

#include <stdlib.h>

#include <unistd.h>

#include <string.h>

#include <sys/epoll.h>

#include <arpa/inet.h>

#include <sys/socket.h>

#include <netinet/in.h>

#include <fcntl.h>

#include <sys/ioctl.h>

#define SA  struct sockaddr_in

#define EPOLL_SIZE        20

int main()
{
	const int port = 80;

	int sock = socket(AF_INET, SOCK_STREAM, 0);
	int conn;

	SA addr, clientAddr;
	socklen_t len = sizeof(clientAddr);

	addr.sin_family = AF_INET;
	addr.sin_port = htons(port);
	addr.sin_addr.s_addr = htonl(INADDR_ANY);

	if (bind(sock, (struct sockaddr*)&addr, sizeof(SA)) == -1) {
		printf("sock = %d\n", sock);
		printf("sockarr = %d\n", addr.sin_addr.s_addr);
		printf("sock = %d\n", addr.sin_port);
		printf("cannot connect\n");
		close(sock);
		return(-1);
	}
	else printf("connected\n");

	if (listen(sock, 5) == -1) {
		printf("listen fail");
	}

	while (1) {
		conn = accept(sock, (struct sockaddr*)&clientAddr, &len);
		printf("is conn?");
		close(conn);
	}
}