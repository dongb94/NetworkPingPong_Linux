#include <iostream>
#include <WinSock2.h>

#pragma comment(lib, "ws2_32.lib")

int main() {
	WSADATA       wsaData;                                                     //WinSock을 위한 내부 자료구조

	SOCKET ConnectSocket;

	if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
	{
		printf("error\r\n");
		return 0;
	}

	ConnectSocket = socket(AF_INET, SOCK_STREAM, 0);
	if (ConnectSocket == INVALID_SOCKET) {
		printf("error opening socket %d\n", ConnectSocket);
	}
	struct sockaddr_in addr;

	addr.sin_family = AF_INET;
	addr.sin_port = htons(80);
	addr.sin_addr.S_un.S_addr = inet_addr("221.144.2.165");
	//addr.sin_addr.S_un.S_addr = inet_addr("8.8.8.8");

	char sendBuffer[] = "Test Message";
	char recvbuf[256];

	if (connect(ConnectSocket, (sockaddr*)&addr, sizeof(sockaddr_in)) == -1) {

		WSACleanup();
		printf("Error No = %d\n", errno);
		fprintf(stderr, "C Error : %s\n", strerror(errno));
	}

	printf("%s\n", sendBuffer);

	while (send(ConnectSocket, sendBuffer, 256, 0) == -1) {
		if (errno == EINTR) {
			continue;
		}
		else {
			printf("Error No = %d\n", errno);
			fprintf(stderr, "Send Error : %s\n", strerror(errno));
			WSACleanup();
			return -1;
		}
	}

	while (recv(ConnectSocket, recvbuf, 256, 0) == -1) {
		if (errno == EINTR) {
			continue;
		}
		else {
			fprintf(stderr, "Recv Error : %s\n", strerror(errno));
			WSACleanup();
			return -1;
		}
	}

	WSACleanup();

	printf("%s\n", recvbuf);
}
