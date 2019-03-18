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

	SA addr;

	char buffer[2048];
	int recv_len;

	addr.sin_family = AF_INET;
	addr.sin_port = htons(port);
	addr.sin_addr.s_addr = htonl(INADDR_ANY);

	if (connect(sock, (struct sockaddr*)&addr, sizeof(SA)) == -1) {
		printf("sock = %d\n", sock);
		printf("sockarr = %d\n", addr.sin_addr.s_addr);
		printf("sock = %d\n", addr.sin_port);
		printf("cannot connect\n");
		return(-1);
	}
	else printf("connected\n");

	for (int i = 0; i < 50; i++) {
		for (int j = 0; j < 5; j++, i++)
			buffer[i] = 'a' + j;
	}

	if (send(sock, buffer, 256, 0) == -1) {
		printf("send fail\n");
	}
	if (recv_len = recv(sock, buffer, 256, 0) == -1) {
		printf("client wait\n");
	}

	printf("%s\n", buffer);
}