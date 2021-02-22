cmake_minimum_required(VERSION 3.17)
project(allegroRebotes)
project(allegroAsteroides)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_EXE_LINKER_FLAGS "-static-libgcc -static-libstdc++")

add_executable(allegroRebotes main.cpp)
target_link_libraries(allegroRebotes -lmingw32 -lallegro-5.0.10-monolith-md-debug)

add_executable(allegroAsteroides asteroides.cpp)
target_link_libraries(allegroAsteroides -lmingw32 -lallegro-5.0.10-monolith-md-debug)