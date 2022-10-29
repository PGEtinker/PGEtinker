FROM emscripten/emsdk:3.1.24

RUN embuilder build zlib libpng sdl2_mixer

CMD ["sh", "-c", "tail -f /dev/null"]