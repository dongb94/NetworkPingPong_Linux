#include <iostream>
#include <WinSock2.h>

#pragma comment(lib, "ws2_32.lib")

int main() {
	SOCKET ConnectSocket = INVALID_SOCKET;
	struct addrinfo *ptr = NULL;
	struct sockaddr_in addr;

	addr.sin_family = AF_INET;
	addr.sin_port = htons(80);
	addr.sin_addr.S_un.S_addr = inet_addr("221.144.2.165");

	char sendBuffer[] = "Test Message";
	char recvbuf[256];

	connect(ConnectSocket, (sockaddr*)&addr, sizeof(sockaddr_in));

	printf("%s\n", sendBuffer);

	while (send(ConnectSocket, sendBuffer, 256, 0) == -1) {
		if (errno == EINTR) {
			continue;
		}
		else {
			fprintf(stderr, "Send Error : %s\n", strerror(errno));
			return -1;
		}
	}

	while (recv(ConnectSocket, recvbuf, 256, 0) == -1) {
		if (errno == EINTR) {
			continue;
		}
		else {
			fprintf(stderr, "Recv Error : %s\n", strerror(errno));
			return -1;
		}
	}

	printf("%s\n", recvbuf);
}
