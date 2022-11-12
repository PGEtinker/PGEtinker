docker stop pgetinker-builder
docker rm pgetinker-builder

docker build -t pgetinker-builder .
docker run -d --name pgetinker-builder -v "$(pwd)/public/data":/src/data -v "$(pwd)/third-party":/src/third-party -u "$(id -u)":"$(id -g)" -it pgetinker-builder:latest