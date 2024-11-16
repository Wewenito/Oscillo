#!/bin/bash

PID_FILE=/tmp/container_script_pid.txt

start_script(){
	docker exec -d oscillo-app python3 SERVER\ EMULATORS/fakeStareData.py -c 4 -p 7777 -d 100

	sleep 2
	PID=$(docker exec oscillo-app sh -c "ps aux | grep 'SERVER\ EMULATORS/fakeStareData.py' | grep -v grep | awk '{print \$2}'")

	if [ -z "$PID" ]; then
		echo "Failed to start the script."
		exit 1
	else
		echo "Script started with PID $PID"
		echo $PID > $PID_FILE
	fi
}

stop_script(){
	if [ -f $PID_FILE ]; then
		PID=$(cat $PID_FILE)
		docker exec oscillo-app kill $PID
		if [ $? -eq 0 ]; then
			echo "Script with PID $PID stopped."
			rm $PID_FILE
		else
			echo "Failed to stop the script."
		fi
	else
		echo "PID file not found. Is the script running ?"
	fi
}

case "$1" in
	start)
		start_script
		;;
	stop)
		stop_script
		;;
	*)
		echo "Usage: $0 {start|stop}"
		exit 1
		;;
esac
