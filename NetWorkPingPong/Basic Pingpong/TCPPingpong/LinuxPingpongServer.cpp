#include <stdio.h>

//#include <stdlib.h>

#include <unistd.h>

#include <string.h>

//#include <sys/epoll.h>

//#include <arpa/inet.h>

#include <sys/socket.h>

#include <netinet/in.h>

//#include <fcntl.h>

//#include <sys/ioctl.h>

#include <errno.h>

#define SA  struct sockaddr_in

#define EPOLL_SIZE        20

int main()
{
	const int port = 80;

	int sock = socket(AF_INET, SOCK_STREAM, 0);
	int conn;

	SA addr, clientAddr;
	socklen_t len = sizeof(clientAddr);

	char buffer[2048];
	int send_len;
	int recv_len;

	addr.sin_family = AF_INET;
	addr.sin_port = htons(port);
	addr.sin_addr.s_addr = htonl(INADDR_ANY);

	if (bind(sock, (struct sockaddr*)&addr, sizeof(SA)) == -1) {
		printf("sock = %d\n", sock);
		printf("sockarr = %d\n", addr.sin_addr.s_addr);
		printf("sock = %d\n", addr.sin_port);
		fprintf(stderr, "Bind Error : %s\n", strerror(errno));
		close(sock);
		return(-1);
	}
	else printf("connected\n");

	if (listen(sock, 5) == -1) {
		printf("listen fail\n");
	}

	while (1) {
		conn = accept(sock, (struct sockaddr*)&clientAddr, &len);

		while (recv_len = recv(conn, buffer, 256, 0) == -1) {
			if (errno == EINTR) {
				continue;
			}
			else {
				fprintf(stderr, "Recv Error : %s\n", strerror(errno));
				return -1;
			}
		}

		while (send_len = send(conn, buffer, 256, 0) == -1) {
			if (errno == EINTR) {
				continue;
			}
			else {
				fprintf(stderr, "Send Error : %s\n", strerror(errno));
				return -1;
			}
		}

		close(conn);
	}
}