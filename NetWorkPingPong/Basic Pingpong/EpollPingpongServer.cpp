#include <stdio.h>

#include <stdlib.h>

#include <unistd.h>

#include <string.h>

#include <sys/epoll.h>

//#include <arpa/inet.h>

#include <sys/socket.h>

#include <netinet/in.h>

//#include <fcntl.h>

//#include <sys/ioctl.h>

#include <errno.h>

#define PORT				80

#define EPOLL_SIZE       20

int main()
{
	int sock = socket(AF_INET, SOCK_STREAM, 0);
	int conn;

	struct sockaddr_in addr;
	socklen_t len = sizeof(addr);

	struct epoll_event ev;
	struct epoll_event client_ev[EPOLL_SIZE];
	int fd_epoll;
	int nfds;

	char buffer[2048];
	int send_len;
	int recv_len;

	addr.sin_family = AF_INET;
	addr.sin_port = htons(PORT);
	addr.sin_addr.s_addr = htonl(INADDR_ANY);

	if (bind(sock, (struct sockaddr*)&addr, sizeof(addr)) == -1) {
		printf("sock = %d\n", sock);
		printf("sockarr = %d\n", addr.sin_addr.s_addr);
		printf("sock = %d\n", addr.sin_port);
		fprintf(stderr, "Bind Error : %s\n", strerror(errno));
		close(sock);
		return(-1);
	}
	else printf("bind\n");

	if (listen(sock, 10) == -1) {
		printf("listen fail\n");
	}
	else printf("listen\n");

	if (fd_epoll = epoll_create(EPOLL_SIZE) <= 0) {
		printf("epoll create err\n");
	}
	else printf("epoll create\n");
	memset(&ev, 0, sizeof ev);
	ev.events = EPOLLIN | EPOLLERR;
	ev.data.fd = sock;
	epoll_ctl(fd_epoll, EPOLL_CTL_ADD, sock, &ev);
	/*
		for(int i = 0; i<EPOLL_SIZE; i++){
			struct epoll_event cev;
			client_ev[i] = cev;
		}
	*/
	while (1) {
		int i;
		int nfd = epoll_wait(fd_epoll, client_ev, EPOLL_SIZE, 1000);
		if (nfd < 0) {
			fprintf(stderr, "Wait Error : %s\n", strerror(errno));
			return -1;
		}

		for (i = 0; i < nfd; i++) {
			printf("%d", nfd);
			if (client_ev[i].data.fd == sock) {
				struct sockaddr_in clientAddr;

				int client = accept(sock, (struct sockaddr*)&clientAddr, &len);
				if (client < 0) {
					fprintf(stderr, "Accept Error : %s\n", strerror(errno));
					continue;
				}
				memset(&ev, 0, sizeof ev);
				ev.events = EPOLLIN | EPOLLERR;
				ev.data.fd = client;
				epoll_ctl(fd_epoll, EPOLL_CTL_ADD, client, &ev);

			}
			else {
				printf("Listen Event");
				int client = client_ev[i].data.fd;
				if (recv_len = recv(client, buffer, 256, 0) == -1) {
					if (errno == EINTR) {

					}
					else {
						fprintf(stderr, "Recv Error : %s\n", strerror(errno));
						return -1;
					}
				}
				if (send_len = send(client, buffer, 256, 0) == -1) {
					if (errno == EINTR) {

					}
					else {
						fprintf(stderr, "Send Error : %s\n", strerror(errno));
						return -1;
					}
				}
				close(client);
			}
		}
	}
}