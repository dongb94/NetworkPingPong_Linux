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

#include <errno.h>

#define SA  struct sockaddr_in

#define EPOLL_SIZE        20

int main()
{
	const int port = 80;

	int sock = socket(AF_INET, SOCK_STREAM, 0);

	SA addr;

	char buffer[2048];
	int recv_len;
	int send_len;

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

	for (int i = 0; i < 50;) {
		for (int j = 0; j < 5; j++, i++)
			buffer[i] = 'a' + j;
	}
	printf("%s\n", buffer);

	while (send_len = send(sock, buffer, 256, 0) == -1) {
		if (errno == EINTR) {
			continue;
		}
		else {
			fprintf(stderr, "Send Error : %s\n", strerror(errno));
			return -1;
		}
	}

	while (recv_len = recv(sock, buffer, 256, 0) == -1) {
		if (errno == EINTR) {
			continue;
		}
		else {
			fprintf(stderr, "Recv Error : %s\n", strerror(errno));
			return -1;
		}
	}

	printf("%s\n", buffer);
}