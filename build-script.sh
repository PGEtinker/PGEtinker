#!/bin/sh

# make sure emscripten is available
export EMSDK_QUIET=1
source /opt/emsdk/emsdk_env.sh # 2>&1 > /dev/null

# attempt to compile
em++ "$1.cpp" -o "$1.js" -I"$(pwd)/third-party/olcPixelGameEngine" -I"$(pwd)/third-party/olcPixelGameEngine/extensions" -I"$(pwd)/third-party/olcPixelGameEngine/utilities" -I"$(pwd)/third-party/olcSoundWaveEngine" -sASYNCIFY -sALLOW_MEMORY_GROWTH=1 -sMAX_WEBGL_VERSION=2 -sMIN_WEBGL_VERSION=2 -sUSE_LIBPNG=1 -sUSE_SDL_MIXER=2 -sLLD_REPORT_UNDEFINED
