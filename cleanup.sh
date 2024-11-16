#!/bin/bash

docker stop mysql
docker stop oscillo-app

docker rm mysql
docker rm oscillo-app

docker rmi mysql:8.0
docker rmi oscillo-app


echo "RESULT"

docker ps -a
docker images
