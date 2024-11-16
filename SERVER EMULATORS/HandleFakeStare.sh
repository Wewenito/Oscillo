#!/bin/bash

PID_FILE=/tmp/container_script_pid.txt

start_script(){
	echo "Please enter the path to the .dat file you wish to upload :"
	read -e FILE_TO_UPLOAD

	if [ ! -f "$FILE_TO_UPLOAD" ]; then
		echo  "File does not exist."
		exit 1
	fi

	FILENAME=$(basename "$FILE_TO_UPLOAD")
	if [[ "$FILENAME" == *.dat ]]; then
		echo "Uploading file to the container-shared folder..."
	        cp "$FILE_TO_UPLOAD" "../SERVER EMULATORS/data/"

        	if [ $? -ne 0 ]; then
                	echo "Failed to upload the file"
                	exit 1
        	fi

		echo "Now starting fakestare with the file provided.."
		docker exec -d oscillo-app python3 "SERVER EMULATORS/fakeStareData.py" -f "SERVER EMULATORS/data/$FILENAME" -c 4 -p 7777

		sleep 2

		PID=$(docker exec oscillo-app sh -c "ps aux | grep 'fakeStareData.py' | grep -v grep | awk '{print \$2}'")

		if [ -z "$PID" ]; then
			echo "Failed to start the script.."
			exit 1
		else
			echo "Script started with PID $PID"
			echo $PID > $PID_FILE
		fi
	else
		echo "The file given is not a .dat file."
		exit 1
	fi
}


stop_script(){
	if [ -f $PID_FILE ]; then
		PID=$(cat $PID_FILE)
		echo "Stopping script with PID $PID inside the container.."
		docker exec oscillo-app kill $PID

		if [ $? -eq 0 ]; then
			echo "Script with PID $PID stopped"
			rm $PID_FILE
			#Also removing the data file from the data folder
			rm ../SERVER\ EMULATORS/data/*
		else
			echo "Failed to stop the script"
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
