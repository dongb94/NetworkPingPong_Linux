i=0
while [ ${i} -le 30 ]; do
	j=`expr 4000 + ${i}`
	k=`expr 50 + ${j}`
	node nodeJsRepeater.js ${j} ${k} &
	i=`expr ${i} + 1`
done