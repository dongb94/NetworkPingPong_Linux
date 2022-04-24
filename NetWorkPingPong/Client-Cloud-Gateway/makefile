start :
	make 0.open
	make 1.open
	make 2.open
	make 3.open
	make 4.open
	make 5.open
	make 6.open
	make 7.open
	make 8.open
	make 9.open

%.open : LinuxCloudServer.js
	nohup node LinuxCloudServer.js 400$* 405$* &

close :
	pkill -9 -ef node

restart :
	make close
	make start

test : LinuxCloudServer.js
	node LinuxCloudServer.js 3000 3050 &

log :
	view nohup.out

