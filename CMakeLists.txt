cmake_minimum_required(VERSION 3.17)
project(allegro5Tutorial)

set(CMAKE_CXX_STANDARD 20)

add_executable(allegro5Tutorial main.cpp)
target_link_libraries(allegro5Tutorial -lmingw32 -lallegro-5.0.10-monolith-md-debug)