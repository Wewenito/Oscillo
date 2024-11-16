#!/bin/bash

# Prompt for DB container variables
read -p "Enter the root password for the database (default: root): " input
ROOT_PASSWORD=${input:-root}

read -p "Enter the database name (default: CNRS): " input
DB_NAME=${input:-CNRS}

read -p "Enter the database user (default: john): " input
DB_USER=${input:-john}

read -p "Enter the database password (default: supersecretpassword): " input
DB_PASSWORD=${input:-supersecretpassword}

read -p "Enter the database port (default: 3308): " input
DB_PORT=${input:-3308}

echo ""
echo ""

echo "The following settings will be used for the database container:"
echo "Root password: $ROOT_PASSWORD"
echo "Database name: $DB_NAME"
echo "Database user: $DB_USER"
echo "Database password: $DB_PASSWORD"
echo "Database port: $DB_PORT"
echo ""

read -n 1 -s -r -p "Press any key to continue"
echo ""

echo "Installing docker.."
if ! command -v docker &> /dev/null
then
    echo "Docker not found, installing..."
    sudo apt-get update
    sudo apt-get install -y docker.io
else
    echo "Docker is already installed"
fi

echo ""

echo "Starting the database container.."

docker run --name mysql -e MYSQL_ROOT_PASSWORD=$ROOT_PASSWORD \
    -e MYSQL_DATABASE=$DB_NAME -e MYSQL_USER=$DB_USER -e MYSQL_PASSWORD=$DB_PASSWORD\
    -p $DB_PORT:3306 -d mysql:8.0

echo ""
echo "Verifying the database container is running.."
sleep 10

if [ "$(docker inspect -f '{{.State.Running}}' mysql)" == "true" ]; then
    echo "Database container is running successfully."
else
    echo "Error: Database container failed to start."
    docker logs mysql
    exit 1
fi  

# Get the IP address of the database container
DB_CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mysql)
if [ -z "$DB_CONTAINER_IP" ]; then
    echo "Error: Unable to retrieve the database container's IP address."
    exit 1
fi
echo "Database container IP: $DB_CONTAINER_IP"

echo ""

echo "Building the oscillo-app image.."

if docker build -t oscillo-app .; then
    echo "Image built successfully."
else
    echo "Error: Image failed to build."
    exit 1
fi

echo "Starting the oscillo-app container..."
docker run --name oscillo-app --link mysql:mysql \
    -e DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@$DB_CONTAINER_IP:3306/$DB_NAME" \
    -e DB_HOST=$DB_CONTAINER_IP -e DB_NAME=$DB_NAME -e DB_USER=$DB_USER -e DB_PASSWORD=$DB_PASSWORD -e DB_PORT=3306 \
    -p 8000:8000 -d oscillo-app


if [ "$(docker inspect -f '{{.State.Running}}' oscillo-app)" == "true" ]; then
    echo "oscillo-app is running successfully."
else
    echo "Error: oscillo-app failed to start."
    docker logs oscillo-app
    exit 1
fi

echo ""
echo ""

echo "Setup complete. oscillo-app is now running at http://localhost:8000"
