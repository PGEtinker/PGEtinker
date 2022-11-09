#!/bin/sh

# attempt to compile
timeout 10 docker exec pgetinker-builder em++ "$1.cpp" -o "$1.js" -I/src/third-party/olcPixelGameEngine -I/src/third-party/olcPixelGameEngine/extensions -I/src/third-party/olcPixelGameEngine/utilities -I/src/third-party/olcSoundWaveEngine -sASYNCIFY -sALLOW_MEMORY_GROWTH=1 -sMAX_WEBGL_VERSION=2 -sMIN_WEBGL_VERSION=2 -sUSE_LIBPNG=1 -sUSE_SDL_MIXER=2 -sLLD_REPORT_UNDEFINED
