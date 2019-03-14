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

int main(int argc, char **argv)
{
	int sock = socket(AF_INET, SOCK_STREAM, 0);
	
	SA addr;

	addr.sin_family = AF_INET;
	addr.sin_port = 6000;
	addr.sin_addr* = INADDR_ANY;

	if(connect(sock, (struct sockaddr*)&addr, sizeof(SA)) == -1){
		fprintf(addr, "cannot connect\n");
		return(-1);
	}else printf("connected\n");
}